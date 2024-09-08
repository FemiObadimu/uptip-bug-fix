const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const userCtrl = require("../controllers/userController");
const validation = require("../utilities/helpers/validator");

const {
  verifyEmail,
  changePassword,
} = require("../utilities/helpers/validationSchema");

router.get("/", authMiddleware, userCtrl.getUser);

// Update a subscription by ID (admin only)
router.patch(
  "/email",
  authMiddleware,
  validation.validateBody(verifyEmail),
  userCtrl.updateEmail,
);

// Update a subscription by ID (admin only)
router.patch(
  "/password",
  authMiddleware,
  validation.validateBody(changePassword),
  userCtrl.updatePassword,
);

// Delete subscriptions (admin only)
router.delete("/delete-account", authMiddleware, userCtrl.deleteUser);

module.exports = router;
