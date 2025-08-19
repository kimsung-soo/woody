const express = require("express");
const router = express.Router();
const qualityService = require("../services/quality_service");

// 합/불 원자재 젅부 조회
router.get("/mathisall", async (req, res) => {
  let list = await qualityService.matHisAll();
  res.send(list);
});

// 원자재검수관리 조회
router.get("/matmng", async (req, res) => {
  let list = await qualityService.matMng();
  res.send(list);
});

// 완반제품 성적서 조회
router.get("/prdcertlist", async (req, res) => {
  let list = await qualityService.selectPrdCert();
  res.send(list);
});

// 합격원자재 등록
router.post("/passmat", async (req, res) => {
  try {
    const body = req.body || {};
    // 필수 필드 로그
    console.log("passmat body:", body);

    // 서비스 호출
    const result = await qualityService.addPassMat({
      RECEIPT_NO: body.RECEIPT_NO,
      MAT_CODE: body.MAT_CODE,
      TOTAL_QTY: body.TOTAL_QTY,
      Q_CHECKED_DATE: body.Q_CHECKED_DATE,
      CREATED_BY: body.CREATED_BY,
    });
    res.json({
      ok: true,
      affected: result.affectedRows || result.affected_rows || 1,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ ok: false, message: "저장 실패", error: String(err) });
  }
});

// 불합격원자재 등록
router.post("/rjtmat", async (req, res) => {
  try {
    const b = req.body || {};
    const result = await qualityService.addRejectMat({
      RECEIPT_NO: String(b.RECEIPT_NO),
      MAT_CODE: String(b.MAT_CODE),
      RJT_REASON: String(b.RJT_REASON),
      Q_CHECKED_DATE: String(b.Q_CHECKED_DATE), // 'YYYY-MM-DD'
      TOTAL_QTY: Number(b.TOTAL_QTY) || 0,
      CREATED_BY: b.CREATED_BY || null,
    });

    res.json({ ok: true, affected: result.affectedRows || 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      ok: false,
      message: err.sqlMessage || err.message,
      code: err.code,
    });
  }
});

// 제품공정조회
router.get("/taskprd", async (req, res) => {
  let list = await qualityService.selectTaskPrd();
  res.send(list);
});

// 합격제품등록
router.post("/passprd", async (req, res) => {
  try {
    const b = req.body || {};
    const result = await qualityService.addPassPrd({
      TP_ID: String(b.TP_ID),
      Q_STD_ID: String(b.Q_STD_ID),
      PRD_NAME: String(b.PRD_NAME),
      PRD_CODE: String(b.PRD_CODE),
      TOTAL_QTY: Number(b.TOTAL_QTY) || 0,
      PRD_TYPE: String(b.PRD_TYPE),
      Q_CHECKED_DATE: String(b.Q_CHECKED_DATE),
      CREATED_BY: b.CREATED_BY || null,
    });

    res.json({ ok: true, affected: result.affectedRows || 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      ok: false,
      message: err.sqlMessage || err.message,
      code: err.code,
    });
  }
});

// 품질기준 조회
router.get("/qstdlist", async (req, res) => {
  let list = await qualityService.selectQstd();
  res.send(list);
});

// 품질공통코드
router.get("/qccommon", async (req, res) => {
  let list = await qualityService.qcCommonCode();
  res.send(list);
});

// 원자재 입고공통코드
router.get("/matcommon", async (req, res) => {
  let list = await qualityService.matCommonCode();
  res.send(list);
});

module.exports = router;
