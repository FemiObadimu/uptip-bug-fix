const Prediction = require("../models/Prediction");
// const Payment = require("../models/Payment");
const catchErr = require("../utilities/catchErr");
const throwError = require("../utilities/errorHandler");
const APIFeature = require("../utilities/APIFeature");
// const { formatReadableDate } = require("../utilities/helpers/help");

// Gets a single user's information
exports.getPredictions = catchErr(async (req, resp) => {
  const query = { fields: "-type", ...req.query };
  const userInst = new APIFeature(Prediction, query).find().limitFields();
  let predictions = await userInst.query;

  resp.status(200).json({
    status: true,
    message: "Fetched successfully",
    count: predictions.length,
    predictions,
  });
});

exports.createPrediction = catchErr(async (req, resp, next) => {
  let preds = null;

  if (Array.isArray(req.body)) {
    preds = req.body.map((itm) => {
      const { event, prematch, selection, type } = itm;

      if (!event || !selection || !type || !prematch)
        return next(new throwError("Ensure all fields are filled", 400));

      return { event, prematch, selection, type };
    });
  } else {
    const { event, prematch, selection, type } = req.body;

    if (!event || !selection || !type || !prematch)
      return next(new throwError("Ensure all fields are filled", 400));

    preds = { event, prematch, selection, type };
  }

  const predInst = new APIFeature(Prediction.create(preds));
  let prediction = await predInst.query;

  resp.status(200).json({
    status: true,
    message: "Created successfully",
    prediction,
  });
});

exports.deletePrediction = catchErr(async (req, resp, next) => {
  const { id } = req.params;
  const del = await Prediction.findOneAndDelete({ _id: id });

  if (!del) return next(new throwError("Unable to process your request", 404));

  return resp.status(204).json({
    status: true,
    message: "Deleted successfully",
  });
});

exports.updateSubscription = catchErr(async (req, resp, next) => {
  const { id } = req.params;
  const subInst = new APIFeature(Prediction.findById(id));
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
