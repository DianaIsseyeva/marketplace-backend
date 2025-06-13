const express = require('express');
const router = express.Router();

const User = require('../models/user-model');

router.post('/:productId', async (req, res) => {
  try {
    const { userId } = req.body;
    const { productId } = req.params;
    const user = await User.findByIdAndUpdate(userId, {
      $addToSet: { favorites: productId },
    });
    res.status(200).send({ message: 'Product added to favorites', favorites: user.favorites });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

router.delete('/:productId', async (req, res) => {
  try {
    const { userId } = req.body;
    const { productId } = req.params;

    const user = await User.findByIdAndUpdate(userId, {
      $pull: { favorites: productId },
    });
    res.status(200).send({ message: 'Product delete from favorites', favorites: user.favorites });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

module.exports = router;
