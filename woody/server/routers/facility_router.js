const express = require("express");
const router = express.Router();
const svc = require("../services/facility_service");

// 리스트
router.get("/facility", async (req, res) => {
  try {
    const list = await svc.facilitySelect();
    res.send(list);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "FACILITY LIST ERROR" });
  }
});

router.get("/facilityById", async (req, res) => {
  try {
    const data = { FAC_ID: req.query.facId };
    const rows = await svc.facilityById(data);
    res.send(rows[0] || null);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "FACILITY GET ERROR" });
  }
});

// 등록
router.post("/facilityInsert", async (req, res) => {
  try {
    const result = await svc.facilityInsert(req.body);
    res.json(result);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "FACILITY INSERT ERROR" });
  }
});

// 수정
router.put("/facilityUpdate", async (req, res) => {
  try {
    const result = await svc.facilityUpdate(req.body);
    res.json(result);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "FACILITY UPDATE ERROR" });
  }
});

// 삭제
router.delete("/facilityDelete", async (req, res) => {
  try {
    const result = await svc.facilityDelete(req.body);
    res.json(result);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "FACILITY DELETE ERROR" });
  }
});

router.get("/common/codes/:groupCode", async (req, res) => {
  try {
    const rows = await svc.getCodesByGroup(req.params.groupCode);
    res.send(rows);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "CODES LIST ERROR" });
  }
});

// === 설비상태 목록 ===
router.get("/facility/status", async (req, res) => {
  try {
    const list = await svc.facilityStatusList();
    res.send(list);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "FACILITY STATUS LIST ERROR" });
  }
});

// === 설비별 현재상태(최근 1건) ===
router.get("/facility/status/current/:facId", async (req, res) => {
  try {
    const rows = await svc.facilityStatusCurrentByFac(req.params.facId);
    res.send(rows[0] || null);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "FACILITY STATUS CURRENT ERROR" });
  }
});

// === 설비상태 등록(비가동 시작) ===
router.post("/facility/status", async (req, res) => {
  try {
    await svc.facilityStatusInsert(req.body);
    res.send({ ok: true });
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "FACILITY STATUS INSERT ERROR" });
  }
});

// === 비가동 종료(복귀) ===
router.patch("/facility/status/end", async (req, res) => {
  try {
    await svc.facilityStatusEndDowntime(req.body);
    res.send({ ok: true });
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "FACILITY STATUS END ERROR" });
  }
});

// === 설비상태 필터 조회 (?facId=FAC001&start=2025-08-01&end=2025-08-31) ===
router.get("/facility/status/filter", async (req, res) => {
  try {
    const { facId = null, start = null, end = null } = req.query;
    const rows = await svc.facilityStatusFilter({
      facId,
      startDate: start,
      endDate: end,
    });
    res.send(rows);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "FACILITY STATUS FILTER ERROR" });
  }
});

module.exports = router;
