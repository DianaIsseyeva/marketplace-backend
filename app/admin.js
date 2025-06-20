const express = require('express');
const auth = require('./middleware/auth');
const router = express.Router();
const Product = require('../models/product-model');
const User = require('../models/user-model');
const permit = require('./middleware/permit');

router.get('/', auth, (req, res) => {
  res.send({ message: 'It is a secret info', username: req.user.username });
});

router.get('/sellers', [auth, permit('admin')], async (req, res) => {
  try {
    const sellers = await User.find({ role: 'seller' });

    const sellersWithProducts = await Promise.all(
      sellers.map(async seller => {
        const products = await Product.find({ seller: seller._id });
        return { ...seller, products };
      })
    );

    res.json(sellersWithProducts);
  } catch (e) {
    console.error('Error fetching sellers:', e);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
