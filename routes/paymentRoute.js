/* eslint-disable linebreak-style */
const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const paymentMiddleware = require("../middlewares/paymentMiddleware");
const paymentCtrl = require("../controllers/paymentController");

router.post(
  "/initialise",
  authMiddleware,
  paymentMiddleware,
  paymentCtrl.initializePayment,
);

router.post(
  "/webhook",
  authMiddleware,
  paymentMiddleware,
  paymentCtrl.webHookTest,
);

router.post(
  "/create-payment",
  paymentCtrl.verifyAndCreatePayment,
);

router.get(
  "/payment-details",
  authMiddleware,
  paymentMiddleware,
  paymentCtrl.getPayment,
);

module.exports = router;
