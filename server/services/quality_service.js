const mariadb = require("../database/mapper.js");

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
module.exports = {
  selectPrdCert,
  selectQstd,
  qcCommonCode,
};
