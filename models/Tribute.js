const mongoose = require('mongoose');

const tributeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  image_data: { type: String, required: true },
  caption: { type: String, default: '' },
  timestamp: { type: String, required: true }
});

module.exports = mongoose.model('Tribute', tributeSchema, 'tribute');
