// models/Timesheet.js
const mongoose = require("mongoose");

const timesheetSchema = new mongoose.Schema(
  {
    assignment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "employee",
      required: true,
    },
    task_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    work_date: {
      type: Date,
      required: true,
    },
    hours_worked: {
      type: Number,
      required: true,
      min: 0,
      max: 24,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["draft", "submitted", "approved", "rejected"],
      default: "draft",
    },
    submitted_date: {
      type: Date,
    },
    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "employee",
    },
    approved_date: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Timesheet", timesheetSchema);
