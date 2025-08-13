const express = require("express");
const router = express.Router();
const productionService = require("../services/production_service");

router.get("/production", async (req, res) => {
  let list = await productionService.productionSelect();
  res.send(list);
});

module.exports = router;
