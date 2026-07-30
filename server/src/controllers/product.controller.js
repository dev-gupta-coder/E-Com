const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const isValidId = require('../utils/isValidId');
const Product = require('../models/product.model');

const listProducts = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.max(parseInt(req.query.limit, 10) || 12, 1);

  const filter = {};
  if (req.query.category) {
    filter.category = req.query.category;
  }
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    products,
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
  });
});

const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    throw new AppError('Product not found', 404);
  }

  const product = await Product.findById(id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  res.status(200).json({ success: true, product });
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, product });
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    throw new AppError('Product not found', 404);
  }

  const product = await Product.findByIdAndUpdate(id, req.body, {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  res.status(200).json({ success: true, product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    throw new AppError('Product not found', 404);
  }

  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  res.status(200).json({ success: true });
});

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
