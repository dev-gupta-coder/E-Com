const express = require('express');

const validate = require('../middlewares/validate.middleware');
const { isAuthenticated } = require('../middlewares/auth.middleware');
const { registerSchema, loginSchema } = require('../validators/auth.validator');
const { register, login, refresh, logout, me } = require('../controllers/auth.controller');

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', isAuthenticated, logout);
router.get('/me', isAuthenticated, me);

module.exports = router;
                     