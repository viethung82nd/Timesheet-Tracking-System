// models/Assignment.js
const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    // Foreign Keys
    task_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "employee",
      required: true,
    },
    assigned_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "employee",
      required: true,
    },

    // Data
    estimated_hours: {
      type: Number,
      required: true,
    },
    actual_hours: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "assigned", "in_progress", "completed", "rejected"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    assigned_date: {
      type: Date,
      default: Date.now,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", assignmentSchema);
