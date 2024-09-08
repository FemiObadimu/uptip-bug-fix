const catchErr = require("../utilities/catchErr");
const throwError = require("../utilities/errorHandler");
const Subscription = require("../models/Subscription");
const APIFeature = require("../utilities/APIFeature");

exports.createSubscription = catchErr(async (req, resp, next) => {
  const { name, duration, price, discount } = req.body;

  if (!name || !duration || !price)
    return next(new throwError("Ensure all fields are filled", 400));

  const subInst = new APIFeature(
    Subscription.create({
      name,
      duration,
      price,
      percentage_discount: discount ?? 0,
    }),
  );

  const subscription = await subInst.query;
  resp.status(201).json({
    status: true,
    message: "Subscription plan created succesfully",
    subscription,
  });
});

exports.getSubscriptions = catchErr(async (req, resp, next) => {
  const subInst = new APIFeature(Subscription, req.query).find().limitFields();

  const subscriptions = await subInst.query;

  if (!subscriptions)
    return next(new throwError("Subscription not found", 404));

  return resp.status(200).json({
    status: true,
    message: "Subscriptions fetched successfully",
    count: subscriptions.length,
    subscriptions,
  });
});

exports.getSubscription = catchErr(async (req, resp, next) => {
  const { id } = req.params;
  const subInst = new APIFeature(Subscription, req.query).find(id);
  const subscription = await subInst.query;

  if (!subscription) return next(new throwError("Subscription not found", 404));

  resp.status(200).json({
    status: true,
    message: "Subscription fetched successfully",
    subscription,
  });
});

// Updates a single subscription
exports.updateSubscription = catchErr(async (req, resp, next) => {
  const { id } = req.params;
  const subInst = new APIFeature(Subscription.findById(id)).limitFields();
  const subscription = await subInst.query;

  if (!subscription) return next(new throwError("Subscription not found", 404));

  for (const key in req.body) {
    if (Object.hasOwnProperty.call(req.body, key)) {
      subscription[key === "discount" ? "percentage_discount" : key] =
        req.body[key];
    }
  }

  await subscription.save();
  return resp.status(200).json({
    status: true,
    message: "Subscription updated successfully",
    subscription: subscription,
  });
});

// Deletes all subscriptions
exports.deleteSubscriptions = catchErr(async (req, resp, next) => {
  const { id } = req.params;
  const del = await Subscription.findOneAndDelete({ _id: id });

  if (!del) {
    return next(new throwError("Subscription doesn't exists", 404));
  }

  return resp.status(204).json({
    status: true,
    message: "Subscription deleted successfully",
  });
});
