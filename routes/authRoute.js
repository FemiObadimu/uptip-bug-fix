const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const authCtrl = require("../controllers/authController");

// Middleware to validate request body using Joi
const validation = require("../utilities/helpers/validator");
const {
  verifyEmail,
  verifyOtpCode,
  verifyOtp,
  loginSchema,
  registerSchema,
} = require("../utilities/helpers/validationSchema");

router.post("/login", validation.validateBody(loginSchema), authCtrl.login);

router.post(
  "/register",
  validation.validateBody(registerSchema),
  authCtrl.register,
);

router.post(
  "/resend-email-otp",
  validation.validateBody(verifyEmail),
  authCtrl.resendEmailOtp,
);

router.post(
  "/activate-email",
  validation.validateBody(verifyOtpCode),
  authMiddleware,
  authCtrl.verifyEmail,
);

router.post(
  "/forgot-password",
  validation.validateBody(verifyEmail),
  authCtrl.getPasswordOtp,
);

router.post(
  "/reset-password",
  validation.validateBody(loginSchema),
  authCtrl.resetPassword,
);

router.post(
  "/verify-password-otp",
  validation.validateBody(verifyOtp),
  authCtrl.verifyPasswordOtp,
);

router.post(
  "/resend-password-otp",
  validation.validateBody(verifyEmail),
  authCtrl.resendPasswordOtp,
);

router.get("/refresh-token", authMiddleware, authCtrl.retsetUserToken);

module.exports = router;
