const Joi = require('joi');

const shippingAddressSchema = Joi.object({
  fullName: Joi.string().trim().min(2).required(),
  phone: Joi.string().trim().min(7).max(15).required(),
  addressLine1: Joi.string().trim().min(3).required(),
  addressLine2: Joi.string().trim().allow('').optional(),
  city: Joi.string().trim().required(),
  state: Joi.string().trim().required(),
  pincode: Joi.string().trim().required(),
});

const createOrderSchema = Joi.object({
  shippingAddress: shippingAddressSchema.required(),
});

module.exports = { createOrderSchema };
