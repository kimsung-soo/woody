// marketingRouter.js

const express = require("express");
const router = express.Router();
const marketingService = require("../services/marketingService.js");

// 거래처 등록
router.post("/marketing/insertacc", async (req, res) => {
  // const body = req.body;
  /* 객체 구조 분해 할당 방식 */
  const { body } = req;
  try {
    const result = await marketingService.addAccount(body);
    res.send(result);
  } catch (e) {
    console.error(e);
    res.send({ error: e });
  }
});

// 거래처 목록 조회
router.get("/marketing/getacclist", async (req, res) => {
  try {
    const result = await marketingService.getAccountList();
    res.send(result);
  } catch (e) {
    console.error(e);
    res.send({ error: e });
  }
});

// 제품 목록 조회
router.get("/marketing/getitemlist", async (req, res) => {
  try {
    const result = await marketingService.getItemList();
    res.send(result);
  } catch (e) {
    console.error(e);
    res.send({ error: e });
  }
});

// 주문 등록
router.post("/marketing/insertorder", async (req, res) => {
  const { body } = req;
  try {
    const result = await marketingService.addOrder(body);
    res.send(result);
  } catch (e) {
    console.error(e);
    res.send({ error: e });
  }
});

// 태완 - 입고
router.get("/inboundList", async (req, res) => {
  let list = await marketingService.inboundList();
  res.send(list);
});

// 입고 등록
router.post("/inboundInsert", async (req, res) => {
  try {
    const data = req.body;
    // 랏번호 생성
    const lotResult = await marketingService.getNextLotNo();
    const lot = lotResult[0]["generate_lot_number()"];

    // 열(column) 기반 -> 행(row) 기반 변환
    const rows = data.RECEIVED_QTY.map((_, idx) => ({
      RECEIVED_QTY: data.RECEIVED_QTY[idx],
      RECEIVED_DATE: data.RECEIVED_DATE[idx],
      PRD_CERT_ID: data.PRD_CERT_ID[idx],
      PRD_LOT: lot,
    }));
    let result = await marketingService.inboundInsert(rows);
    res.json(result);
  } catch (e) {
    console.log(e);
  }
});

// 검색

router.post("/inboundSearch", async (req, res) => {
  try {
    const data = req.body;
    let result = await marketingService.inboundSearch(data);
    res.json(result);
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
