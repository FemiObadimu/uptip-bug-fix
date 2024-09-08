const send_devErr = (err, resp) =>
  resp.status(err.statusCode).json({
    status: false,
    message: err.message,
    error: err,
    stackTraceP: err.stack,
  });

const send_prodErr = (err, resp) => {
  if (err.isOperational)
    return resp.status(err.statusCode).json({
      status: false,
      message: err.message,
    });

  resp.status(500).json({
    status: false,
    message: "Something went wrong, please try again",
  });
};

module.exports = (err, req, resp, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Something went wrong";
  err.isOperational = true;

  if (process.env.DEV_ENV === "production") return send_prodErr(err, resp);

  send_devErr(err, resp);
};
