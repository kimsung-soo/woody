const express = require("express");
const router = express.Router();
const qualityService = require("../services/quality_service");

// 완반제품 성적서 조회
router.get("/prdcertlist", async (req, res) => {
  let list = await qualityService.selectPrdCert();
  res.send(list);
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

module.exports = router;
