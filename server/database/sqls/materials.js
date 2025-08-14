// table명 : matarials

// 각 변수별로 SQL문을 등록할 떄 백틱(``)을 사용하는 이유는 줄바꿈 허용을 허용하기 떄문.
// ( 따옴표는 줄을 바꿀 경우 값이 깨지면서 에러발생 )

// 자재 조회 (모달)
const materialsAllSelect = `SELECT MAT_CODE, MAT_NAME, MAT_TYPE, MAT_UNIT, MAT_WIDTH, MAT_HEIGHT, MAT_DEPT, MAT_SAFEQT, MAT_DATE, MAT_NOTE, MAT_WRITER
FROM MATERIALS`;

// 자재발주서 insert
const materialOrder = `INSERT INTO PURCHASE_ORDER (PO_NO, SUPPLYER, ORDER_DATE, PO_DDAY, MANAGER, PO_STATUS)
VALUES (?, ?, ?, ?, ?, ?)`;

// 자재발주서 상세 insert
const materialOrderDetail = `INSERT INTO PURCHASE_DETAIL (MAT_CODE, RECEIPT_QTY, PO_NO)
VALUES (?, ?, ?)`;

// 발행번호 프로시저 호출
const GetNextPoNo = `CALL GetNextPO_NO()`;

// 자재발주서 조회
const orderSelect = `SELECT O.PO_NO,
       O.SUPPLYER,
       D.MAT_CODE,
       M.MAT_NAME,
       M.MAT_TYPE,
       CONCAT(M.MAT_WIDTH, ' X ', M.MAT_HEIGHT, ' X ', M.MAT_DEPT) AS '규격',
       M.MAT_UNIT,
       O.ORDER_DATE,
       O.PO_DDAY,
       O.MANAGER,
       D.RECEIPT_QTY,
       O.PO_STATUS
FROM PURCHASE_ORDER AS O 
LEFT JOIN PURCHASE_DETAIL AS D
  ON O.PO_NO = D.PO_NO
LEFT JOIN MATERIALS AS M
  ON D.MAT_CODE = M.MAT_CODE
  ORDER BY O.PO_NO DESC`;

// 임시 입고 등록
const tmpMaterialInsert = `INSERT INTO MAT_IN_TMP (RECEIPT_NO, PO_NO, RECEIPT_DATE, SUPPLYER, MAT_CODE, RECEIPT_QTY, RECEIVED_QTY, TMP_STATUS, MANAGER)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?),`;

module.exports = {
  materialsAllSelect,
  materialOrder,
  materialOrderDetail,
  GetNextPoNo,
  orderSelect,
  tmpMaterialInsert,
};
