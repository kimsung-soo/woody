const mariadb = require("../database/mapper.js");

//
const selectPrdCert = async () => {
  let list = await mariadb.query("selectProductCertificate");
  return list;
};

module.exports = {
  selectPrdCert,
};
