const express = require("express");
const router = express.Router();

const masterService = require("../services/master_service");

// 사원 조회
router.get("/masterEmp", async (req, res) => {
  let list = await masterService.masterEmpSelect();
  res.send(list);
});

// 사원 등록
router.post("/masterEmpInsert", async (req, res) => {
  try {
    const data = req.body;
    console.log(req.body);
    let result = await masterService.masterEmpInsert(data);
    res.json(result);
  } catch (e) {
    console.log(e);
  }
});

// 사원 수정
router.put("/masterEmpUpdate", async (req, res) => {
  try {
    const data = req.body;
    let result = await masterService.masterEmpUpdate(data);
    res.json(result);
  } catch (e) {
    console.log(e);
  }
});

// 사원 삭제
router.delete("/masterEmpDelete", async (req, res) => {
  try {
    const data = req.body;
    let result = await masterService.masterEmpDelete(data);
    res.json(result);
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
