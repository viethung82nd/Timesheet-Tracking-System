// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
  },
  password: {
    type: String,
    // required: true,          ← Bỏ dòng này hoặc comment lại
    // minlength: 6,            ← Bỏ luôn nếu không cần
    select: false, // vẫn giữ nếu sau này thêm auth
  },
  role: {
    type: String,
    enum: ["senior_manager", "manager", "employee"],
    default: "employee",
  },
  status: {
    type: String,
    enum: ["active", "locked"],
    default: "active",
  },
  location: {
    type: String,
    trim: true,
    default: "Unknown",
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
