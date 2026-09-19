//src/models/order.model.js
const mongoose = require('mongoose');

// Represents one product inside an order.
// We snapshot name and price here so future product changes
// do NOT change the customer's historical order.
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

// Shipping address is embedded directly into the order.
// This keeps the exact address used for this particular order.
const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    // Customer who placed this order.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Products purchased in this order.
    items: {
      type: [orderItemSchema],
      required: true,
    },

    // Address snapshot for this order.
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },

    // Final amount calculated by the server.
    totalAmount: {
      type: Number,
      required: true,
    },

    // Payment method selected by the customer.
    // COD continues to work, while RAZORPAY is now supported.
    paymentMethod: {
      type: String,
      enum: ['COD', 'RAZORPAY'],
      default: 'COD',
    },

    // Tracks the state of the payment separately from
    // the overall order status.
    //
    // COD orders are considered paid differently from online
    // payments, so keeping payment state separate is important.
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },

    // Razorpay's order ID.
    // Only populated for Razorpay payments.
    razorpayOrderId: {
      type: String,
      default: null,
    },

    // Razorpay's payment ID.
    // This is received after the customer completes payment.
    razorpayPaymentId: {
      type: String,
      default: null,
    },

    // Our application's order status.
    // Payment status and order status are intentionally separate.
    status: {
      type: String,
      enum: ['placed', 'cancelled'],
      default: 'placed',
    },
  },

  // Automatically adds createdAt and updatedAt.
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
