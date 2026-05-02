const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  mood: { type: String, default: 'neutral' }, // e.g., happy, sad, excited, thoughtful
  timestamp: { type: String, required: true }
});

module.exports = mongoose.model('Journal', journalSchema, 'journals');
