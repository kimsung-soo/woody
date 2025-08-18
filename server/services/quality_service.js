const mariadb = require("../database/mapper.js");

// 합/불 원자재 조회
const matHisAll = async () => {
  let list = await mariadb.query("materialSelect");
  return list;
};

// 원자재검수관리 조회
const matMng = async () => {
  let list = await mariadb.query("matManagement");
  return list;
};

// 합격원자재 등록
const addPassMat = async (data) => {
  const params = [
    data.RECEIPT_NO,
    data.MAT_CODE,
    data.TOTAL_QTY,
    data.Q_CHECKED_DATE,
    data.CREATED_BY,
  ];
  return mariadb.query("passMat", params);
};

// 제품성적서조회
const selectPrdCert = async () => {
  let list = await mariadb.query("selectProductCertificate");
  return list;
};

// 품질기준조회
const selectQstd = async () => {
  let list = await mariadb.query("selectQStandard");
  return list;
};

// 품질공통코드
const qcCommonCode = async () => {
  let list = await mariadb.query("qcStatus");
  return list;
};

// 원자재 입고공통코드
const matCommonCode = async () => {
  let list = await mariadb.query("receiveStatus");
  return list;
};

module.exports = {
  matHisAll,
  matMng,
  addPassMat,
  selectPrdCert,
  selectQstd,
  qcCommonCode,
  matCommonCode,
};
