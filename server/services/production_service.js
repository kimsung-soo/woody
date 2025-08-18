// server/services/production_service.js
const mapper = require("../database/mapper");

// 공통 페이지 파라미터
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
 * - CALL 결과 모양(r[0] 또는 r)을 모두 안전 처리
 * ========================= */
async function getPlans({ kw = "", page = 1, size = 10 }) {
  const { limit, offset } = pageParam({ page, size });
  const like = `${kw}`;

  const r1 = await mapper.query("production.sp.selectPlans", [
    like,
    limit,
    offset,
  ]);
  const list = Array.isArray(r1) ? (Array.isArray(r1[0]) ? r1[0] : r1) : [];

  const r2 = await mapper.query("production.sp.countPlans", [like]);
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

  // CALL 결과: [ [ { affected: n } ], meta ] 형태일 수 있음
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

  // CALL 결과: [ [ { affected: n } ], meta ] 형태일 수 있음
  const affected = Array.isArray(res?.[0])
    ? res[0][0]?.affected
    : res?.[0]?.affected || 0;

  return { affected };
}

module.exports = {
  getProducts,
  getRequests,
  savePlan,
  getPlans,
  updatePlan,
  deletePlans,
};
