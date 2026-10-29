

const express = require('express');
const Food = require('../models/Food');

const router = express.Router();

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/foods và /api/foods?search=...
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    const search = (req.query.search || '').trim();
    if (search) {
      const regex = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ name: regex }, { category: regex }, { cuisine: regex }];
    }
    const foods = await Food.find(filter).sort({ foodId: 1 });
    res.json(foods);
  } catch (err) {
    next(err);
  }
});

// GET /api/foods/:id (tìm theo foodId)
router.get('/:id', async (req, res, next) => {
  try {
    const food = await Food.findOne({ foodId: req.params.id });
    if (!food) return res.status(404).json({ message: 'Không tìm thấy món ăn' });
    res.json(food);
  } catch (err) {
    next(err);
  }
});

// POST /api/foods
router.post('/', async (req, res, next) => {
  try {
    const food = await Food.create(req.body);
    res.status(201).json(food);
  } catch (err) {
    next(err);
  }
});

// PUT /api/foods/:id
router.put('/:id', async (req, res, next) => {
  try {
    const data = { ...req.body };
    delete data.foodId; // không cho đổi mã món
    const food = await Food.findOneAndUpdate({ foodId: req.params.id }, data, {
      new: true,
      runValidators: true,
    });
    if (!food) return res.status(404).json({ message: 'Không tìm thấy món ăn' });
    res.json(food);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/foods/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const food = await Food.findOneAndDelete({ foodId: req.params.id });
    if (!food) return res.status(404).json({ message: 'Không tìm thấy món ăn' });
    res.json({ message: 'Đã xóa món ăn', foodId: req.params.id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;