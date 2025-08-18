const express = require("express");
const router = express.Router();
const materialService = require("../services/materials_service");

router.get("/materials", async (req, res) => {
  let materialList = await materialService.materialsSelect();
  res.send(materialList);
});

// 자재발주서 등록
router.post("/material/order/insert", async (req, res) => {
  try {
    const { orderData, detailList } = req.body;

    // 1. service를 통해 다음 발주 번호(PO_NO) 생성
    const newPO_NO = await materialService.getNextPONo();

    // 2. 생성된 PO_NO를 orderData에 추가
    orderData.PO_NO = newPO_NO;

    // 3. 발주서 등록 (PURCHASE_ORDER)
    await materialService.materialOrder(orderData);

    // 4. 발주서 상세 등록 (PURCHASE_ORDER_DETAIL)
    for (const detail of detailList) {
      await materialService.materialOrderDetail({
        ...detail,
        PO_NO: newPO_NO, // 새로 생성된 PO_NO 사용
      });
    }

    res.status(200).json({ message: "등록 완료", poNo: newPO_NO });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "등록 실패", error: err.message });
  }
});

// 자재발주서 조회
router.get("/materials/order/select", async (req, res) => {
  let materialOrderList = await materialService.getMaterialOrders();
  res.send(materialOrderList);
});

// 임시 입고 등록
router.post("/materialInsert", async (req, res) => {
  try {
    let dataToProcess = req.body;

    // req.body가 배열이 아니면, 배열로 감싸줍니다.
    if (!Array.isArray(dataToProcess)) {
      dataToProcess = [dataToProcess];
    }

    console.log("처리할 데이터:", dataToProcess);

    const result = await materialService.insertMaterialTmp(dataToProcess);
    res.status(200).send(result);
  } catch (error) {
    console.error("materialInsert 오류:", error);
    res.status(500).send({ error: "등록 실패" });
  }
});

module.exports = router;
