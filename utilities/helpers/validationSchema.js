const Joi = require("joi");

exports.verifyEmail = Joi.object({
  email: Joi.string().trim().email({ tlds: false }).required(),
});

exports.changePassword = Joi.object({
  oldPassword: Joi.string().min(6).required(),
  newPassword: Joi.string().min(6).required(),
  confirmPassword: Joi.string().min(6).required(),
});

exports.loginSchema = Joi.object({
  email: Joi.string().trim().email({ tlds: false }).required(),
  password: Joi.string().min(6).required(),
});

exports.verifyOtp = Joi.object({
  email: Joi.string().trim().email({ tlds: false }).required(),
  otp: Joi.string().trim().min(6).required(),
});

exports.verifyOtpCode = Joi.object({
  otp: Joi.string().trim().min(6).required(),
});

exports.registerSchema = Joi.object({
  firstname: Joi.string().required().min(3).max(25),
  lastname: Joi.string().required().min(3).max(25),
  phone: Joi.string().min(4).max(15).required(),
  email: Joi.string().trim().email({ tlds: false }).required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string().min(6).required(),
});
