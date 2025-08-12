const mariadb = require("../database/mapper.js");

const matarialSelect = async () => {
  let list = await mariadb
    .query("matarialsAllSelect")
    .catch((err) => console.log(err));
};

module.exports = {
  matarialSelect,
};
