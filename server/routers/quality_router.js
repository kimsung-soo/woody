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
