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

// 사원 등록
const masterEmpInsert = `INSERT INTO EMPLOYEES (
                         EMP_NAME, 
                         PHONE,  
                         EMAIL, 
                         DEPT_NAME, 
                         AUTH, 
                         ADDR,  
                         EMP_STATUS
                         )
                         VALUES(?, ?, ?, ?, ?, ?, ?)`;

// 사원 정보 수정
const masterEmpUpdate = `UPDATE EMPLOYEES
                         SET  EMP_NAME = ?, 
                              PHONE = ?,  
                              EMAIL = ? , 
                              DEPT_NAME = ?, 
                              AUTH = ?, 
                              ADDR = ?,  
                              EMP_STATUS =?
                         WHERE EMP_NO = ? `;

// 사원 삭제
const masterEmpDelete = `DELETE FROM EMPLOYEES
                         WHERE EMP_NO = ? `;

module.exports = {
  masterEmpSelect,
  masterEmpInsert,
  masterEmpUpdate,
};
