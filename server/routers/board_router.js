const express = require("express");
const router = express.Router();
const boardService = require("../services/board_service.js");

// 연결 쿼리 테스트
router.get("/boards", async (req, res) => {
  let list = await boardService.findAll();
  res.send(list);
});

module.exports = router;
