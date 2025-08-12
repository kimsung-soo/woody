const boards = require("./sqls/boards.js");
const boms = require("./sqls/product.js");
const matarials = require("./sqls/matarials.js");

module.exports = {
  ...boards,
  ...boms,
  ...matarials,
};
