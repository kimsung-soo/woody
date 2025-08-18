const express = require("express");
const router = express.Router();

const masterService = require("../services/master_service");

// 사원 조회
router.get("/masterEmp", async (req, res) => {
  let list = await masterService.masterEmpSelect();
  res.send(list);
});

// 공통코드 조회

router.get("/commonDept", async (req, res) => {
  let list = await masterService.commonDept();
  res.send(list);
});

// 사원 조회
router.get("/commonAuth", async (req, res) => {
  let list = await masterService.commonAuth();
  res.send(list);
});

// 사원 검색
router.post("/masterEmpName", async (req, res) => {
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

// 제품 조회
router.get("/masterPrdSelect", async (req, res) => {
  let list = await masterService.masterPrdSelect();
  res.send(list);
});

// 모달(규격) 조회
router.get("/masterPrdModal", async (req, res) => {
  let list = await masterService.masterPrdModal();
  res.send(list);
});

// 제품 - 단위 조회
router.get("/masterPrdUnit", async (req, res) => {
  let list = await masterService.masterPrdUnit();
  res.send(list);
});

// 제품 - 유형 조회
router.get("/masterPrdType", async (req, res) => {
  let list = await masterService.masterPrdType();
  res.send(list);
});

// 제품 - 등록
router.post("/masterPrdInsert", async (req, res) => {
  try {
    const data = req.body;
    console.log(req.body);
    let result = await masterService.masterPrdInsert(data);
    res.json(result);
  } catch (e) {
    console.log(e);
  }
});

// 제품 - 수정
router.post("/masterPrdUpdate", async (req, res) => {
  try {
    const data = req.body;
    console.log(req.body);
    let result = await masterService.masterPrdUpdate(data);
    res.json(result);
  } catch (e) {
    console.log(e);
  }
});

// 제품 - 삭제
router.post("/masterPrdDelete", async (req, res) => {
  try {
    const data = req.body;
    let result = await masterService.masterPrdDelete(data);
    res.json(result);
  } catch (e) {
    console.log(e);
  }
});

// 제품관리 - 검색

router.post("/masterPrdSearch", async (req, res) => {
  try {
    const data = req.body;
    let result = await masterService.masterPrdSearch(data);
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

// BOM 자재 모달
router.get("/BOMmodalSelect", async (req, res) => {
  let list = await masterService.BOMmodalSelect();
  res.send(list);
});

// BOM 모달 확인클릭
router.post("/BOMmodalConfirm", async (req, res) => {
  try {
    const data = req.body;
    console.log(req.body);
    let result = await masterService.BOMmodalConfirm(data);
    res.json(result);
  } catch (e) {
    console.log(e);
  }
});

// BOM_DETAIL 조회
router.post("/BOM_detailSelect", async (req, res) => {
  const data = req.body;
  try {
    let list = await masterService.BOM_detailSelect(data);
    res.send(list);
  } catch (e) {
    console.log(e);
  }
});

// bom 추가
router.post("/BOMInsert", async (req, res) => {
  try {
    const data = req.body;
    console.log(req.body);
    let result = await masterService.BOMInsert(data);
    res.json(result);
  } catch (e) {
    console.log(e);
  }
});

// bom 삭제
router.post("/bomDelete", async (req, res) => {
  try {
    const data = req.body;
    console.log(req.body);
    let result = await masterService.bomDelete(data);
    res.json(result);
  } catch (e) {
    console.log(e);
  }
});

// bom 저장버튼
router.post("/bomMatUpdate", async (req, res) => {
  try {
    const data = req.body;
    let result = await masterService.bomMatUpdate(data);
    res.json(result);
  } catch (e) {
    console.log(e);
  }
});
// BOM 검색
router.post("/bomSearch", async (req, res) => {
  try {
    const data = req.body;
    let result = await masterService.bomSearch(data);
    res.json(result);
  } catch (e) {
    console.log(e);
  }
});

// 공정흐름도- 제품조회
router.get("/diaPrdList", async (req, res) => {
  let list = await masterService.diaPrdList();
  res.send(list);
});

// 공정흐름도- 모달조회
router.get("/diaModalList", async (req, res) => {
  let list = await masterService.diaModalList();
  res.send(list);
});

// 공정흐름도 - 공정조회
router.post("/prcList", async (req, res) => {
  const data = req.body;
  try {
    let list = await masterService.prcList(data);
    res.send(list);
  } catch (e) {
    console.log(e);
  }
});

// 공정흐름도 - 모달 확인시 insert
router.post("/prcModalConfirm", async (req, res) => {
  try {
    const data = req.body;
    console.log(req.body);
    let result = await masterService.prcModalConfirm(data);
    res.json(result);
  } catch (e) {
    console.log(e);
  }
});
//공정흐름도 - 삭제
router.post("/prcDelete", async (req, res) => {
  try {
    const data = req.body;
    let result = await masterService.prcDelete(data);
    res.json(result);
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
