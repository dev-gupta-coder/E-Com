const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const isValidId = require('../utils/isValidId');
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');

const CART_POPULATE_FIELDS = 'name price images stock';

const populateCart = (cart) => cart.populate('items.product', CART_POPULATE_FIELDS);

const getOrCreateCart = async (userId) => {
  const existing = await Cart.findOne({ user: userId });
  if (existing) return existing;

  try {
    return await Cart.create({ user: userId, items: [] });
  } catch (err) {
    if (err.code === 11000) {
      return Cart.findOne({ user: userId });
    }
    throw err;
  }
};
     
const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  await populateCart(cart);

  res.status(200).json({ success: true, cart });
});

const addItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  if (!isValidId(productId)) {
    throw new AppError('Product not found', 404);
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const cart = await getOrCreateCart(req.user._id);
  const existingItem = cart.items.find((item) => item.product.toString() === productId);
  const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;

  if (newQuantity > product.stock) {
    throw new AppError('Insufficient stock', 409);
  }

  if (existingItem) {
    existingItem.quantity = newQuantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  await populateCart(cart);

  res.status(200).json({ success: true, cart });
});

const updateItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.find((item) => item.product.toString() === productId);
  if (!item) {
    throw new AppError('Item not found in cart', 404);
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError('Product no longer exists', 404);
  }

  if (quantity > product.stock) {
    throw new AppError('Insufficient stock', 409);
  }

  item.quantity = quantity;
  await cart.save();
  await populateCart(cart);

  res.status(200).json({ success: true, cart });
});

const removeItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const cart = await getOrCreateCart(req.user._id);
  cart.items = cart.items.filter((item) => item.product.toString() !== productId);
  await cart.save();
  await populateCart(cart);

  res.status(200).json({ success: true, cart });
});

module.exports = { getCart, addItem, updateItem, removeItem };
