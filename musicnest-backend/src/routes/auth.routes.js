const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/auth.controller');

const router = express.Router();

// 15 minute ke andar ek IP sirf 10 baar login/register try kar sakta hai
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: { message: "Too many attempts, please try again after some time" },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/register', authLimiter, authController.registerUser);

router.post('/login', authLimiter, authController.loginUser);
router.post('/logout', authController.logoutUser);


module.exports = router;