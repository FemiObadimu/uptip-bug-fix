/* eslint-disable linebreak-style */
const axios = require("axios");
const jwt = require("jsonwebtoken");

// generate random  6 digit string...
exports.generateOTP = () => Math.floor(100000 + Math.random() * 900000);

// termii send sms to phone numbers...
exports.termiiSendSms = async (phone, message) => {
  const requestBody = JSON.stringify({
    sms: message,
    channel: "generic",
    to: phone,
    api_key: process.env.TERMII_API_KEY,
    from: process.env.TERMII_SENDER,
    type: "plain",
  });

  const config = {
    method: "get",
    maxBodyLength: Infinity,
    url: process.env.TERMII_BASE_URL,
    data: requestBody,
    headers: {
      "Content-Type": "application/json",
    },
  };

  return await axios.request(config);
};

// compare two numbers
exports.compareNumbers = (num1, num2) => {
  const normalizedNum2 = num2.toString().substring(4);
  return num1.toString() === normalizedNum2 ? true : false;
};

// convert a specific portion of the string while preserving other characters
exports.maskPhoneNumber = (phoneNumber) => {
  const prefix = phoneNumber.substring(0, 3);
  const suffix = phoneNumber.substring(7);
  const maskedNumber = prefix + "****" + suffix;
  return maskedNumber;
};

// compares date with current date to determine if it is expired
exports.isDateNotExpired = (expirationDate) => {
  return new Date(expirationDate) > new Date();
};

// add nth(daysToAdd) amount of days to currDate
exports.addDaysToCurrentDate = (currDate, daysToAdd) => {
  const currentDate = !currDate ? Date.now() : new Date(currDate);
  currentDate.setDate(currentDate.getDate() + daysToAdd ?? 0);
  return currentDate.toISOString();
};

exports.formatReadableDate = (date) => {
  if (!date) return;

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Africa/Lagos",
  };

  return date.toLocaleDateString("en-NG", options);
};

// creates a new token
exports.createToken = (data) => {
  const payload = {
    userData: {
      id: data._id,
    },
  };

  return jwt.sign(payload, process.env.JWTSECRET, {
    expiresIn: process.env.JWTLIFETIME,
  });
};

// checks if an object is empty
exports.isEmptyObject = (obj) => Object.entries(obj).length === 0;

exports.getDiscountPrice = (actualPrice, discountPercentage) => {
  if (!actualPrice || !discountPercentage) return 0;
  return actualPrice - (actualPrice * discountPercentage) / 100;
};

exports.parseQuery = (qryStr) => {
  let queryStr = JSON.stringify({ ...qryStr }).replace(
    /\b(gte|gt|lte|lt|ne)\b/g,
    (match) => `$${match}`,
  );

  return JSON.parse(queryStr);
};
