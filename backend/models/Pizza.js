const mongoose = require('mongoose');

const pizzaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Pizza name is required'],
    unique: true,
    trim: true
  },
  ingredients: {
    type: String,
    required: [true, 'Ingredients are required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  photoName: {
    type: String,
    required: [true, 'Photo is required'],
    default: 'images/pizzas/default.jpg'
  },
  soldOut: {
    type: Boolean,
    default: false
  },
  popular: {
    type: Boolean,
    default: false
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    default: 50,
    min: [0, 'Quantity cannot be negative']
  }
}, {
  timestamps: true
});

pizzaSchema.pre('save', function(next) {
  this.soldOut = this.quantity === 0;
  next();
});

module.exports = mongoose.model('Pizza', pizzaSchema);
