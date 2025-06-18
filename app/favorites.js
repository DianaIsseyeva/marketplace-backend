const express = require('express');
const router = express.Router();
const User = require('../models/user-model');

router.post('/:productId', async (req, res) => {
  try {
    const { userId } = req.body;
    const { productId } = req.params;

    await User.findByIdAndUpdate(userId, {
      $addToSet: { favorites: productId },
    });

    const updatedUser = await User.findById(userId);

    res.status(200).send({
      message: 'Product added to favorites',
      favorites: updatedUser.favorites,
    });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

router.delete('/:productId', async (req, res) => {
  try {
    const { userId } = req.body;
    const { productId } = req.params;

    await User.findByIdAndUpdate(userId, {
      $pull: { favorites: productId },
    });

    const updatedUser = await User.findById(userId);

    res.status(200).send({
      message: 'Product removed from favorites',
      favorites: updatedUser.favorites,
    });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

module.exports = router;
