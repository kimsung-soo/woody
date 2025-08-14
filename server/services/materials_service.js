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
    data.PO_STATUS,
  ];
  let result = await mariadb.query("materialOrder", params);
  return result;
};
const materialOrderDetail = async (data) => {
  const params = [data.MAT_CODE, data.RECEIPT_QTY, data.PO_NO];
  let result = await mariadb.query("materialOrderDetail", params);
  return result;
};
// 다음 발주 번호 가져오기 (프로시저 호출)
const getNextPONo = async () => {
  const [poResult] = await mariadb.query("GetNextPoNo");
  return poResult[0].PO_NO;
};

const getMaterialOrders = async () => {
  const result = await mariadb.query("orderSelect");
  return result;
};

const tmpMaterialInsert = async (data) => {
  const params = [
    data.RECEIPT_NO,
    data.PO_NO,
    data.RECEIPT_DATE,
    data.SUPPLYER,
    data.MAT_CODE,
    data.RECEIPT_QTY,
    data.RECEIVED_QTY,
    data.TMP_STATUS,
    data.MANAGER,
  ];
  let result = await mariadb.query("tmpMaterialInsert", params);
  return result;
};

module.exports = {
  materialsSelect,
  materialOrder,
  materialOrderDetail,
  getNextPONo,
  getMaterialOrders,
  tmpMaterialInsert,
};
