const throwError = require("../errorHandler");

// Middleware to validate request body using Joi
const validateBody = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  return error ? next(new throwError(error, 400)) : next();
};

module.exports = { validateBody };
