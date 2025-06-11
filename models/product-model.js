const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: String,
  image: String,
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    requiered: true,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  rating: {
    type: Number,
    default: 0,
  },
});

const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;
