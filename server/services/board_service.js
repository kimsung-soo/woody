const mariadb = require("../database/mapper.js");

// 연결 쿼리 테스트
const findAll = async () => {
  let list = await mariadb.query("selectBoardList");
  return list;
};

module.exports = {
  findAll,
};
