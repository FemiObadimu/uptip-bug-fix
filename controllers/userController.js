const User = require("../models/User");
const Payment = require("../models/Payment");
const catchErr = require("../utilities/catchErr");
const throwError = require("../utilities/errorHandler");
const APIFeature = require("../utilities/APIFeature");
const { formatReadableDate } = require("../utilities/helpers/help");

exports.getUser = catchErr(async (req, resp, next) => {
  const { email } = req.user;

  if (!email) return next(new throwError("Unable to proccess request", 400));

  const userInst = new APIFeature(User)
    .find({ email, status: "active" })
    .limitFields();

  let user = await userInst.query;

  if (!user) return next(new throwError("Unable to proccess request", 400));

  const paymentInst = await Payment.findOne({ email, status: true });

  user = user.toObject();
  resp.status(200).json({
    status: true,
    message: "Fetched successfully",
    user: {
      ...user,
      "subscription Plan": paymentInst?.name ?? "No subscription plan",
      "Expiry Date": formatReadableDate(paymentInst?.expires_at) ?? "",
    },
  });
});

exports.updatePassword = catchErr(async (req, resp, next) => {
  const { id } = req.user;
  const { oldPassword, newPassword, confirmPassword } = req.body;

  let user = await User.findOne({
    _id: id,
  });

  if (!(await user?.comparePassword(oldPassword)))
    return next(new throwError("Failed to reset password", 403));

  if (newPassword !== confirmPassword) {
    return next(
      new throwError("New password and confirm password does not match", 400),
    );
  }

  user.password = newPassword;
  user.emailResetTokenStatus = undefined;
  user.resetPasswordToken = undefined;
  await user.save();

  return resp.status(200).json({
    status: true,
    message: "Password changed successfully",
  });
});

exports.updateEmail = catchErr(async (req, resp, next) => {
  const { id } = req.user;
  const { email } = req.body;

  if (!email) return next(new throwError("Email cannot be blank", 400));

  const user = await User.findOne({ _id: id });
  const email_taken = await User.findOne({
    email: email.toLowerCase(),
  });

  if (email_taken)
    return next(new throwError("Email has been used by another user", 403));

  user.email = email.toLowerCase();
  user.save();

  return resp.status(200).json({
    status: true,
    message: "Email changed successfully",
  });
});

exports.deleteUser = catchErr(async (req, resp) => {
  const { id } = req.user;

  await User.deleteOne({
    _id: id,
  });

  return resp.status(204).json({});
});
