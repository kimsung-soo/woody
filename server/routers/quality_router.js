const express = require("express");
const router = express.Router();
const qualityService = require("../services/quality_service");

// 완반제품 성적서 조회
router.get("/prdcertlist", async (req, res) => {
  let list = await qualityService.selectPrdCert();
  res.send(list);
});

module.exports = router;
