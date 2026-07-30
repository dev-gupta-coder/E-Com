const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const isValidId = require('../utils/isValidId');
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');

const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress } = req.body;
  const userId = req.user._id;

  const cart = await Cart.findOne({ user: userId }).populate('items.product', 'name price stock');
  if (!cart || cart.items.length === 0) {
    throw new AppError('Cart is empty', 400);
  }

  const orderItems = [];
  const decremented = [];

  try {
    for (const cartItem of cart.items) {
      const product = cartItem.product;

      if (!product) {
        throw new AppError('Stock changed since item was added to cart', 409);
      }

      // Atomic per-item: the stock check and the decrement happen as a single
      // MongoDB operation, so two simultaneous checkouts can't both pass the
      // check and then both decrement past zero.
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: product._id, stock: { $gte: cartItem.quantity } },
        { $inc: { stock: -cartItem.quantity } },
        { returnDocument: 'after' }
      );

      if (!updatedProduct) {
        throw new AppError('Stock changed since item was added to cart', 409);
      }

      decremented.push({ productId: product._id, quantity: cartItem.quantity });

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
      });
    }
  } catch (err) {
    // Best-effort rollback for items already decremented earlier in this same
    // checkout, before a later item failed. NOT a real transaction — if the
    // process crashes between the failure and this rollback completing, stock
    // can still end up wrong. A true fix needs a MongoDB multi-document
    // transaction wrapping this whole loop; deferred as tech debt.
    await Promise.all(
      decremented.map(({ productId, quantity }) =>
        Product.updateOne({ _id: productId }, { $inc: { stock: quantity } })
      )
    );
    throw err;
  }

  const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = await Order.create({
    user: userId,
    items: orderItems,
    shippingAddress,
    totalAmount,
  });

  cart.items = [];
  await cart.save();

  res.status(201).json({ success: true, order });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, orders });
});

const getAllOrders = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.max(parseInt(req.query.limit, 10) || 12, 1);

  const [orders, total] = await Promise.all([
    Order.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    orders,
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
  });
});

const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    throw new AppError('Order not found', 404);
  }

  const order = await Order.findById(id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  const isOwner = order.user.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    throw new AppError('Not authorized to view this order', 403);
  }

  res.status(200).json({ success: true, order });
});

module.exports = { createOrder, getMyOrders, getAllOrders, getOrderById };

// createOrder → Creates a new order from the user's cart.
// getMyOrders → Returns all orders of the logged-in customer.
// getAllOrders → Returns all orders (admin only).
// getOrderById → Returns details of one specific order (owner or admin).