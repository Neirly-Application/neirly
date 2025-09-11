const mongoose = require('mongoose');

const AlphaTesterSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  code: { type: String, required: true }
});

module.exports = mongoose.model('AlphaTester', AlphaTesterSchema);