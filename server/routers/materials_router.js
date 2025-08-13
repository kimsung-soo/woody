const express = require("express");
const router = express.Router();
const matarialService = require("../services/materials_service");

router.get("/materials", async (req, res) => {
  let materialList = await matarialService.materialsSelect();
  res.send(materialList);
});

router.post("/materialOrder", async (req, res) => {
  try {
    const { orderData, detailList } = req.body;

    await matarialService.materialOrder(orderData);

    for (const detail of detailList) {
      await matarialService.materialOrderDetail({
        ...detail,
        PO_NO: orderData.PO_NO,
      });
    }

    res.status(200).send({ message: "등록 완료" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "등록 중 오류" });
  }
});

module.exports = router;
