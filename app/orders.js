const express = require('express');
const router = express.Router();
const Order = require('../models/order-model');
const auth = require('../app/middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const { items, total, shipping, paymentMethod, customer } = req.body;

    if (!items?.length || !customer?.firstName || !customer?.address) {
      return res.status(400).json({ message: 'Invalid order data' });
    }

    const order = new Order({
      items,
      total,
      shipping,
      paymentMethod,
      customer,
      userId: req.user._id,
    });

    await order.save();
    res.status(201).json(order);
  } catch (e) {
    console.error('Error saving order:', e);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
