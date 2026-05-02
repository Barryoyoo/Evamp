const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  image_data: { type: String, default: null },
  date: { type: String, required: true },
  timestamp: { type: String, required: true }
});

module.exports = mongoose.model('Achievement', achievementSchema, 'achievements');
