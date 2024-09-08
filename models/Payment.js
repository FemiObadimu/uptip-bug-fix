/* eslint-disable linebreak-style */
const mongoose = require("mongoose");

const paymentSchema = mongoose.Schema(
  {
    full_name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    reference: {
      type: String,
      unique: [true, "refrence cannot have a duplicate value"],
    },
    user_id: {
      type: String,
    },
    created_at: {
      type: Date,
    },
    expires_at: {
      type: Date,
    },
    status: {
      type: Boolean,
    },
  },
  { timestamp: true },
);

module.exports = mongoose.model("Payment", paymentSchema);
