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
  try {
    const result = await mariadb.query("insertAccount", params);
    return result;
  } catch (e) {
    console.error(e);
    return { error: e };
  }
};

// 거래처 목록 조회
const getAccountList = async () => {
  try {
    const result = await mariadb.query("selectAccountList");
    return result;
  } catch (e) {
    console.error(e);
    return { error: e };
  }
};

// 제품 목록 조회
const getItemList = async () => {
  try {
    const result = await mariadb.query("selectItemList");
    return result;
  } catch (e) {
    console.error(e);
    return { error: e };
  }
};

// 주문 등록
const addOrder = async (data) => {
  const params = [
    data.cusId,
    data.reqDDay,
    data.reqNote,
    JSON.stringify(data.items),
  ];

  try {
    const result = await mariadb.query("insertOrder", params);
    return result;
  } catch (e) {
    console.error(e);
    return { error: e };
  }
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
  getAccountList,
  getItemList,
  addOrder,
};
