// routers/facility_router.js
const express = require("express");
const router = express.Router();
const svc = require("../services/facility_service");

/* -------------------------
   FACILITY (설비 기본)
--------------------------*/

// 설비 목록
router.get("/facility", async (req, res) => {
  try {
    const rows = await svc.facilitySelect();
    res.send(rows);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "FACILITY LIST ERROR" });
  }
});

// 설비 단건
router.get("/facilityById", async (req, res) => {
  try {
    const { facId } = req.query;
    const row = await svc.facilityById({ FAC_ID: facId });
    res.send(row);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "FACILITY BY ID ERROR" });
  }
});

// 설비 등록
router.post("/facilityInsert", async (req, res) => {
  try {
    await svc.facilityInsert(req.body);
    res.send({ ok: true });
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "FACILITY INSERT ERROR" });
  }
});

// 다음 설비ID (옵션)
router.get("/facility/next-id", async (req, res) => {
  try {
    const rows = await svc.getNextFacilityId();
    res.send(rows?.[0] ?? {});
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "NEXT FACILITY ID ERROR" });
  }
});

// 설비 수정
router.put("/facilityUpdate", async (req, res) => {
  try {
    await svc.facilityUpdate(req.body);
    res.send({ ok: true });
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "FACILITY UPDATE ERROR" });
  }
});

// 설비 삭제
router.delete("/facilityDelete", async (req, res) => {
  try {
    const { FAC_ID } = req.body;
    await svc.facilityDelete({ FAC_ID });
    res.send({ ok: true });
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "FACILITY DELETE ERROR" });
  }
});

/* -------------------------
   공통 코드 (예: RR 고장유형)
--------------------------*/

// 그룹별 코드
router.get("/common/codes/:group", async (req, res) => {
  try {
    const { group } = req.params;
    const rows = await svc.getCodesByGroup(group);
    res.send(rows);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "COMMON CODE LIST ERROR" });
  }
});

/* -------------------------
   FACILITY_STATUS (설비 상태)
--------------------------*/

// 상태 목록 (조인 포함)
router.get("/facility/status", async (req, res) => {
  try {
    const rows = await svc.facilityStatusList();
    res.send(rows);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "FACILITY STATUS LIST ERROR" });
  }
});

// 특정 설비 최신 1건
router.get("/facility/status/current/:facId", async (req, res) => {
  try {
    const { facId } = req.params;
    const row = await svc.facilityStatusCurrentByFac(facId);
    res.send(row);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "FACILITY STATUS CURRENT ERROR" });
  }
});

// 가동 → 비가동 전환 (UPDATE만; INSERT 없음)
router.patch("/facility/status/down", async (req, res) => {
  try {
    await svc.facilityStatusUpdateToDown(req.body);
    res.send({ ok: true });
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "FACILITY STATUS DOWN(UPDATE) ERROR" });
  }
});

// 비가동 종료(가동 복귀) + 수리내역(사용자 입력이 있을 때만) 누적 저장
router.patch("/facility/status/end", async (req, res) => {
  try {
    const {
      FS_ID,
      endTime, // 종료시간
      restoreStatus = 0, // 0=가동
      checkTime = null, // 점검완료일(옵션)
      MANAGER = null, // 담당자(옵션) ← ★ body에서 받아서 넘김
      repairContent, // 수리내용(있을 때만 기록)
      repairNote, // 비고
    } = req.body;

    // 1) 상태 종료 업데이트
    await svc.facilityStatusEndDowntime({
      FS_ID,
      endTime,
      restoreStatus,
      checkTime,
      MANAGER,
    });

    // 2) 수리내역은 내용이 있을 때만 기록
    if (repairContent && String(repairContent).trim() !== "") {
      await svc.facilityRepairInsertFromStatus({
        fsId: FS_ID,
        content: String(repairContent).trim(),
        note: repairNote ?? null,
      });
    }

    res.send({ ok: true });
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "FACILITY STATUS END ERROR" });
  }
});

// 상태 필터 (facId, start, end)
router.get("/facility/status/filter", async (req, res) => {
  try {
    const { facId = null, start = null, end = null } = req.query;
    const rows = await svc.facilityStatusFilter({
      facId: facId || null,
      startDate: start || null,
      endDate: end || null,
    });
    res.send(rows);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "FACILITY STATUS FILTER ERROR" });
  }
});

/* -------------------------
   REPAIR (수리 내역)
--------------------------*/

// 수리 내역 (전체 / 설비별)
router.get("/facility/repairs", async (req, res) => {
  try {
    const { facId } = req.query;
    if (facId) {
      const rows = await svc.facilityRepairByFacId(facId);
      res.send(rows);
    } else {
      const rows = await svc.facilityRepairList();
      res.send(rows);
    }
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "FACILITY REPAIR LIST ERROR" });
  }
});

// 현재 비가동(고장)인 오픈 수리 목록
router.get("/facility/repairs/open", async (req, res) => {
  try {
    const rows = await svc.facilityOpenRepairs();
    res.send(rows);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "FACILITY OPEN REPAIR LIST ERROR" });
  }
});

// 공정(PROCESS) 목록
router.get("/process", async (req, res) => {
  try {
    const rows = await svc.processList();
    res.send(rows);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "PROCESS LIST ERROR" });
  }
});
module.exports = router;
