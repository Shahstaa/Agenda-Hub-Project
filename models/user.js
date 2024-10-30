const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePicture: { 
    type: String,
},
  activity:[activitySchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
