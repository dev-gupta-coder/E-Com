const Joi = require('joi');
const Product = require('../models/product.model');

const createProductSchema = Joi.object({
  name: Joi.string().trim().min(2).required(),
  description: Joi.string().trim().min(10).required(),
  price: Joi.number().min(0).required(),
  category: Joi.string()
    .valid(...Product.CATEGORIES)
    .required(),
  stock: Joi.number().integer().min(0).required(),
  images: Joi.array().items(Joi.string().uri()).default([]),
});

const updateProductSchema = Joi.object({
  name: Joi.string().trim().min(2),
  description: Joi.string().trim().min(10),
  price: Joi.number().min(0),
  category: Joi.string().valid(...Product.CATEGORIES),
  stock: Joi.number().integer().min(0),
  images: Joi.array().items(Joi.string().uri()),
}).min(1);

module.exports = { createProductSchema, updateProductSchema };
