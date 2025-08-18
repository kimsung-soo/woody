// server/routers/production_router.js
// commit
const express = require("express");
const router = express.Router();
const svc = require("../services/production_service");

/* ---------- 제품 목록 ---------- */
router.get("/products", async (req, res, next) => {
  try {
    const { kw = "", page = 1, size = 10 } = req.query;
    const data = await svc.getProducts({ kw, page, size });
    res.json({ ok: true, ...data });
  } catch (err) {
    next(err);
  }
});

/* ---------- 생산의뢰 목록 ---------- */
router.get("/requests", async (req, res, next) => {
  try {
    const { kw = "", page = 1, size = 10 } = req.query;
    const data = await svc.getRequests({ kw, page, size });
    res.json({ ok: true, ...data });
  } catch (err) {
    next(err);
  }
});

/* ---------- 생산계획 저장 ---------- */
router.post("/plans", async (req, res, next) => {
  try {
    const result = await svc.savePlan(req.body || {});
    res.json({ ok: true, result });
  } catch (err) {
    next(err);
  }
});

/* ---------- 생산계획 목록(프로시저) ---------- */
router.get("/plans", async (req, res, next) => {
  try {
    const { kw = "", page = 1, size = 10 } = req.query;
    const data = await svc.getPlans({ kw, page, size });
    res.json({ ok: true, ...data });
  } catch (err) {
    next(err);
  }
});

/* ---------- 생산계획 수정(프로시저) ---------- */
router.put("/plans/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await svc.updatePlan(id, req.body || {});
    res.json({ ok: true, ...result });
  } catch (err) {
    next(err);
  }
});

/* ---------- 생산계획 삭제(프로시저) ---------- */
router.delete("/plans", async (req, res, next) => {
  try {
    const ids = req.body?.ids || [];
    const result = await svc.deletePlans(ids);
    res.json({ ok: true, ...result });
  } catch (err) {
    next(err);
  }
});

/* ---------- 작업지시 생성 ---------- */
router.post("/workorders", async (req, res, next) => {
  try {
    const result = await svc.createWorkOrder(req.body || {});
    res.json({ ok: true, ...result });
  } catch (err) {
    next(err);
  }
});

/* ---------- 작업지시 목록 ---------- */
router.get("/workorders", async (req, res, next) => {
  try {
    const { kw = "", page = 1, size = 10 } = req.query;
    const data = await svc.getWorkOrders({ kw, page, size });
    res.json({ ok: true, ...data });
  } catch (err) {
    next(err);
  }
});

/* ---------- 작업지시 수정 ---------- */
router.put("/workorders/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await svc.updateWorkOrder(id, req.body || {});
    res.json({ ok: true, ...result });
  } catch (err) {
    next(err);
  }
});

/* ---------- 작업지시 삭제 ---------- */
router.delete("/workorders", async (req, res, next) => {
  try {
    const ids = req.body?.ids || [];
    const result = await svc.deleteWorkOrders(ids);
    res.json({ ok: true, ...result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
