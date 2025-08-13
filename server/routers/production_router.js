const express = require("express");
const router = express.Router();
const matarialService = require("../services/matarials_service");

router.get("/productions", async (req, res) => {
  let matarialList = await matarialService
    .matarialSelect()
    .catch((err) => console.log(err));

  res.send(matarialList);
});
