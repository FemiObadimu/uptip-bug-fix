const User = require("../models/User");
const APIFeature = require("../utilities/APIFeature");
const catchErr = require("../utilities/catchErr");
const throwError = require("../utilities/errorHandler");
const { parseQuery } = require("../utilities/helpers/help");

exports.testAPIFeature = catchErr(async (req, resp) => {
  const reqQuery = { ...req.query, role: { ne: "admin" } };
  const { query } = new APIFeature(User, reqQuery).find().sort().limitFields();
  const users = await query;

  resp.status(200).json({
    status: true,
    message: "Request received successfully",
    results: users.length,
    users,
  });
});

exports.createAdmin = catchErr(async (req, resp, next) => {
  let { email, password, firstname, lastname, phone, role } = req.body;
  role = role ?? "admin";

  if (!email || !password || !firstname || !lastname || !phone || !role)
    return next(new throwError("Ensure all fields are filled", 400));

  if (await User.findOne({ email })) {
    return next(
      new throwError(
        "Email already exists, please use another email address",
        403,
      ),
    );
  }

  const newUser = await User.create({
    firstname,
    lastname,
    password,
    phone,
    role,
    isEmailVerified: false,
    isAccountVerified: false,
    email: email.toLowerCase(),
    customer_reference: `BTP-${(await User.countDocuments()) + 1}`,
  });

  resp.status(201).json({
    status: true,
    message: "User created successfully",
    user: newUser,
  });
});

exports.getAllUsers = catchErr(async (req, resp) => {
  const queryParams = { ...req.query, role: { ne: "admin" } };
  const { query } = new APIFeature(User, queryParams).find().limitFields();
  const users = await query;

  resp.status(200).json({
    status: true,
    message: "Request received successfully",
    results: users.length,
    users,
  });
});

exports.getAllAdmins = catchErr(async (req, resp) => {
  const { query } = new APIFeature(User, { ...req.query, role: "admin" })
    .find()
    .limitFields();
  const admins = await query;

  resp.status(200).json({
    status: true,
    message: "Request received successfully",
    results: admins.length,
    admins,
  });
});

exports.deleteAllUsers = catchErr(async (req, resp) => {
  const query = parseQuery({ ...req.query, role: { ne: "admin" } });
  await User.deleteMany(query);

  resp.status(204).json({
    status: true,
    message: "Users deleted successfully",
  });
});

exports.restrictUsersAccess = catchErr(async (req, resp, next) => {
  const { status, email } = req.body;
  if (!status || !email) {
    return next(new throwError("Please provide status and email", 400));
  }

  const { query } = new APIFeature(User).find({ email, role: { ne: "admin" } });
  const user = await query;

  if (!user) return next(new throwError("User account does not exist", 400));

  if (user.status === status)
    return next(new throwError(`User account is already ${status}`, 400));

  user.status = status;
  await user.save();

  resp.status(200).json({
    status: true,
    message: `User account ${status}ed successfully`,
  });
});
