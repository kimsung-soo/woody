// server/services/production_service.js
const mapper = require("../database/mapper");

/* 공통 페이지 파라미터 */
function pageParam(q) {
  const page = Math.max(parseInt(q.page || "1", 10), 1);
  const size = Math.max(parseInt(q.size || "10", 10), 1);
  return { page, size, limit: size, offset: (page - 1) * size };
}

/* =========================
 * 제품 목록
 * - sql key: production.selectProducts / production.countProducts
 * ========================= */
async function getProducts({ kw = "", page = 1, size = 10 }) {
  const { limit, offset } = pageParam({ page, size });
  const like = `%${kw}%`;
  const rows = await mapper.query("production.selectProducts", [
    kw,
    like,
    like,
    limit,
    offset,
  ]);
  const cnt = await mapper.query("production.countProducts", [kw, like, like]);
  return { rows, total: cnt[0]?.cnt || 0 };
}

/* =========================
 * 생산의뢰 목록
 * - sql key: production.selectRequests / production.countRequests
 * ========================= */
async function getRequests({ kw = "", page = 1, size = 10 }) {
  const { limit, offset } = pageParam({ page, size });
  const like = `%${kw}%`;
  const rows = await mapper.query("production.selectRequests", [
    kw,
    like,
    like,
    like,
    limit,
    offset,
  ]);
  const cnt = await mapper.query("production.countRequests", [
    kw,
    like,
    like,
    like,
  ]);
  return { rows, total: cnt[0]?.cnt || 0 };
}

/* =========================
 * 생산계획 저장 (일반 쿼리)
 * - sql key:
 *   production.insertPlan
 *   production.selectPlanByNo
 *   production.insertPlanItem
 * ========================= */
async function savePlan(body) {
  const f = body?.form || {};
  const selected = body?.selectedReqs || [];

  if (!f.issueNumber || !f.orderDate || !f.productCode) {
    throw new Error("필수 값 누락(계획번호/계획명/제품코드)");
  }

  // 1) 헤더 저장
  await mapper.query("production.insertPlan", [
    f.issueNumber,
    f.orderDate, // plan_name
    f.contact || null, // writer
    f.orderNo || null, // order_no
    f.dueDate || null, // created_date
    f.dueDate2 || null, // due_date
    Number(f.targetQty || 0), // total_qty
    f.productCode,
    f.productName || "",
    f.productType || "완제품",
    f.memo || null,
  ]);

  // 2) plan id 조회
  const planRow = await mapper.query("production.selectPlanByNo", [
    f.issueNumber,
  ]);
  const planId = planRow?.[0]?.id;
  if (!planId) throw new Error("계획 저장 실패(planId 없음)");

  // 3) 라인 저장
  for (const r of selected) {
    await mapper.query("production.insertPlanItem", [
      planId,
      r.id,
      Number(r.totalQty || 0),
    ]);
  }

  return { planId, planNo: f.issueNumber };
}

/* =========================
 * 생산계획 목록 (프로시저)
 * - sp key: production.sp.selectPlans / production.sp.countPlans
 * ========================= */
async function getPlans({ kw = "", page = 1, size = 10 }) {
  const { limit, offset } = pageParam({ page, size });
  const r1 = await mapper.query("production.sp.selectPlans", [
    kw,
    limit,
    offset,
  ]);
  const list = Array.isArray(r1) ? (Array.isArray(r1[0]) ? r1[0] : r1) : [];

  const r2 = await mapper.query("production.sp.countPlans", [kw]);
  const cntRow = Array.isArray(r2)
    ? Array.isArray(r2[0])
      ? r2[0][0]
      : r2[0]
    : null;
  const total = cntRow?.cnt ? Number(cntRow.cnt) : 0;

  return { rows: list, total };
}

/* =========================
 * 생산계획 수정 (프로시저)
 * - sp key: production.sp.updatePlan
 * - 프론트는 createdDate / dueDate로 보냄 (yyyy-MM-dd)
 * ========================= */
async function updatePlan(id, body = {}) {
  const f = body || {};
  const createdDate = (f.createdDate || "").substring(0, 10) || null;
  const dueDate = (f.dueDate || "").substring(0, 10) || null;

  const res = await mapper.query("production.sp.updatePlan", [
    Number(id),
    f.planName || "",
    f.productCode || "",
    createdDate, // DATE
    f.writer || "",
    dueDate, // DATE
    Number(f.totalQty || 0),
    f.memo || null,
  ]);

  const affected = Array.isArray(res?.[0])
    ? res[0][0]?.affected
    : res?.[0]?.affected || 0;

  return { affected };
}

/* =========================
 * 생산계획 삭제 (프로시저)
 * - sp key: production.sp.deletePlans
 * - ids 배열 → CSV 문자열로 변환하여 전달
 * ========================= */
async function deletePlans(ids = []) {
  const onlyNums = (Array.isArray(ids) ? ids : [])
    .map((v) => String(v).trim())
    .filter((v) => /^\d+$/.test(v));

  if (!onlyNums.length) return { affected: 0 };
  const csv = onlyNums.join(",");

  const res = await mapper.query("production.sp.deletePlans", [csv]);

  const affected = Array.isArray(res?.[0])
    ? res[0][0]?.affected
    : res?.[0]?.affected || 0;

  return { affected };
}

/* =========================================================
 *                 작업지시(Work Orders)
 * ========================================================= */

/* 작업지시 생성
   - orderName이 비어있고 planIds가 있으면 계획명들을 join해서 자동 채움
   - sql key:
     workorder.sp.create
     workorder.selectPlanNamesInCsv (선택)
*/
async function createWorkOrder(body = {}) {
  const f = body?.form || {};
  const selectedPlanIds = body?.selectedPlanIds || []; // [1,2,3]

  if (!f.issueNumber) throw new Error("지시번호가 없습니다.");
  if (!f.orderDate) throw new Error("지시일자를 입력하세요.");
  if (!f.writer && !f.contact) throw new Error("작성자를 입력하세요.");
  if (!f.productCode || !f.productName) throw new Error("제품을 선택하세요.");
  if (!f.dueDate) throw new Error("납기일자를 입력하세요.");

  const csv = (selectedPlanIds || [])
    .map((v) => String(v).trim())
    .filter((v) => /^\d+$/.test(v))
    .join(",");

  // 지시명 자동 채움 (프런트에서 채워오지 않았다면)
  let orderName = (f.orderName || "").trim();
  if (!orderName && csv) {
    const r = await mapper.query("workorder.selectPlanNamesInCsv", [csv]);
    const row = Array.isArray(r) ? r[0] : r?.[0];
    orderName = row?.names || "";
  }

  const res = await mapper.query("workorder.sp.create", [
    f.issueNumber, // wo_no
    orderName || null, // wo_name
    (f.orderDate || "").substring(0, 10) || null, // wo_date
    f.writer || f.contact || "", // writer
    f.productCode || "", // product_code
    f.productName || "", // product_name
    (f.dueDate || "").substring(0, 10) || null, // due_date
    Number(f.targetQty || 0), // target_qty
    csv || null, // plan_ids_csv
    f.memo || null, // memo
  ]);

  // CALL 결과: [[{ id: X }], meta] or [{ id: X }]
  const woId = Array.isArray(res?.[0]) ? res[0][0]?.id : res?.[0]?.id;
  return { woId, woNo: f.issueNumber };
}

/* 작업지시 목록
   - sql key: workorder.sp.select / workorder.sp.count
*/
async function getWorkOrders({ kw = "", page = 1, size = 10 }) {
  const { limit, offset } = pageParam({ page, size });
  const r1 = await mapper.query("workorder.sp.select", [kw, limit, offset]);
  const rows = Array.isArray(r1?.[0]) ? r1[0] : Array.isArray(r1) ? r1 : [];
  const r2 = await mapper.query("workorder.sp.count", [kw]);
  const cntRow = Array.isArray(r2?.[0]) ? r2[0][0] : r2?.[0];
  return { rows, total: Number(cntRow?.cnt || 0) };
}

/* 작업지시 수정
   - sql key: workorder.sp.update
   - 파라미터: (id, orderName, orderDate, contact, productCode, productName, dueDate, targetQty, memo)
*/
async function updateWorkOrder(id, body = {}) {
  const f = body || {};
  const res = await mapper.query("workorder.sp.update", [
    Number(id),
    f.orderName || null,
    (f.orderDate || "").substring(0, 10) || null,
    f.contact || "",
    f.productCode || "",
    f.productName || "",
    (f.dueDate || "").substring(0, 10) || null,
    Number(f.targetQty || 0),
    f.memo || null,
  ]);
  const affected = Array.isArray(res?.[0])
    ? res[0][0]?.affected
    : res?.[0]?.affected || 0;
  return { affected };
}

/* 작업지시 삭제
   - sql key: workorder.sp.delete
*/
async function deleteWorkOrders(ids = []) {
  const onlyNums = (Array.isArray(ids) ? ids : [])
    .map((v) => String(v).trim())
    .filter((v) => /^\d+$/.test(v));
  if (!onlyNums.length) return { affected: 0 };

  const csv = onlyNums.join(",");
  const res = await mapper.query("workorder.sp.delete", [csv]);
  const affected = Array.isArray(res?.[0])
    ? res[0][0]?.affected
    : res?.[0]?.affected || 0;
  return { affected };
}

module.exports = {
  // 제품/의뢰/계획
  getProducts,
  getRequests,
  savePlan,
  getPlans,
  updatePlan,
  deletePlans,
  // 작업지시
  createWorkOrder,
  getWorkOrders,
  updateWorkOrder,
  deleteWorkOrders,
};
