// 원자재 검수 조회
// const selectProductCertificate = `SELECT *
// FROM PRODUCT_CERTIFICATE`;

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

module.exports = {
  selectProductCertificate,
  selectQStandard,
  qcStatus,
};
