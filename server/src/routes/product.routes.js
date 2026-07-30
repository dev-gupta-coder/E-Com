const express = require('express');

const validate = require('../middlewares/validate.middleware');
const { isAuthenticated, isAdmin } = require('../middlewares/auth.middleware');
const { createProductSchema, updateProductSchema } = require('../validators/product.validator');
const {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/product.controller');

const router = express.Router();

router.get('/', listProducts);
router.get('/:id', getProduct);
router.post('/', isAuthenticated, isAdmin, validate(createProductSchema), createProduct);
router.put('/:id', isAuthenticated, isAdmin, validate(updateProductSchema), updateProduct);
router.delete('/:id', isAuthenticated, isAdmin, deleteProduct);

module.exports = router;
