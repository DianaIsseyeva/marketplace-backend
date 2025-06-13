const express = require('express');
const router = express.Router();
const auth = require('./middleware/auth');
const User = require('../models/user-model');

router.post('/:productId', auth, async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;
  const { quantaty = 1 } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const existing = user.cart.find(item => item.product.toString() === productId);
    if (existing) {
      existing.quantity += quantaty;
    } else {
      user.cart.push({ product: productId, quantaty });
    }
    await user.save();
    res.status(200).json({ message: 'Product added to cart', cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:productId', auth, async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const initialLength = user.cart.length;
    user.cart = user.cart.filter(item => item.product.toString() !== productId);
    if (user.cart.length === initialLength) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }
    await user.save();
    res.status(200).json({ message: 'Product removed from cart' , cart: user.cart});
  } catch (error) {}
});

module.exports = router;