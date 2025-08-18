// server/sqls/production.js
module.exports = {
  /* =========================
   * 제품 목록 / 카운트
   * 파라미터(서비스 호출 순서)
   *  - selectProducts: [kw, like, like, limit, offset]
   *  - countProducts : [kw, like, like]
   * ========================= */
  "production.selectProducts": `
    SELECT
      p.code       AS code,
      p.name       AS name,
      p.type       AS type,
      p.uom        AS uom,
      p.spec       AS spec,
      IFNULL(p.stock, 0) AS stock
    FROM products p
    WHERE (? = '' OR p.code LIKE ? OR p.name LIKE ?)
    ORDER BY p.code
    LIMIT ? OFFSET ?
  `,
  "production.countProducts": `
    SELECT COUNT(*) AS cnt
    FROM products p
    WHERE (? = '' OR p.code LIKE ? OR p.name LIKE ?)
  `,

  /* =========================
   * 생산의뢰 목록 / 카운트
   * 파라미터(서비스 호출 순서)
   *  - selectRequests: [kw, like, like, like, limit, offset]
   *  - countRequests : [kw, like, like, like]
   * 컬럼 별칭은 프런트 그리드 컬럼에 맞춤.
   * ========================= */
  "production.selectRequests": `
    SELECT
      r.req_no         AS reqNo,
      r.order_no       AS orderNo,
      r.product_code   AS productCode,
      r.product_name   AS productName,
      r.product_type   AS productType,
      DATE_FORMAT(r.created_at, '%Y-%m-%d %H:%i') AS createdAt,
      r.writer         AS writer,
      r.total_qty      AS totalQty,
      DATE_FORMAT(r.due_date, '%Y-%m-%d') AS dueDate,
      r.id             AS id
    FROM production_requests r
    WHERE (? = ''
       OR r.req_no       LIKE ?
       OR r.order_no     LIKE ?
       OR r.product_name LIKE ?)
    ORDER BY r.id DESC
    LIMIT ? OFFSET ?
  `,
  "production.countRequests": `
    SELECT COUNT(*) AS cnt
    FROM production_requests r
    WHERE (? = ''
       OR r.req_no       LIKE ?
       OR r.order_no     LIKE ?
       OR r.product_name LIKE ?)
  `,

  /* =========================
   * 생산계획 저장 관련 (일반쿼리)
   * savePlan()에서 사용
   * 파라미터(서비스 호출 순서)
   *  - insertPlan: [plan_no, plan_name, writer, order_no, created_date, due_date, total_qty, product_code, product_name, product_type, memo]
   *  - selectPlanByNo: [plan_no]
   *  - insertPlanItem: [plan_id, request_id, qty]
   * ========================= */
  "production.insertPlan": `
    INSERT INTO production_plans
      (plan_no, plan_name, writer, order_no, created_date, due_date, total_qty,
       product_code, product_name, product_type, memo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  "production.selectPlanByNo": `
    SELECT id, plan_no
    FROM production_plans
    WHERE plan_no = ?
    LIMIT 1
  `,
  "production.insertPlanItem": `
    INSERT INTO production_plan_items
      (plan_id, request_id, qty)
    VALUES (?, ?, ?)
  `,

  /* =========================
   * 생산계획 목록/수정/삭제 (프로시저)
   * ========================= */
  "production.sp.selectPlans": "CALL dev.sp_select_plans(?, ?, ?)", // ← dev 스키마로 고정
  "production.sp.countPlans": "CALL dev.sp_count_plans(?)",
  "production.sp.updatePlan": "CALL dev.sp_update_plan(?, ?, ?, ?, ?, ?, ?, ?)",
  "production.sp.deletePlans": "CALL dev.sp_delete_plans(?)",

  // Work Orders (SP)
  "workorder.sp.create":
    "CALL dev.sp_create_work_order(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  "workorder.sp.select": "CALL dev.sp_select_work_orders(?, ?, ?)",
  "workorder.sp.count": "CALL dev.sp_count_work_orders(?)",
  "workorder.sp.update":
    "CALL dev.sp_update_work_order(?, ?, ?, ?, ?, ?, ?, ?, ?)",
  "workorder.sp.delete": "CALL dev.sp_delete_work_orders(?)",

  // 선택된 계획 CSV → 계획명 join (지시명 자동 채움 보조)
  "workorder.selectPlanNamesInCsv":
    "SELECT GROUP_CONCAT(plan_name ORDER BY id SEPARATOR ', ') AS names FROM production_plans WHERE FIND_IN_SET(id, ?)",
};
