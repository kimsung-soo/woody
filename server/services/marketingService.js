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

//등록전 lot번호 생성
const getNextLotNo = async () => {
  let result = await mariadb.query("getNextLotNo");
  return result;
};

// 입고 - 등록
const inboundInsert = async (rows) => {
  for (const row of rows) {
    console.log(row);
    const params = [
      row.RECEIVED_QTY,
      row.RECEIVED_DATE,
      row.PRD_CERT_ID,
      row.PRD_LOT,
    ];
    await mariadb.query("inboundInsert", params);
  }
  return { success: true };
};

// 검색
const inboundSearch = async (data) => {
  console.log(data);
  const params = [data.startDate, data.endDate];
  let result = await mariadb.query("inboundSearch", params);
  return result;
};

module.exports = {
  addAccount,
  inboundList,
  inboundInsert,
  getNextLotNo,
  inboundSearch,
};
