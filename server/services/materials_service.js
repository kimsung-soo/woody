const mariadb = require("../database/mapper.js");

// 자재 조회 모달창
const materialsSelect = async () => {
  let list = await mariadb.query("materialsAllSelect");
  return list;
};

// 자재발주서 등록
const materialOrder = async (data) => {
  const params = [
    data.PO_NO,
    data.SUPPLYER,
    data.ORDER_DATE,
    data.PO_DDAY,
    data.MANAGER,
  ];
  let result = await mariadb.query("materialOrder", params);
  return result;
};

const materialOrderDetail = async (data) => {
  const params = [data.MAT_CODE, data.RECEIPT_QTY, data.PO_NO];
  let result = await mariadb.query("materialOrderDetail", params);
  return result;
};

module.exports = {
  materialsSelect,
  materialOrder,
  materialOrderDetail,
};
