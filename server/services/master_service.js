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
module.exports = {
  masterEmpSelect,
  masterEmpInsert,
  masterEmpUpdate,
  masterEmpDelete,
  masterEmpSelectName,
  BOMprdSelect,
  BOMbomSelect,
};
