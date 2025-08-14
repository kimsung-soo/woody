const express = require("express");
const router = express.Router();

const masterService = require("../services/master_service");

// 사원 조회
router.get("/masterEmp", async (req, res) => {
  let list = await masterService.masterEmpSelect();
  res.send(list);
});

// 사원 검색
router.get("/masterEmpName", async (req, res) => {
  try {
    const data = req.query.EMP_NAME;
    let list = await masterService.masterEmpSelectName(data);
    res.send(list);
  } catch (e) {
    console.log(e);
  }
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
    const { empNo } = req.body;
    let result = await masterService.masterEmpDelete(empNo);
    res.json(result);
  } catch (e) {
    console.log(e);
  }
});

// BOM에서 제품 조회

router.get("/BOMprdSelect", async (req, res) => {
  let list = await masterService.BOMprdSelect();
  res.send(list);
});

// BOM에서 제품에 대한 BOM 조회

router.post("/BOMbomSelect", async (req, res) => {
  const { PRD_CODE } = req.body;
  try {
    let list = await masterService.BOMbomSelect(PRD_CODE);
    res.send(list);
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
