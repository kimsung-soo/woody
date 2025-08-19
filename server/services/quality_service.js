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

// 불합격원자재 등록
const addRejectMat = async (b) => {
  const params = [
    String(b.RECEIPT_NO), // 1: RECEIPT_NO
    String(b.MAT_CODE), // 2: MAT_CODE
    String(b.RJT_REASON).slice(0, 100), // 3: RJT_REASON (100자 컷)
    String(b.Q_CHECKED_DATE), // 4: Q_CHECKED_DATE  'YYYY-MM-DD'
    Number(b.TOTAL_QTY) || 0, // 5: TOTAL_QTY
    b.CREATED_BY || null, // 6: CREATED_BY
  ];
  return await mariadb.query("rejactMat", params);
};

// 제품공정조회
const selectTaskPrd = async () => {
  let list = await mariadb.query("taskPrd");
  return list;
};

// 제품성적서조회
const selectPrdCert = async () => {
  let list = await mariadb.query("selectProductCertificate");
  return list;
};

// 합격제품등록
const addPassPrd = async (b) => {
  const params = [
    String(b.TP_ID),
    String(b.Q_STD_ID),
    String(b.PRD_CODE),
    String(b.PRD_NAME),
    Number(b.TOTAL_QTY) || 0,
    String(b.PRD_TYPE),
    String(b.Q_CHECKED_DATE),
    String(b.PRD_STATUS),
    b.CREATED_BY || null,
  ];
  return await mariadb.query("passPrd", params);
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
  addRejectMat,
  selectTaskPrd,
  selectPrdCert,
  addPassPrd,
  selectQstd,
  qcCommonCode,
  matCommonCode,
};
