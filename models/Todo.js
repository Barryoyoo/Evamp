const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  task: { type: String, required: true },
  completed: { type: Boolean, default: false },
  timestamp: { type: String, required: true }
});

module.exports = mongoose.model('Todo', todoSchema, 'todos');
