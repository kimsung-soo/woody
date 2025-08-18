// marketing.js

const insertAccount = `
    insert into CUSTOMERS (cus_id, cus_type, cus_name, cus_manager, cus_use, cus_note)
    values (nextCode("acc"), ?, ?, ?, ?, ?);
`;

// 태완 작업.
const inboundList = `SELECT r.RECEIVED_NO, c.PRD_CODE,c.PRD_NAME, c.Q_CHECKED_DATE,c.TOTAL_QTY, r.PRD_LOT
FROM PRODUCT_RECEIPT AS r RIGHT JOIN PRODUCT_CERTIFICATE AS c
						   ON r.PRD_CERT_ID = c.PRD_CERT_ID;`;

// LOT넘버 생성
const getNextLotNo = `SELECT generate_lot_number()`;
const inboundInsert = `INSERT INTO PRODUCT_RECEIPT
VALUES(?,?,?,?);`;

module.exports = {
  insertAccount,
  inboundList,
  getNextLotNo,
  inboundInsert,
};
