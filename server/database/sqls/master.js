// 사원 조회
const masterEmpSelect = ` SELECT EMP_NO,
                                EMP_NAME, 
                                EMP_HDATE, 
                                ADDR,  
                                PHONE, 
                                EMAIL, 
                                DEPT_NAME, 
                                AUTH, 
                                EMP_EDATE,
                                EMP_STATUS
                         FROM EMPLOYEES `;

// 공통코드 조회
const commonDept = `SELECT code_name 
from code_master
where group_code = 'AA'`;
const commonAuth = `SELECT code_name 
from code_master
where group_code = 'BB'`;

// 사원 등록
const masterEmpInsert = `
                         INSERT INTO EMPLOYEES (
                                     EMP_NO,
                                     EMP_NAME,
                                     PHONE,
                                     EMAIL,
                                     DEPT_NAME,
                                     AUTH,
                                     ADDR,
                                     EMP_STATUS,
                                     EMP_HDATE,
                                     EMP_EDATE)
VALUES (GetNextEmp_NO(),?,?,?,?,?,?,?,?,?) `;

// 사원 정보 수정
const masterEmpUpdate = `UPDATE EMPLOYEES
                         SET  EMP_NAME = ?, 
                              PHONE = ?,  
                              EMAIL = ? , 
                              DEPT_NAME = ?, 
                              AUTH = ?, 
                              ADDR = ?,  
                              EMP_STATUS = ?,
                              EMP_HDATE = ?,
                              EMP_EDATE = ?
                         WHERE EMP_NO = ? `;

// 사원 삭제
const masterEmpDelete = `DELETE FROM EMPLOYEES
                         WHERE EMP_NO = ? `;

// 사원 검색

const masterEmpSelectName = ` SELECT EMP_NO,
                                EMP_NAME, 
                                EMP_HDATE, 
                                ADDR,  
                                PHONE, 
                                EMAIL, 
                                DEPT_NAME, 
                                AUTH, 
                                EMP_EDATE,
                                EMP_STATUS
                         FROM EMPLOYEES 
                         WHERE EMP_NAME LIKE ?`;

// 제품 조회

const masterPrdSelect = ``;

// BOM 관리에서 제품조회
const BOMprdSelect = `SELECT p.PRD_NAME,
                             p.PRD_CODE,
                             p.PRD_TYPE, 
                             d.BOM_CODE, 
                             p.PRD_DATE, 
                             p.PRD_WRITER
                      FROM PRODUCT AS p
                      LEFT JOIN BOM AS d
                           ON p.PRD_CODE = d.PRD_CODE `;

// 제품 클릭시 제품에 대한 BOM 조회
const BOMbomSelect = `SELECT b.BOM_NO, 
                             b.BOM_CODE,
                             p.PRD_NAME,
                             b.BOM_WRITER,
                             b.BOM_RDATE ,
                             b.BOM_VER
                      FROM BOM AS b LEFT JOIN PRODUCT AS p
                            ON b.PRD_CODE = p.PRD_CODE
                      WHERE b.PRD_CODE = ? `;

// 저장 클릭 => bom 등록

module.exports = {
  masterEmpSelect,
  masterEmpInsert,
  masterEmpUpdate,
  masterEmpDelete,
  masterEmpSelectName,
  BOMprdSelect,
  BOMbomSelect,
};
