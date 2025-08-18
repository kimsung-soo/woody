const mariadb = require("../database/mapper.js");

// 사원 조회
const masterEmpSelect = async () => {
  let list = await mariadb.query("masterEmpSelect");
  return list;
};

// 사원 검색
const masterEmpSelectName = async (empName) => {
  const params = [empName];
  let list = await mariadb.query("masterEmpSelectName", params);
  return list;
};
// 사원 등록
const masterEmpInsert = async (data) => {
  const params = [
    data.EMP_NAME,
    data.PHONE,
    data.EMAIL,
    data.DEPT_NAME,
    data.AUTH,
    data.ADDR,
    data.EMP_STATUS,
    data.EMP_HDATE,
    data.EMP_EDATE || null,
  ];
  let result = await mariadb.query("masterEmpInsert", params);
  return result;
};

// 사원 수정
const masterEmpUpdate = async (data) => {
  const params = [
    data.EMP_NAME,
    data.PHONE,
    data.EMAIL,
    data.DEPT_NAME,
    data.AUTH,
    data.ADDR,
    data.EMP_STATUS,
    data.EMP_HDATE || null,
    data.EMP_EDATE || null,
    data.EMP_NO,
  ];
  let result = await mariadb.query("masterEmpUpdate", params);
  return result;
};

// 사원 삭제
const masterEmpDelete = async (EMP_NO) => {
  const params = [EMP_NO];
  let result = await mariadb.query("masterEmpDelete", params);
  return result;
};

// BOM관리에서 제품 조회
const BOMprdSelect = async () => {
  let list = await mariadb.query("BOMprdSelect");
  return list;
};

// BOM관리에서 제품클릭시 BOM 조회
const BOMbomSelect = async (prdName) => {
  const params = [prdName];
  let list = await mariadb.query("BOMbomSelect", params);
  return list;
};

//BOM 자재 모달
const BOMmodalSelect = async () => {
  let list = await mariadb.query("BOMmodalSelect");
  return list;
};

// BOM 모달 확인
const BOMmodalConfirm = async (data) => {
  const params = [
    data.BOM_CODE,
    data.MAT_CODE,
    data.MAT_NAME,
    data.MAT_TYPE,
    data.UNIT,
    data.BOM_VER,
  ];
  let result = await mariadb.query("BOMmodalConfirm", params);
  return result;
};

// BOM_DETAIL (자재)조회
const BOM_detailSelect = async (data) => {
  const params = [data.BOM_CODE, data.BOM_VER];
  let list = await mariadb.query("BOM_detailSelect", params);
  return list;
};

// BOM 추가버튼
const BOMInsert = async (data) => {
  const [rows] = await mariadb.query("nextBOm", [data.PRD_CODE]);
  console.log("rows:", rows);
  const newBomCode = rows.code;

  const insertparams = [newBomCode, data.PRD_CODE, data.BOM_WRITER, newBomCode];
  await mariadb.query("bomUpdate", [
    data.PRD_CODE,
    data.PRD_CODE,
    data.BOM_VER,
  ]);
  let result = await mariadb.query("BOMInsert", insertparams);
  console.log(data);

  return result;
};

// BOM 삭제 버튼
const bomDelete = async (data) => {
  const params = [data.BOM_CODE, data.MAT_CODE];
  let result = await mariadb.query("bomDelete", params);
  return result;
};

// BOM 저장 버튼
const bomMatUpdate = async (data) => {
  console.log(data.bomCode);
  const matCodesJSON = JSON.stringify(data.matCodes);
  const qtysJSON = JSON.stringify(data.qtys);
  const params = [data.bomCode, matCodesJSON, qtysJSON];
  let result = await mariadb.query("bomMatUpdate", params);
  return result;
};

// BOM 검색
const bomSearch = async (data) => {
  const params = [data.PRD_NAME];
  let result = await mariadb.query("bomSearch", params);
  return result;
};

// 공정흐름도 - 제품조회
const diaPrdList = async () => {
  let list = await mariadb.query("diaPrdList");
  return list;
};
// 공정흐름도 - 모달조회
const diaModalList = async () => {
  let list = await mariadb.query("diaModalList");
  return list;
};

// 공정흐름도 - 공정조회
const prcList = async (data) => {
  const params = [data.DIA_CODE];
  let list = await mariadb.query("prcList", params);
  return list;
};

// 공정흐름도 - 모달 확인 insert
const prcModalConfirm = async (data) => {
  const params = [
    data.DIA_CODE,
    data.DIA_CODE,
    data.PRC_CODE,
    data.PRC_NAME,
    data.FAC_TYPE,
  ];
  let result = await mariadb.query("prcModalConfirm", params);
  return result;
};

// 공정흐름도 삭제
const prcDelete = async (data) => {
  const diaCode = data.diaCode;
  const prcJSON = JSON.stringify(data.prcCode);
  const params = [diaCode, prcJSON];
  let result = await mariadb.query("prcDelete", params);
  return result;
};

module.exports = {
  masterEmpSelect,
  masterEmpInsert,
  masterEmpUpdate,
  masterEmpDelete,
  masterEmpSelectName,
  BOMprdSelect,
  BOMbomSelect,
  BOMmodalSelect,
  BOMmodalConfirm,
  BOM_detailSelect,
  BOMInsert,
  bomDelete,
  bomMatUpdate,
  bomSearch,
  diaPrdList,
  diaModalList,
  prcList,
  prcModalConfirm,
  prcDelete,
};
