const _ = require("lodash");
const User = require("../models/User");
const catchErr = require("../utilities/catchErr");
const sendMail = require("../services/emailService");
const throwError = require("../utilities/errorHandler");
const { generateOTP, createToken } = require("../utilities/helpers/help");
const Payment = require("../models/Payment");

// Logs user into their account
exports.login = catchErr(async (req, resp, next) => {
  const { email, password } = req.body;
  let user = await User.findOne({
    email: email.toLowerCase(),
  });

  if (!user || !(await user.comparePassword(password)))
    return next(new throwError("Invalid email or password", 400));

  if (user.status !== "active")
    return next(new throwError("Access denied, please contact the admin", 401));

  /* return token here so that user can verify email
  if (!user.isEmailVerified)
    return next(new throwError("kindly verify your email to continue", 400)); */

  const token = createToken(user);
  user = _.pick(user, ["firstname", "lastname", "email", "phone"]);

  const subInst = await Payment.findOne({
    email: user.email,
    status: true,
  });

  return resp.status(200).json({
    status: true,
    message: "login successful",
    token,
    user: {
      ...user,
      is_premium: !!subInst,
    },
  });
});

// Handles user registration
exports.register = catchErr(async (req, resp, next) => {
  const { email, password, firstname, lastname, phone, confirmPassword } =
    req.body;

  if (
    !email ||
    !password ||
    !firstname ||
    !lastname ||
    !phone ||
    !confirmPassword
  ) {
    return next(new throwError("Ensure all fields are filled", 400));
  }

  if (password !== confirmPassword) {
    return next(
      new throwError("Password and confirm password does not match", 400),
    );
  }

  if (await User.findOne({ email })) {
    return next(new throwError("Email already exists", 406));
  }

  const otp = generateOTP().toString();
  let userInst = await User.create({
    firstname,
    lastname,
    phone,
    password,
    otpToken: otp,
    isEmailVerified: false,
    isAccountVerified: false,
    email: email.toLowerCase(),
    customer_reference: `BTP-${(await User.find({}).length) + 1}`,
  });

  const token = createToken(userInst);
  userInst = _.pick(userInst, ["firstname", "lastname", "email", "phone"]);

  const message = {
    subject: "Betuptip Activation 🎉🎉",
    html: `<div>
              <p style="">
                We are glad that you've successfully created an account for Betuptip! 
              </p>
              <p>
                Welcome to Betuptip <br/> Explore the world of endless possibilities with future predictions thats gives you a better stand  <br/>
                Enter the OTP Verification Code to verify your email address.
              </p>
              <h3 style="font-size:40px ; font-weight:500; text-align:center ">
              Your Betuptip Verification Code.
              </h3>
              <h1 style="font-size:40px ; font-weight:600; text-align:center; color:black; ">
                  ${otp}
              </h1>
                <p>
                  Join, Stay Tuned for More Important Updates.
                </p>
              <div style="padding:10px 0px 0px 0px; text-align:center;">
                  © Copyright. betuptip.com 
              </div>
          </div>`,
  };

  if (process.env.DEV_ENV === "production") {
    return await sendMail(email, message).then(() =>
      resp.status(201).json({
        status: true,
        message: "we have sent a Verification code to your email address",
        token,
        user: {
          ...userInst,
          is_premium: false,
        },
      }),
    );
  }

  resp.status(201).json({
    status: true,
    message: `we have sent a Verification code ${otp} to your email address`,
    token,
    user: {
      ...userInst,
      is_premium: false,
    },
  });
});

// Verifies user's email
exports.verifyEmail = catchErr(async (req, resp, next) => {
  const { otp } = req.body;
  const { email } = req.user;
  const user = await User.findOne({ email }).select("-password");

  if (!user) return next(new throwError("Unauthorised!", 401));

  if (user.isEmailVerified)
    return next(new throwError("Your is verified already", 403));

  if (!(await user.compareEmailOTP(otp.toString())))
    return next(new throwError("Invalid OTP code", 400));

  user.otpToken = undefined;
  user.isEmailVerified = true;
  user.isAccountVerified = true;
  await user.save();

  return resp.status(202).json({
    status: true,
    message: "Email verification successful",
  });
});

// Resends OTP (email verification)
exports.resendEmailOtp = catchErr(async (req, resp, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new throwError("Email cannot be blank", 400));
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return next(new throwError("Invalid email address", 400));

  const otp = generateOTP().toString();
  user.otpToken = otp;
  user.isAccountVerified = false;
  user.isEmailVerified = false;
  await user.save();

  const message = {
    subject: "Betuptip Activation 🎉🎉",
    html: `<div>
              <p style="">
                We are glad that you've successfully created an account for Betuptip! 
              </p>
              <p>
                Welcome to Betuptip <br/> Explore the world of endless possibilities with future predictions thats gives you a better stand  <br/>
                Enter the OTP Verification Code to verify your email address.
              </p>
              <h3 style="font-size:40px ; font-weight:500; text-align:center ">
                Your Betuptip Verification Code.
              </h3>
              <h1 style="font-size:40px ; font-weight:600; text-align:center; color:black; ">
                  ${otp}
              </h1>
                <p>
                  Join, Stay Tuned for More Important Updates.
                </p>
              <div style="padding:10px 0px 0px 0px; text-align:center;">
                  © Copyright. betuptip.com 
              </div>
          </div>`,
  };

  if (process.env.DEV_ENV === "production")
    return await sendMail(email, message).then(() => resp.status(204).json({}));

  return resp.status(204).json({});
});

// Handles password reset
exports.resetPassword = catchErr(async (req, resp, next) => {
  const { password, email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) return next(new throwError("Invalid email address", 404));

  if (!user.emailResetTokenStatus) {
    return next(new throwError("Failed to reset your password!", 403));
  }

  user.password = password;
  user.emailResetTokenStatus = undefined;
  user.resetPasswordToken = undefined;
  await user.save();

  resp
    .status(200)
    .json({ status: true, message: "Password reset successfully" });
});

// Sends OTP code (forgot password)
exports.getPasswordOtp = catchErr(async (req, resp, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new throwError("Email cannot be blank", 400));
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return next(new throwError("Invalid email address", 404));

  const otp = generateOTP().toString();
  user.resetPasswordToken = otp;
  user.emailResetTokenStatus = false;
  await user.save();

  const message = {
    subject: "Betuptip Password Verification",
    html: `<div>
            Betuptip <br/> Explore the world of endless possibilities with future predictions thats gives you a better stand  <br/>
            <h3 style="font-size:30px ; font-weight:500; text-align:center ">
              Your Reset Verification Code.
            </h3>

            <h1 style="font-size:40px ; font-weight:600; text-align:center; color:black; ">
                ${otp}
            </h1>
              
            <div style="padding:10px 0px 0px 0px; text-align:center;">
                © Copyright. usebetuptips.com 
            </div>
          </div>  `,
  };

  if (process.env.DEV_ENV === "production") {
    return await sendMail(email, message).then(() =>
      resp.status(200).json({
        status: true,
        message: "we have sent a 6-digit reset code to your email address",
      }),
    );
  }

  return resp.status(200).json({
    status: true,
    message: `we have sent a 6-digit ${otp} reset code to your email address`,
  });
});

// Resends OTP for password reset
exports.resendPasswordOtp = catchErr(async (req, resp, next) => {
  const { email } = req.body;
  if (!email) return next(new throwError("Email cannot be blank", 400));

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return next(new throwError("Invalid email address", 404));

  const otp = generateOTP().toString();
  user.resetPasswordToken = otp;
  user.emailResetTokenStatus = false;
  await user.save();

  const message = {
    subject: "Betuptip Password Verification",
    html: `<div>
            Betuptip <br/> Explore the world of endless possibilities with future predictions thats gives you a better stand  <br/>
            <h3 style="font-size:30px ; font-weight:500; text-align:center ">
              Your Reset Verification Code.
            </h3>

            <h1 style="font-size:40px ; font-weight:600; text-align:center; color:black; ">
                ${otp}
            </h1>
            
            <div style="padding:10px 0px 0px 0px; text-align:center;">
                © Copyright. usebetuptips.com 
            </div>
          </div>`,
  };

  if (process.env.DEV_ENV === "production") {
    return await sendMail(email, message).then(() =>
      resp.status(200).json({
        status: true,
        message: "we have sent a 6-digit reset code to your email address",
      }),
    );
  }

  return resp.status(200).json({
    status: true,
    message: `we have sent a 6-digit ${otp} reset code to your email address`,
  });
});

// Verifies forgot password's OTP
exports.verifyPasswordOtp = catchErr(async (req, resp, next) => {
  const { otp, email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) return next(new throwError("Invalid email addresss", 404));

  if (user.emailResetTokenStatus)
    return next(new throwError("OTP has been verified", 403));

  if (!(await user.compareOTP(otp)))
    return next(new throwError("Invalid OTP code", 400));

  user.emailResetTokenStatus = true;
  await user.save();

  return resp.status(202).json({
    status: true,
    message: "verification successful",
  });
});

// Refreshes users token
exports.retsetUserToken = catchErr(async (req, resp, next) => {
  const { id, isPremium } = req.user;
  const user = await User.findById(id).select("-password");
  if (!user) return next(new throwError("Invalid authorization", 401));

  const token = createToken(user);
  return resp.status(200).json({
    status: true,
    isPremium,
    token,
    user,
  });
});
