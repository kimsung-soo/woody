const mariadb = require("../database/mapper.js");

// 사원 조회
const masterEmpSelect = async () => {
  let list = await mariadb.query("masterEmpSelect");
  return list;
};

// 사원 등록
const masterEmpInsert = async (data) => {
  const params = [
    data.EMP_NAME,
    data.PHONE,
    data.EMAIL,
    data.DEPT_NAME,
    data.AUTH,
    data.ADDR,
    data.EMP_STATUS,
  ];
  let result = await mariadb.query("masterEmpInsert", params);
  return result;
};

// 사원 수정
const masterEmpUpdate = async (data) => {
  const params = [
    data.EMP_NAME,
    data.PHONE,
    data.EMAIL,
    data.DEPT_NAME,
    data.AUTH,
    data.ADDR,
    data.EMP_STATUS,
    data.EMP_NO,
  ];
  let result = await mariadb.query("masterEmpUpdate", params);
  return result;
};

// 사원 삭제
const masterEmpDelete = async (data) => {
  const params = [data.EMP_NO];
  let result = await mariadb.query("masterEmpDelete", params);
  return result;
};

module.exports = {
  masterEmpSelect,
  masterEmpInsert,
  masterEmpUpdate,
  masterEmpDelete,
};
