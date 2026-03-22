// routes/timesheetRoutes.js
const express = require("express");
const router = express.Router();
const Timesheet = require("../models/Timesheet");

// GET all timesheets
router.get("/", async (req, res) => {
  try {
    const { employee_id, assignment_id, status, start_date, end_date } = req.query;
    let filter = {};

    if (employee_id) filter.employee_id = employee_id;
    if (assignment_id) filter.assignment_id = assignment_id;
    if (status) filter.status = status;

    if (start_date || end_date) {
      filter.work_date = {};
      if (start_date) filter.work_date.$gte = new Date(start_date);
      if (end_date) filter.work_date.$lte = new Date(end_date);
    }

    const timesheets = await Timesheet.find(filter)
      .populate("assignment_id", "task_id status")
      .populate("employee_id", "username email full_name")
      .populate("task_id", "title project_id")
      .populate("project_id", "name project_code")
      .populate("approved_by", "username email")
      .sort({ work_date: -1 });

    res.json({
      success: true,
      data: timesheets,
      count: timesheets.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching timesheets",
      error: error.message,
    });
  }
});

// GET timesheet by ID
router.get("/:id", async (req, res) => {
  try {
    const timesheet = await Timesheet.findById(req.params.id)
      .populate("assignment_id", "task_id status")
      .populate("employee_id", "username email full_name")
      .populate("task_id", "title project_id")
      .populate("project_id", "name project_code")
      .populate("approved_by", "username email");

    if (!timesheet) {
      return res.status(404).json({
        success: false,
        message: "Timesheet not found",
      });
    }

    res.json({
      success: true,
      data: timesheet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching timesheet",
      error: error.message,
    });
  }
});

// CREATE new timesheet
router.post("/", async (req, res) => {
  try {
    const {
      assignment_id,
      employee_id,
      task_id,
      project_id,
      work_date,
      hours_worked,
      description,
    } = req.body;

    // Validation
    if (!assignment_id || !employee_id || !task_id || !project_id || !work_date || hours_worked === undefined) {
      return res.status(400).json({
        success: false,
        message:
          "assignment_id, employee_id, task_id, project_id, work_date, and hours_worked are required",
      });
    }

    if (hours_worked < 0 || hours_worked > 24) {
      return res.status(400).json({
        success: false,
        message: "hours_worked must be between 0 and 24",
      });
    }

    const newTimesheet = new Timesheet({
      assignment_id,
      employee_id,
      task_id,
      project_id,
      work_date: new Date(work_date),
      hours_worked,
      description,
      status: "draft",
    });

    await newTimesheet.save();
    await newTimesheet.populate("assignment_id", "task_id status");
    await newTimesheet.populate("employee_id", "username email full_name");
    await newTimesheet.populate("task_id", "title project_id");
    await newTimesheet.populate("project_id", "name project_code");

    res.status(201).json({
      success: true,
      message: "Timesheet created successfully",
      data: newTimesheet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating timesheet",
      error: error.message,
    });
  }
});

// UPDATE timesheet
router.put("/:id", async (req, res) => {
  try {
    const {
      hours_worked,
      description,
      status,
      submitted_date,
      approved_by,
      approved_date,
    } = req.body;

    // Validate hours_worked if provided
    if (hours_worked !== undefined && (hours_worked < 0 || hours_worked > 24)) {
      return res.status(400).json({
        success: false,
        message: "hours_worked must be between 0 and 24",
      });
    }

    const timesheet = await Timesheet.findByIdAndUpdate(
      req.params.id,
      {
        hours_worked,
        description,
        status,
        submitted_date,
        approved_by,
        approved_date,
      },
      { new: true, runValidators: true }
    )
      .populate("assignment_id", "task_id status")
      .populate("employee_id", "username email full_name")
      .populate("task_id", "title project_id")
      .populate("project_id", "name project_code")
      .populate("approved_by", "username email");

    if (!timesheet) {
      return res.status(404).json({
        success: false,
        message: "Timesheet not found",
      });
    }

    res.json({
      success: true,
      message: "Timesheet updated successfully",
      data: timesheet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating timesheet",
      error: error.message,
    });
  }
});

// APPROVE timesheet
router.put("/:id/approve", async (req, res) => {
  try {
    const { approved_by } = req.body;

    if (!approved_by) {
      return res.status(400).json({
        success: false,
        message: "approved_by is required",
      });
    }

    const timesheet = await Timesheet.findByIdAndUpdate(
      req.params.id,
      {
        status: "approved",
        approved_by,
        approved_date: new Date(),
      },
      { new: true }
    )
      .populate("employee_id", "username email full_name")
      .populate("task_id", "title")
      .populate("approved_by", "username email");

    if (!timesheet) {
      return res.status(404).json({
        success: false,
        message: "Timesheet not found",
      });
    }

    res.json({
      success: true,
      message: "Timesheet approved successfully",
      data: timesheet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error approving timesheet",
      error: error.message,
    });
  }
});

// DELETE timesheet
router.delete("/:id", async (req, res) => {
  try {
    const timesheet = await Timesheet.findByIdAndDelete(req.params.id);

    if (!timesheet) {
      return res.status(404).json({
        success: false,
        message: "Timesheet not found",
      });
    }

    res.json({
      success: true,
      message: "Timesheet deleted successfully",
      data: timesheet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting timesheet",
      error: error.message,
    });
  }
});

module.exports = router;
