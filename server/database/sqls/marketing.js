// marketing.js

const insertAccount = `
  insert into CUSTOMERS (cus_id, cus_type, cus_name, cus_manager, cus_use, cus_note)
  values (nextCode("acc"), ?, ?, ?, ?, ?);
`;

const selectAccountList = `
  select 
    cus_id       as cusId,
    cus_type     as cusType,
    cus_name     as cusName,
    cus_manager  as cusManager,
    cus_use      as cusUse,
    cus_note     as cusNote,
    created_at   as createdAt,
    updated_at   as updatedAt
  from CUSTOMERS
  where cus_use = 1
`;

const selectItemList = `
  select 
    prd_code   as prdCode,
    prd_name   as prdName,
    prd_type   as prdType,
    prd_unit   as prdUnit,
    prd_size   as prdSize,
    prd_safeqt as prdSafeqt,
    prd_writer as prdWriter,
    prd_date   as prdDate,
    prd_note   as prdNote
  from PRODUCT
`;

const insertOrder = `
  call insertOrder(?, ?, ?, ?)
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
  selectAccountList,
  selectItemList,
  insertOrder,
  inboundList,
  getNextLotNo,
  inboundInsert,
};
