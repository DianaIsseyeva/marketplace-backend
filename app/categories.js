const express = require('express');
const Category = require('../models/category-model');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.send(categories);
  } catch (error) {
    res.sendStatus(500);
  }
});

router.post('/', async (req, res) => {
  const categoryData = req.body;
  const category = new Category(categoryData);
  try {
    await category.save();
    res.send(category);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
