const express = require("express");
const router = express.Router();
const predCtrl = require("../controllers/predictionController");
const {
  freePreds,
  recentPreds,
  todaysPreds,
} = require("../middlewares/predictionMiddleware");

const { authMiddleware } = require("../middlewares/authMiddleware");

router.get("/", predCtrl.getPredictions);
router.get("/free", freePreds, predCtrl.getPredictions);
router.get("/recent", recentPreds, predCtrl.getPredictions);
router.get("/today", authMiddleware, todaysPreds, predCtrl.getPredictions);

router.post("/", predCtrl.createPrediction);

router.delete("/:id", predCtrl.deletePrediction);

module.exports = router;
