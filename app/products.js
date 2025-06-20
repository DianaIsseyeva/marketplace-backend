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
    let filter = {};

    if (category) {
      const foundCategory = await Category.findOne({ title: category });
      if (!foundCategory) return res.status(404).send('Category not found');
      filter.category = foundCategory._id;
    }

    const results = await Product.find(filter);
    res.send(results);
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
  if (!req.user || req.user.role !== 'seller') {
    return res.status(403).send({ message: 'Access denied' });
  }

  const productData = req.body;
  productData.seller = req.user._id;

  if (req.file) {
    productData.image = req.file.filename;
  } else {
    productData.image = null;
  }

  try {
    const product = new Product(productData);
    await product.save();
    res.status(201).send(product);
  } catch (error) {
    console.error('Creating product failed:', error);
    res.status(500).send(error);
  }
}

async function deleteProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).send({ message: 'Product not found' });
    }

    if (!req.user || (req.user.role !== 'seller' && req.user.role !== 'admin')) {
      return res.status(403).send({ message: 'Access denied' });
    }

    if (req.user.role === 'seller' && String(product.seller) !== String(req.user._id)) {
      return res.status(403).send({ message: 'You can delete only your own products' });
    }

    await product.deleteOne();
    res.send({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Failed to delete product:', error);
    res.sendStatus(500);
  }
}

async function updateProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).send({ message: 'Product not found' });
    }

    if (!req.user || (req.user.role !== 'seller' && req.user.role !== 'admin')) {
      return res.status(403).send({ message: 'Access denied' });
    }

    if (req.user.role === 'seller' && String(product.seller) !== String(req.user._id)) {
      return res.status(403).send({ message: 'You can update only your own products' });
    }

    const updateData = req.body;

    if (req.file) {
      updateData.image = req.file.filename;
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    console.error('Failed to update product', error);
    res.status(500).send(error);
  }
}

async function getProductsByIds(req, res) {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).send({ message: 'Invalid or empty ids array' });
    }

    const products = await Product.find({ _id: { $in: ids } });
    res.send(products);
  } catch (error) {
    console.error('Error fetching products by ids:', error);
    res.sendStatus(500);
  }
}

async function getSellerProducts(req, res) {
  try {
    if (!req.user || req.user.role !== 'seller') {
      return res.status(403).send({ message: 'Access denied' });
    }

    const products = await Product.find({ seller: req.user._id });
    res.send(products);
  } catch (error) {
    console.error('Error fetching seller products:', error);
    res.sendStatus(500);
  }
}

router.get('/catalog', listProducts);
router.post('/', [auth, permit('seller')], upload.single('image'), createProduct);
// router.post('/', upload.single('image'), createProduct);
router.delete('/:id', [auth, permit('seller')], deleteProduct);
router.put('/:id', [auth, permit('seller')], upload.single('image'), updateProduct);
router.post('/by-ids', getProductsByIds);
router.get('/my-products', [auth, permit('seller')], getSellerProducts);
router.get('/:id', getProductById);

module.exports = {
  router,
  listProducts,
  getProductById,
  createProduct,
  deleteProduct,
  updateProduct,
  getProductsByIds,
  getSellerProducts,
};
