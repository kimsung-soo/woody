// marketingService.js

const db = require("../database/mapper.js");

// 거래처 등록
const addAccount = async (data) => {
  const params = [
    data.cusType,
    data.cusName,
    data.cusManager,
    data.cusUse,
    data.cusNote,
  ];
  let result = await db.query("insertAccount", params);
  return result;
};

module.exports = { addAccount };
