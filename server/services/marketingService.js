// marketingService.js

const mariadb = require("../database/mapper.js");

// 거래처 등록
const addAccount = async (data) => {
  const params = [
    data.cusType,
    data.cusName,
    data.cusManager,
    data.cusUse,
    data.cusNote,
  ];
  let result = await mariadb.query("insertAccount", params);
  return result;
};

// 태완 -입고 조회
const inboundList = async () => {
  let list = await mariadb.query("inboundList");
  return list;
};

// 입고 - 등록
const inboundInsert = async (data) => {
  const params = [data.RECEIVED_QTY, data.RECEIVED_DATE, data.PRD_CERT_ID];
  let result = await mariadb.query("inboundInsert", params);
  return result;
};
module.exports = {
  addAccount,
  inboundList,
  inboundInsert,
};
