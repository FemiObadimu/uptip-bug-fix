const catchErr = require("../utilities/catchErr");

exports.freePreds = catchErr(async (req, res, next) => {
  // Get today's date and format it as 'YYYY-MM-DD'
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");
  const formattedDate = `${year}-${month}-${day}`;

  // Set the query to find documents with type 'free' and a 'createdAt' date that matches today
  req.query = {
    type: "free",
    createdAt: {
      gte: new Date(`${formattedDate}T00:00:00.000Z`), // Start of the day in UTC
      lt: new Date(`${formattedDate}T23:59:59.999Z`), // End of the day in UTC
    },
  };

  next();
});

exports.todaysPreds = catchErr(async (req, res, next) => {
  // Get today's date and format it as 'YYYY-MM-DD'
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");
  const formattedDate = `${year}-${month}-${day}`;

  // Set the query to find documents with type 'free' and a 'createdAt' date that matches today

  req.query = {
    type: req.user.isPremium ? "premium" : "free",
    createdAt: {
      gte: new Date(`${formattedDate}T00:00:00.000Z`), // Start of the day in UTC
      lt: new Date(`${formattedDate}T23:59:59.999Z`), // End of the day in UTC
    },
  };

  next();
});

exports.recentPreds = catchErr(async (req, res, next) => {
  // Get today's date
  const today = new Date();

  // Calculate the start and end of yesterday
  const yesterdayStart = new Date(today);
  yesterdayStart.setDate(today.getDate() - 1);
  yesterdayStart.setHours(0, 0, 0, 0);

  const yesterdayEnd = new Date(yesterdayStart);
  yesterdayEnd.setHours(23, 59, 59, 999);

  // Set the query to find documents with type 'free' and a 'createdAt' date that matches yesterday
  req.query = {
    type: "free",
    createdAt: {
      gte: yesterdayStart,
      lt: yesterdayEnd,
    },
  };

  next();
});
