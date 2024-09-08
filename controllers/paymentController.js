/* eslint-disable linebreak-style */
const PaymentService = require("../services/paymentService");
const paymentInstance = new PaymentService();
const crypto = require("crypto");
const catchErr = require("../utilities/catchErr");
const throwError = require("../utilities/errorHandler");
const Payment = require("../models/Payment");
const secret = process.env.PAYSTACK_SECRET_KEY;
const { addDaysToCurrentDate } = require("../utilities/helpers/help");
const Subscription = require("../models/Subscription");


exports.initializePayment = catchErr(async (req, resp, next) => {
  const { email } = req.user;
  const { amount } = req.body;

  const paymentInst = await Payment.findOne({
    email,
    status: true,
  });

  if (!amount) return next(new throwError("Input a valid amount", 400));

  if (paymentInst)
    return next(new throwError("You have an active subscription plan", 403));

  const { data, message, status } = await paymentInstance.initiatePayment(
    req.body,
  );

  resp.status(200).json({
    status,
    message,
    reference: data?.reference,
    access_code: data?.access_code,
    authorization_url: data?.authorization_url,
  });
});

exports.webHookTest = catchErr(async (req, resp, next) => {
  let event = null;

  const hash = crypto
    .createHmac("sha512", process.env.JWTSECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash == req.headers["x-paystack-signature"]) {
    event = req.body;
  }

  const paymentInfo = await paymentInstance.createPayment(event.reference);

  if (!paymentInfo) {
    return next(
      new throwError(
        "An error occurred with the payment, please try again",
        400,
      ),
    );
  }

  if (paymentInfo.status !== "success")
    return next(new throwError("Unable to create payment", 400));

  resp.status(200).json({
    status: true,
    message: "payment successful",
    event,
    paymentInfo,
  });
});

exports.createPayment = catchErr(async (req, res, next) => {
  const { reference, id } = req.user;

  if (reference === "null" || !reference)
    return next(new throwError("Invalid reference code", 400));

  if (await Payment.findOne({ reference }))
    return next(new throwError("Payment record already exists", 403));

  const paymentInfo = await paymentInstance.createPayment(req.user);

  if (!paymentInfo) {
    return next(
      new throwError(
        "An error occurred with the payment, please try again",
        400,
      ),
    );
  }

  if (paymentInfo.status !== "success")
    return next(new throwError("Unable to create payment", 400));

  const newPayment = await Payment.create({
    user_id: id,
    status: true,
    email: paymentInfo.email,
    amount: paymentInfo.amount,
    reference: paymentInfo.reference,
    full_name: paymentInfo.full_name,
    created_at: paymentInfo.paid_at,
    expires_at: paymentInfo.expires_at,
  });

  res.status(201).json({
    status: true,
    message: "Payment created successfully",
    payment: {
      reference,
      is_successful: newPayment.status,
    },
  });
});

exports.getPayment = catchErr(async (req, res, next) => {
  const { reference } = req.user;
  const payment = await Payment.findOne({ reference });

  if (!payment)
    return next(new throwError("You don't have an active subscription", 404));

  const paymentReceipt = await paymentInstance.getPaymentReceipt(req.user);

  res.status(200).json({
    status: true,
    message: "Payment information fetched successfully",
    user: {
      is_premium: paymentReceipt.status,
      full_name: paymentReceipt.full_name,
      email: paymentReceipt.email,
      amount: paymentReceipt.amount / 100,
      reference: paymentReceipt.reference,
    },
  });
});

exports.verifyAndCreatePayment = async( req,res ) => {
   // Validate event
    const hash = crypto.createHmac("sha512", secret).update(JSON.stringify(req.body)).digest("hex");
    if (hash !== req.headers["x-paystack-signature"]) {
        return res.status(400).json({ message: "Invalid signature", status: false });
    }

    // Retrieve the request's body
    const event = req.body;

    if (event && event.event === "charge.success") {
        console.log(event);

        const { duration } = await Subscription.findOne({
            price: event.data.amount / 100,
          });


          const newPayment = await Payment.create({
            status: true,
            email: event.data.email,
            amount: event.data.amount,
            reference: event.data.reference,
            full_name: event.data.metadata.full_name,
            created_at: event.data.createdAt,
            expires_at: addDaysToCurrentDate(event.data.createdAt, duration),
          });

         newPayment.save();

        return res.status(200).json({ message: "Transfer successful, payment processed." });
    } else {
        console.log(res);
        return res.status(400).json({ message: "Event type is not charge.success", status: false });
    }
};
