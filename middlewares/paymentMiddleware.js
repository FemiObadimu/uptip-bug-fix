/* eslint-disable linebreak-style */
const catchErr = require("../utilities/catchErr");

const Payment = require("../models/Payment");

const throwError = require("../utilities/errorHandler");

const {

  isEmptyObject,

  isDateNotExpired,

} = require("../utilities/helpers/help");



// break this into three different middlewares, one for each routes

const paymentMiddleware = catchErr(async (req, resp, next) => {

  if (!isEmptyObject(req.body)) {

    req.body = {

      ...req.body,

      user_id: req.user.id,

      email: req.user.email,

      full_name: `${req.user.firstname} ${req.user.lastname}`,

    };

  }



  if (isEmptyObject(req.body) && req.query.reference) {

    if (!req.query.reference)

      return next(new throwError("Reference code cannot be empty", 400));



    req.user.reference = req.query.reference;

  }



  if (isEmptyObject(req.body) && !req.query.reference) {

    const paymentInfo = await Payment.findOne({

      email: req.user.email,

      status: true,

    });



    if (!paymentInfo)

      return next(new throwError("Your subscription has expired", 404));



    if (!isDateNotExpired(paymentInfo.expires_at)) {

      paymentInfo.status = false;

      await paymentInfo.save();



      return next(new throwError("Your subscription has expired", 404));

    }



    req.user.reference = paymentInfo.reference;

  }



  next();

});



module.exports = paymentMiddleware;

