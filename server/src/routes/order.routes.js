//src/routes/order.routes.js
const express = require('express');

const validate = require('../middlewares/validate.middleware');
const { isAuthenticated, isAdmin } = require('../middlewares/auth.middleware');
const { createOrderSchema } = require('../validators/order.validator');
const { createOrder, getMyOrders, getAllOrders, getOrderById } = require('../controllers/order.controller');

const router = express.Router();

router.use(isAuthenticated);

router.post('/', validate(createOrderSchema), createOrder);
router.get('/my', getMyOrders);
router.get('/', isAdmin, getAllOrders);
router.get('/:id', getOrderById);

module.exports = router;
