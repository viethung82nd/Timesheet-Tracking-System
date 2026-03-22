// models/Employee.js
const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    emp_id: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password_hash: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
    },
    full_name: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "on_leave"],
      default: "active",
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("employee", employeeSchema);
