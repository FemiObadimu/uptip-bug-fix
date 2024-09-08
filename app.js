require("dotenv").config();
require("express-async-errors");
const express = require("express");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const cors = require("cors");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");

const throwError = require("./utilities/errorHandler");
const globalErrorHandler = require("./controllers/errorController");

// Routers
const paymentRoutes = require("./routes/paymentRoute");
const authRoutes = require("./routes/authRoute");
const predRoutes = require("./routes/predictionRoute");
const adminRoutes = require("./routes/adminRoute");
const subscriptionRoutes = require("./routes/subscriptionRoute");
const userRoutes = require("./routes/userRoutes");

const app = express();

// Middlewares
app.use(helmet());
app.use(
  "/v1",
  rateLimit({
    max: 300,
    windowMs: 15 * 60 * 1000,
    legacyHeaders: false,
  }),
);
app.use(express.json({ limit: "10Kb" }));
app.use(cors());
app.use(mongoSanitize());
app.use(xss());
// app.use(hpp()); // Uncomment if using parameter pollution prevention
app.use(express.static(`${__dirname}/public`));

// Set CORS headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

// Endpoints
app.get("/", (req, res) => res.send("Betuptip connected"));
app.use("/v1/auth", authRoutes);
app.use("/v1/users", userRoutes);
app.use("/v1/payments", paymentRoutes);
app.use("/v1/predictions", predRoutes);
app.use("/v1/admins", adminRoutes);
app.use("/v1/subscriptions", subscriptionRoutes);

// Handle undefined routes
app.all("*", (req, res, next) => {
  next(new throwError(`${req.originalUrl} does not exist`, 404));
});

// Global error handler
app.use(globalErrorHandler);

module.exports = app;
