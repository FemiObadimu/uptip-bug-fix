const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["regular", "admin", "adminn"],
      default: "regular",
    },
    status: {
      type: String,
      enum: ["active", "blocked", "suspend"],
      default: "active",
    },
    firstname: {
      type: String,
      required: [true, "Enter your Firstname"],
    },
    lastname: {
      type: String,
      required: [true, "Enter your Lastname"],
    },
    email: {
      type: String,
      required: [true, "Enter your Email Address"],
      match: [
        // eslint-disable-next-line no-useless-escape
        /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
        "Enter a Valid Email Address",
      ],
      unique: true,
    },
    emailResetToken: {
      type: String,
    },
    emailResetTokenStatus: {
      type: Boolean,
    },
    kyc_complete: {
      type: Boolean,
    },
    countrycode: {
      type: String,
    },
    defaultCurrency: {
      type: String,
    },
    phone: {
      type: String,
      minlength: 4,
      maxlength: 15,
    },
    password: {
      type: String,
      required: [true, "Enter your Password"],
      minlength: 6,
    },
    otpToken: {
      type: String,
    },
    phoneToken: {
      type: String,
    },
    customer_reference: {
      type: String,
    },
    isAccountVerified: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
    },
    profileImage: {
      type: String,
    },
  },
  { timestamps: true },
);

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.compareEmailOTP = async function (otpCode) {
  return await bcrypt.compare(otpCode, this.otpToken);
};

userSchema.methods.compareOTP = async function (otp) {
  return await bcrypt.compare(otp, this.resetPasswordToken);
};

userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSaltSync(12);

  if (this.password && this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, salt);
  }

  if (this.otpToken && this.isModified("otpToken")) {
    this.otpToken = await bcrypt.hash(this.otpToken, salt);
  }

  if (this.resetPasswordToken && this.isModified("resetPasswordToken")) {
    this.resetPasswordToken = await bcrypt.hash(this.resetPasswordToken, salt);
  }

  next();
});

module.exports = mongoose.model("Users", userSchema);
