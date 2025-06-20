const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, default: 1 },
      },
    ],
    total: { type: Number, required: true },
    shipping: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['card', 'cash'], required: true },
    customer: {
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
      country: String,
      city: String,
      address: String,
      zip: String,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
