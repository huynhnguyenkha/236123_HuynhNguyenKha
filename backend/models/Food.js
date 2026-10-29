const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema(
  {
    foodId: { type: String, required: [true, 'foodId là bắt buộc'], unique: true, trim: true },
    name: { type: String, required: [true, 'name là bắt buộc'], trim: true },
    category: { type: String, required: [true, 'category là bắt buộc'], trim: true },
    cuisine: { type: String, required: [true, 'cuisine là bắt buộc'], trim: true },
    ingredients: {
      type: [String],
      validate: [(v) => v.length > 0, 'ingredients phải có ít nhất 1 nguyên liệu'],
    },
    price: { type: Number, required: [true, 'price là bắt buộc'], min: [0, 'price phải >= 0'] },
    quantity: { type: Number, required: [true, 'quantity là bắt buộc'], min: [0, 'quantity phải >= 0'] },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
  },
  { timestamps: true, collection: 'foods' }
);

module.exports = mongoose.model('Food', foodSchema);