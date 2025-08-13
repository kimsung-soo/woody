const express = require("express");
const router = express.Router();
const matarialService = require("../services/materials_service");

// router.get("/matarials", async (req, res) => {
//   let matarialList = await matarialService.matarialSelect();
//   res.send(matarialList);
// });

router.get("/materials", async (req, res) => {
  let list = await matarialService.materialfindAll();
  res.send(list);
});

module.exports = router;
