const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
  verifyEmail,
  resendVerification,
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateUpdatePassword,
} = require('../middleware/validation');

const router = express.Router();

// Routes publiques
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.put('/reset-password/:resettoken', validateResetPassword, resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Routes protégées
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/update-password', protect, validateUpdatePassword, updatePassword);
router.post('/resend-verification', protect, resendVerification);

module.exports = router; 