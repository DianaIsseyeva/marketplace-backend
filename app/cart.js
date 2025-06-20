const express = require('express');
const router = express.Router();
const auth = require('./middleware/auth');
const User = require('../models/user-model');
const Product = require('../models/product-model');

router.post('/:productId', auth, async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;
  const { quantity = 1 } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existing = user.cart.find(item => item.product.toString() === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      user.cart.push({ product: product._id, quantity });
    }

    await user.save();

    const updatedUser = await User.findById(userId);

    res.status(200).json({
      message: 'Product added to cart',
      cart: updatedUser.cart,
    });
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

    const updatedUser = await User.findById(userId);

    res.status(200).json({
      message: 'Product removed from cart',
      cart: updatedUser.cart,
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
