const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Payment = require("../models/Payment");
const catchErr = require("../utilities/catchErr");
const APIFeature = require("../utilities/APIFeature");
const throwError = require("../utilities/errorHandler");

exports.authMiddleware = catchErr(async (req, res, next) => {
  const token = req.header("usebetup-token");
  if (!token) return next(new throwError("Unauthorised", 401));

  const _jwt = jwt.verify(token, process.env.JWTSECRET);
  const userInst = await new APIFeature(User)
    .find({
      _id: _jwt?.userData?.id,
      status: "active",
    })
    .limitFields().query;

  if (!userInst) return next(new throwError("Invalid token sent", 401));

  const subInst = await Payment.findOne({
    email: userInst.email,
    status: true,
  });

  req.user = {
    id: userInst._id,
    email: userInst.email?.toLowerCase(),
    firstname: userInst.firstname,
    lastname: userInst.lastname,
    isPremium: !!subInst,
  };

  next();
});

exports.permitRole = (...role) => {
  const queryStr = role.map((itm) => ({ role: itm }));

  return catchErr(async (req, resp, next) => {
    const { id } = req.user;

    const user = await User.findOne({ _id: id, $or: [...queryStr] });

    if (!user) return next(new throwError("Unauthorised", 401));

    next();
  });
};
