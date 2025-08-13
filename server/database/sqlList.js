const boards = require("./sqls/boards.js");
const boms = require("./sqls/product.js");
const matarials = require("./sqls/matarials.js");
const quality = require("./sqls/quality.js");
const master = require("./sqls/master.js");

module.exports = {
  ...boards,
  ...boms,
  ...matarials,
  ...quality,
  ...master,
};
