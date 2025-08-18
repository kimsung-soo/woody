// marketing.js

const insertAccount = `
    insert into CUSTOMERS (cus_id, cus_type, cus_name, cus_manager, cus_use, cus_note)
    values (nextCode("acc"), ?, ?, ?, ?, ?);
`;

// 태완 작업.
const inboundList = `SELECT r.RECEIVED_NO,c.PRD_CERT_ID, c.PRD_CODE,c.PRD_NAME, c.Q_CHECKED_DATE,c.TOTAL_QTY, r.PRD_LOT
FROM PRODUCT_RECEIPT AS r RIGHT JOIN PRODUCT_CERTIFICATE AS c
						   ON r.PRD_CERT_ID = c.PRD_CERT_ID`;

// LOT넘버 생성
const getNextLotNo = `SELECT generate_lot_number()`;
const inboundInsert = `INSERT INTO PRODUCT_RECEIPT( RECEIVED_QTY, RECEIVED_DATE, PRD_CERT_ID, PRD_LOT)
VALUES(?,?,?,?);`;

// 날짜 조건 검색
const inboundSearch = `SELECT r.RECEIVED_NO,
                              c.PRD_CERT_ID,
                              c.PRD_CODE,
                              c.PRD_NAME,
                                c.Q_CHECKED_DATE,
                                c.TOTAL_QTY,
                                r.PRD_LOT
                        FROM PRODUCT_RECEIPT AS r RIGHT JOIN PRODUCT_CERTIFICATE AS c
                        ON r.PRD_CERT_ID = c.PRD_CERT_ID
                        WHERE r.RECEIVED_DATE >= ? AND r.RECEIVED_DATE <= ?`;

// 출하 이력 조회 (미완성 주문날짜, 랏번호 안들어감)
const outboundList = `SELECT SHIP_NO,
 REQ_ID, 
 PRD_NAME,
 CUS_NAME, 
 SHIP_QTY, 
 DELIVERY,
 SHIP_DATE, 
 CAR_NO, 
 SHIP_MANAGER,
 SHIP_STATUS
 FROM REQUSET_SHIPMENT;`;

module.exports = {
  insertAccount,
  inboundList,
  getNextLotNo,
  inboundInsert,
  inboundSearch,
  outboundList,
};
