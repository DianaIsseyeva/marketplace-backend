require('dotenv').config();
const express = require('express');
const app = express();
const port = 8000;
const { router: productsRouter } = require('./app/products');
const categories = require('./app/categories');
const users = require('./app/users');
const admin = require('./app/admin');
const favorites = require('./app/favorites');
const cart = require('./app/cart');
const cors = require('cors');
const mongoose = require('mongoose');

async function start() {
  await mongoose.connect('mongodb://localhost:27017/shop');
  app.use(cors());
  app.use(express.static('public'));
  app.use(express.json());
  app.use('/products', productsRouter);
  app.use('/categories', categories);
  app.use('/users', users);
  app.use('/admin', admin);
  app.use('/favorites', favorites);
  app.use('/cart', cart);

  app.listen(port, () => {
    console.log(`Server started on ${port} port!`);
  });

  const gracefullShutdown = async () => {
    console.log('Shutting down gracefully...');
    await mongoose.disconnect();
    process.exit(0);
  };
  process.on('SIGINT', gracefullShutdown);
  process.on('SIGTERM', gracefullShutdown);
}

start().catch(err => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
