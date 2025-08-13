// 원자재 검수 조회
// const selectProductCertificate = `SELECT *
// FROM PRODUCT_CERTIFICATE`;

const selectProductCertificate = `SELECT PRD_CERT_ID, PRD_ID, PRD_NAME, Q_CHECKED_DATE, PRD_STATUS
FROM PRODUCT_CERTIFICATE`;

//
module.exports = {
  selectProductCertificate,
};
