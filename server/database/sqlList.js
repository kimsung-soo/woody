const boards = require("./sqls/boards.js");
const boms = require("./sqls/product.js");
module.exports = {
  ...boards,
  ...boms,
};
