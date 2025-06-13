const express = require('express');
const router = express.Router();
const nanoid = require('nanoid');
const multer = require('multer');
const path = require('path');
const config = require('../config.js');
const Product = require('../models/product-model.js');
const Category = require('../models/category-model.js');
const User = require('../models/user-model.js');
const auth = require('./middleware/auth.js');
const permit = require('./middleware/permit.js');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, nanoid() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

async function listProducts(req, res) {
  try {
    const { category } = req.query;
    const { userId } = req.body;
    const user = await User.findById(userId);
    const userFavorites = user.favorites.map(id => id.toString());

    let filter = {};

    if (category) {
      const foundCategory = await Category.findOne({ title: category });
      if (!foundCategory) return res.status(404).send('Category not found');
      filter.category = foundCategory._id;
    }

    const results = await Product.find(filter);
    const productsWithFavorites = results.map(product => ({
      ...product.toObject(),
      isFavorite: userFavorites.includes(product._id.toString()),
    }));
    res.send(productsWithFavorites);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
}

async function getProductById(req, res) {
  try {
    const result = await Product.findById(req.params.id);
    if (result) {
      res.send(result);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error('Error fetching product by id:', error);
    res.sendStatus(500);
  }
}

async function createProduct(req, res) {
  const productData = req.body;
  if (req.file) {
    productData.image = req.file.filename;
  } else {
    productData.image = null;
  }
  const product = new Product(productData);

  try {
    await product.save();
    res.status(201).send(product);
  } catch (error) {
    console.error('Creating product failed:', error);
    res.status(500).send(error);
  }
}

async function deleteProduct(req, res) {
  try {
    const deleted = await Product.findByIdAndDelete({ _id: req.params.id });
    if (deleted) {
      res.send({ message: 'Product deleted successfully' });
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error('Failed to delete product:', error);
    res.sendStatus(500);
  }
}

async function updateProduct(req, res) {
  try {
    const updateData = req.body;
    const updateProduct = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!updateProduct) {
      return res.sendStatus(404);
    }
    res.json({ message: 'Product updated sucessfully', product: updateProduct });
  } catch (error) {
    console.error('Failed to update product', error);
    send.status(500).send(error);
  }
}

router.get('/', listProducts);
router.get('/:id', getProductById);
// router.post('/', [auth, permit('admin')], upload.single('image'), createProduct);
router.post('/', upload.single('image'), createProduct);
router.delete('/:id', deleteProduct);
router.put('/:id', upload.single('image'), updateProduct);

module.exports = {
  router,
  listProducts,
  getProductById,
  createProduct,
  deleteProduct,
  updateProduct,
};
