const express = require("express");
const router = express.Router();
const matarialService = require("../services/materials_service");

router.get("/matarials", async (req, res) => {
  let matarialList = await matarialService.matarialSelect();
  res.send(matarialList);
});

module.exports = router;
