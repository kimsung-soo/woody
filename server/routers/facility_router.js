const express = require("express");
const router = express.Router();
const facilityService = require("../services/facility_service");

// 설비 목록
router.get("/facility", async (_req, res) => {
  try {
    const list = await facilityService.facilitySelect();
    res.send(list);
  } catch (err) {
    console.error("FACILITY LIST ERROR:", err);
    res
      .status(500)
      .json({ message: "FACILITY LIST ERROR", error: err.message });
  }
});

// 설비 단건
router.get("/facilityById", async (req, res) => {
  try {
    const data = await facilityService.facilityById({
      FAC_ID: req.query.facId,
    });
    res.send(data);
  } catch (err) {
    console.error("FACILITY BY ID ERROR:", err);
    res
      .status(500)
      .json({ message: "FACILITY BY ID ERROR", error: err.message });
  }
});

// 설비 등록
router.post("/facilityInsert", async (req, res) => {
  try {
    const newId = await facilityService.facilityInsert(req.body);
    res.status(200).json({ ok: true, FAC_ID: newId });
  } catch (err) {
    console.error("FACILITY INSERT ERROR:", err);
    res
      .status(500)
      .json({ message: "FACILITY INSERT ERROR", error: err.message });
  }
});

// 다음 설비코드
router.get("/facility/next-id", async (_req, res) => {
  try {
    const id = await facilityService.getNextFacilityId();
    res.send({ FAC_ID: id });
  } catch (err) {
    console.error("NEXT FACILITY ID ERROR:", err);
    res
      .status(500)
      .json({ message: "NEXT FACILITY ID ERROR", error: err.message });
  }
});

// 설비 수정
router.put("/facilityUpdate", async (req, res) => {
  try {
    await facilityService.facilityUpdate(req.body);
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("FACILITY UPDATE ERROR:", err);
    res
      .status(500)
      .json({ message: "FACILITY UPDATE ERROR", error: err.message });
  }
});

// 설비 삭제
router.delete("/facilityDelete", async (req, res) => {
  try {
    await facilityService.facilityDelete({ FAC_ID: req.body.FAC_ID });
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("FACILITY DELETE ERROR:", err);
    res
      .status(500)
      .json({ message: "FACILITY DELETE ERROR", error: err.message });
  }
});

// FAC_TYPE별 설비
router.get("/facility/by-type", async (req, res) => {
  try {
    const list = await facilityService.facilitySelectByFacType(
      req.query.facType || null
    );
    res.send(list);
  } catch (err) {
    console.error("FACILITY BY TYPE ERROR:", err);
    res
      .status(500)
      .json({ message: "FACILITY BY TYPE ERROR", error: err.message });
  }
});

// 상태 목록(최신 1건 포함)
router.get("/facility/status", async (_req, res) => {
  try {
    const rows = await facilityService.facilityStatusList();
    res.send(rows);
  } catch (err) {
    console.error("FACILITY STATUS LIST ERROR:", err);
    res
      .status(500)
      .json({ message: "FACILITY STATUS LIST ERROR", error: err.message });
  }
});

// 특정 설비 최신 상태
router.get("/facility/status/current/:facId", async (req, res) => {
  try {
    const row = await facilityService.facilityStatusCurrentByFac(
      req.params.facId
    );
    res.send(row);
  } catch (err) {
    console.error("FACILITY STATUS CURRENT ERROR:", err);
    res
      .status(500)
      .json({ message: "FACILITY STATUS CURRENT ERROR", error: err.message });
  }
});

// 비가동 설정/업데이트
router.patch("/facility/status/down", async (req, res) => {
  try {
    await facilityService.facilityStatusUpdateToDown(req.body);
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("FACILITY STATUS DOWN ERROR:", err);
    res
      .status(500)
      .json({ message: "FACILITY STATUS DOWN ERROR", error: err.message });
  }
});

// 비가동 종료 (수리 자동기록 O)
router.patch("/facility/status/end", async (req, res) => {
  try {
    const {
      FS_ID,
      endTime,
      restoreStatus = 0,
      checkTime = null,
      MANAGER = null,
      repairContent = null,
      repairNote = null,
    } = req.body;

    await facilityService.facilityStatusEndDowntime({
      FS_ID,
      endTime,
      restoreStatus,
      checkTime,
      MANAGER,
      repairContent,
      repairNote,
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("FACILITY STATUS END ERROR:", err);
    res
      .status(500)
      .json({ message: "FACILITY STATUS END ERROR", error: err.message });
  }
});

// 상태 이력 필터
router.get("/facility/status/filter", async (req, res) => {
  try {
    const rows = await facilityService.facilityStatusFilter({
      facId: req.query.facId || null,
      startDate: req.query.start || null,
      endDate: req.query.end || null,
    });
    res.send(rows);
  } catch (err) {
    console.error("FACILITY STATUS FILTER ERROR:", err);
    res
      .status(500)
      .json({ message: "FACILITY STATUS FILTER ERROR", error: err.message });
  }
});

// 수리 목록(전체/설비별)
router.get("/facility/repairs", async (req, res) => {
  try {
    const rows = req.query.facId
      ? await facilityService.facilityRepairByFacId(req.query.facId)
      : await facilityService.facilityRepairList();
    res.send(rows);
  } catch (err) {
    console.error("FACILITY REPAIR LIST ERROR:", err);
    res
      .status(500)
      .json({ message: "FACILITY REPAIR LIST ERROR", error: err.message });
  }
});

// 진행중 점검
router.get("/facility/inspections/open", async (_req, res) => {
  try {
    const rows = await facilityService.facilityOpenInspections();
    res.send(rows);
  } catch (err) {
    console.error("FACILITY OPEN INSPECTION LIST ERROR:", err);
    res.status(500).json({
      message: "FACILITY OPEN INSPECTION LIST ERROR",
      error: err.message,
    });
  }
});

// 점검 완료(저장 + 종료)
router.post("/facility/inspection/complete", async (req, res) => {
  try {
    const { FS_ID, FAC_ID, fit, ngReason, content, nextAt, doneAt, manager } =
      req.body;

    await facilityService.facilityCheckInsert({
      FS_ID,
      FAC_ID,
      FC_NEXTDAY: nextAt ?? null,
      FC_SUIT: fit ?? null,
      FC_SUIT_REASON: fit === "부적합" ? ngReason ?? "" : null,
      FC_CONTENT: content ?? null,
      MANAGER: manager ?? null,
    });

    const restoreStatus = fit === "부적합" ? 1 : 0;
    await facilityService.facilityStatusEndInspection({
      FS_ID,
      endTime: doneAt,
      restoreStatus,
      checkTime: doneAt,
      nextCheck: nextAt ?? null,
      MANAGER: manager ?? null,
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("FACILITY INSPECTION COMPLETE ERROR:", err);
    res.status(500).json({
      message: "FACILITY INSPECTION COMPLETE ERROR",
      error: err.message,
    });
  }
});

// 점검 이력
router.get("/facility/inspections/history", async (req, res) => {
  try {
    const rows = await facilityService.facilityInspectionHistory({
      facId: req.query.facId || null,
      startDate: req.query.start || null,
      endDate: req.query.end || null,
    });
    res.send(rows);
  } catch (err) {
    console.error("FACILITY INSPECTION HISTORY ERROR:", err);
    res.status(500).json({
      message: "FACILITY INSPECTION HISTORY ERROR",
      error: err.message,
    });
  }
});

// 공통코드(그룹)
router.get("/common/codes/:group", async (req, res) => {
  try {
    const list = await facilityService.getCodesByGroup(req.params.group);
    res.send(list);
  } catch (err) {
    console.error("COMMON CODE LIST ERROR:", err);
    res
      .status(500)
      .json({ message: "COMMON CODE LIST ERROR", error: err.message });
  }
});

router.get("/process", async (_req, res) => {
  try {
    const rows = await facilityService.getProcessList();
    res.send(rows);
  } catch (err) {
    console.error("PROCESS LIST ERROR:", err);
    res.status(500).json({ message: "PROCESS LIST ERROR", error: err.message });
  }
});

module.exports = router;
