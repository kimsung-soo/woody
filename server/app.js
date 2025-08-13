const express = require("express");
const cors = require("cors");

require("dotenv").config({ path: "./database/dbconfig.env" });

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.listen(PORT, () => {
  console.log(`✅ Node 서버 실행: http://localhost:${PORT}`);
});

const boardRouter = require("./routers/board_router.js");
app.use(boardRouter);
const productionRouter = require("./routers/production_router.js");
app.use(productionRouter);

// 품질
const qualityRouter = require("./routers/quality_router.js");
app.use(qualityRouter);
const MasterRouter = require("./routers/master_router.js");
app.use(MasterRouter);
const materialsRouter = require("./routers/materials_router.js");
app.use(materialsRouter);
