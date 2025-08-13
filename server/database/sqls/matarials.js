// table명 : matarials

// 각 변수별로 SQL문을 등록할 떄 백틱(``)을 사용하는 이유는 줄바꿈 허용을 허용하기 떄문.
// ( 따옴표는 줄을 바꿀 경우 값이 깨지면서 에러발생 )

// 자재 조회 (모달)
const materialsAllSelect = `SELECT MAT_CODE, MAT_NAME, MAT_TYPE, MAT_UNIT, MAT_WIDTH, MAT_HEIGHT, MAT_DEPT, MAT_SAFEQT, MAT_DATE, MAT_NOTE, MAT_WRITER
FROM MATERIALS`;

// 자재발주서 insert
const materialOrder = `INSERT INTO PURCHASE_ORDER (PO_NO, SUPPLYER, ORDER_DATE, PO_DDAY, MANAGER)
VALUES (?, ?, ?, ?, ?)`;

// 자재발주서 상세 insert
const materialOrderDetail = `INSERT INTO PURCHASE_DETAIL (MAT_CODE, RECEIPT_QTY, PO_NO)
VALUES (?, ?, ?)`;

module.exports = {
  materialsAllSelect,
  materialOrder,
  materialOrderDetail,
};
