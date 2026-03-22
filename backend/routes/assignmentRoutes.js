// routes/assignmentRoutes.js
const express = require("express");
const router = express.Router();
const Assignment = require("../models/Assignment");

// GET all assignments
router.get("/", async (req, res) => {
  try {
    const { employee_id, task_id, status } = req.query;
    let filter = {};

    if (employee_id) filter.employee_id = employee_id;
    if (task_id) filter.task_id = task_id;
    if (status) filter.status = status;

    const assignments = await Assignment.find(filter)
      .populate("task_id", "title project_id")
      .populate("employee_id", "username email full_name")
      .populate("assigned_by", "username email full_name")
      .sort({ assignedDate: -1 });

    res.json({
      success: true,
      data: assignments,
      count: assignments.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching assignments",
      error: error.message,
    });
  }
});

// GET assignment by ID
router.get("/:id", async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate("task_id", "title project_id")
      .populate("employee_id", "username email full_name")
      .populate("assigned_by", "username email full_name");

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    res.json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching assignment",
      error: error.message,
    });
  }
});

// CREATE new assignment
router.post("/", async (req, res) => {
  try {
    const {
      task_id,
      employee_id,
      assigned_by,
      estimated_hours,
      status,
      priority,
      start_date,
      end_date,
      notes,
    } = req.body;

    // Validation
    if (!task_id || !employee_id || !assigned_by || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message:
          "task_id, employee_id, assigned_by, start_date, and end_date are required",
      });
    }

    const newAssignment = new Assignment({
      task_id,
      employee_id,
      assigned_by,
      estimated_hours: estimated_hours || 0,
      status: status || "pending",
      priority: priority || "medium",
      start_date,
      end_date,
      notes,
    });

    await newAssignment.save();
    await newAssignment.populate("task_id", "title project_id");
    await newAssignment.populate("employee_id", "username email full_name");
    await newAssignment.populate("assigned_by", "username email full_name");

    res.status(201).json({
      success: true,
      message: "Assignment created successfully",
      data: newAssignment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating assignment",
      error: error.message,
    });
  }
});

// UPDATE assignment
router.put("/:id", async (req, res) => {
  try {
    const {
      estimated_hours,
      actual_hours,
      status,
      priority,
      start_date,
      end_date,
      notes,
    } = req.body;

    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      {
        estimated_hours,
        actual_hours,
        status,
        priority,
        start_date,
        end_date,
        notes,
      },
      { new: true, runValidators: true }
    )
      .populate("task_id", "title project_id")
      .populate("employee_id", "username email full_name")
      .populate("assigned_by", "username email full_name");

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    res.json({
      success: true,
      message: "Assignment updated successfully",
      data: assignment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating assignment",
      error: error.message,
    });
  }
});

// DELETE assignment
router.delete("/:id", async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    res.json({
      success: true,
      message: "Assignment deleted successfully",
      data: assignment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting assignment",
      error: error.message,
    });
  }
});

// GET assignments by employee
router.get("/employee/:employee_id", async (req, res) => {
  try {
    const assignments = await Assignment.find({
      employee_id: req.params.employee_id,
    })
      .populate("task_id", "title project_id")
      .populate("assigned_by", "username email")
      .sort({ assignedDate: -1 });

    res.json({
      success: true,
      data: assignments,
      count: assignments.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching employee assignments",
      error: error.message,
    });
  }
});

module.exports = router;
