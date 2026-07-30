const AppError = require('../utils/AppError');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const message = error.details.map((detail) => detail.message).join(', ');
    throw new AppError(message, 400);
  }

  next();
};

module.exports = validate;

//validate ke ander schema daalo aur apne aap se validate check kr dega , agr err hoga to err return karega
