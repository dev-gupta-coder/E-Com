const express = require('express');

const validate = require('../middlewares/validate.middleware');
const { isAuthenticated } = require('../middlewares/auth.middleware');
const { addItemSchema, updateItemSchema } = require('../validators/cart.validator');
const { getCart, addItem, updateItem, removeItem } = require('../controllers/cart.controller');

const router = express.Router();

router.use(isAuthenticated);

router.get('/', getCart);
router.post('/items', validate(addItemSchema), addItem);
router.patch('/items/:productId', validate(updateItemSchema), updateItem);
router.delete('/items/:productId', removeItem);

module.exports = router;
