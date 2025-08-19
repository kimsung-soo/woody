// 원자재 검수 조회
// const selectProductCertificate = `SELECT *
// FROM PRODUCT_CERTIFICATE`;

// 합격/불합격 원자재 조회
const materialSelect = `
SELECT M.MAT_CERT_ID,
       M.RECEIPT_NO,
	   M.MAT_CODE,
       M.TOTAL_QTY,
       M.Q_CHECKED_DATE,
       R.RJT_REASON
       FROM MATERIAL_CERTIFICATE M
       LEFT JOIN REJECTED_MATERIAL R
       ON M.RECEIPT_NO = R.RECEIPT_NO
`;

// 원자재검수관리 조회
const matManagement = `
SELECT RECEIPT_NO, RECEIPT_DATE, SUPPLYER, MAT_CODE, RECEIVED_QTY, TMP_STATUS
FROM MAT_IN_TMP
`;

// 합격원자재 등록
const passMat = `
INSERT INTO MATERIAL_CERTIFICATE
  (MAT_CERT_ID, RECEIPT_NO, Q_STD_ID, MAT_CODE, TOTAL_QTY, Q_CHECKED_DATE, CREATED_BY)
VALUES (GetNextMAT_CERT_ID(), ?, NULL, ?, ?, ?, ?)`;

// 불합격원자재 등록
const rejectMat = `
INSERT INTO REJECTED_MATERIAL
  (RJT_MAT_ID, RECEIPT_NO, MAT_CODE, RJT_REASON, Q_CHECKED_DATE, TOTAL_QTY, MAT_STAUTS, CREATED_BY)
VALUES ()
`;

// 제품성적서조회
const selectProductCertificate = `SELECT PRD_CERT_ID, PRD_ID, PRD_NAME, Q_CHECKED_DATE, PRD_STATUS
FROM PRODUCT_CERTIFICATE`;

// 품질기준조회
const selectQStandard = `SELECT STD_NAME, STD_CONTENT, ALLOWED_VALUE 
                         FROM QUALITY_STANDARD`;
// 원자재 검수 관리

// 품질공통코드
const qcStatus = `
SELECT code, code_name
FROM code_master
WHERE group_code = 'DD';
`;

// 원자재 입고공통코드
const receiveStatus = `
SELECT code, code_name
FROM code_master
WHERE group_code = 'YY'
`;

module.exports = {
  materialSelect,
  matManagement,
  passMat,
  selectProductCertificate,
  selectQStandard,
  qcStatus,
  receiveStatus,
};
