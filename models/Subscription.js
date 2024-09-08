const mongoose = require("mongoose");
const { getDiscountPrice } = require("../utilities/helpers/help");

const paymentSchema = mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: [true, "please, input a subscription name"],
  },
  duration: {
    type: Number,
    unique: true,
    required: [true, "please, input a subscription duration"],
  },
  price: {
    type: Number,
    unique: true,
    required: [true, "please, input a subscription duration"],
  },
  percentage_discount: {
    type: Number,
  },
  discounted_price: {
    type: Number,
  },
  discount_amount: {
    type: Number,
  },
});

paymentSchema.pre("save", function (next) {
  const discountPrice = getDiscountPrice(this.price, this.percentage_discount);

  this.discounted_price = Math.max(discountPrice, 0);
  this.discount_amount = this.price - this.discounted_price;

  next();
});

module.exports = mongoose.model("Subscription", paymentSchema);
