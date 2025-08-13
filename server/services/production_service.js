const mariadb = require("../database/mapper.js");

const productionSelect = async () => {
  let list = await mariadb
    .query("productionAllSelect")
    .catch((err) => console.log(err));
  return list;
};

module.exports = {
  productionSelect,
};
