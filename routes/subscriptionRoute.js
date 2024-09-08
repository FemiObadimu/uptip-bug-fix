const express = require("express");
const router = express.Router();
const { authMiddleware, permitRole } = require("../middlewares/authMiddleware");
const subscriptionCtrl = require("../controllers/subscriptionController");

router.post(
  "/",
  authMiddleware,
  permitRole("admin"),
  subscriptionCtrl.createSubscription,
);

router.get("/", subscriptionCtrl.getSubscriptions);

router.get("/:id", subscriptionCtrl.getSubscription);

router.put(
  "/:id",
  authMiddleware,
  permitRole("admin"),
  subscriptionCtrl.updateSubscription,
);

router.delete(
  "/:id",
  authMiddleware,
  permitRole("admin"),
  subscriptionCtrl.deleteSubscriptions,
);

module.exports = router;
