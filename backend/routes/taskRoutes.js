// routes/taskRoutes.js
const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

// GET all tasks
router.get("/", async (req, res) => {
  try {
    const { project_id, status, priority } = req.query;
    let filter = {};

    if (project_id) filter.project_id = project_id;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const tasks = await Task.find(filter)
      .populate("project_id", "name project_code")
      .populate("created_by", "username email full_name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: tasks,
      count: tasks.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching tasks",
      error: error.message,
    });
  }
});

// GET task by ID
router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("project_id", "name project_code")
      .populate("created_by", "username email full_name");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching task",
      error: error.message,
    });
  }
});

// CREATE new task
router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      project_id,
      created_by,
      status,
      priority,
      estimated_hours,
      task_type,
      start_date,
      due_date,
    } = req.body;

    // Validation
    if (!title || !project_id || !created_by || !start_date || !due_date) {
      return res.status(400).json({
        success: false,
        message:
          "Title, project_id, created_by, start_date, and due_date are required",
      });
    }

    const newTask = new Task({
      title,
      description,
      project_id,
      created_by,
      status: status || "open",
      priority: priority || "medium",
      estimated_hours: estimated_hours || 0,
      task_type: task_type || "development",
      start_date,
      due_date,
    });

    await newTask.save();
    await newTask.populate("project_id", "name project_code");
    await newTask.populate("created_by", "username email full_name");

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: newTask,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating task",
      error: error.message,
    });
  }
});

// UPDATE task
router.put("/:id", async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      estimated_hours,
      task_type,
      due_date,
    } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        status,
        priority,
        estimated_hours,
        task_type,
        due_date,
      },
      { new: true, runValidators: true }
    )
      .populate("project_id", "name project_code")
      .populate("created_by", "username email full_name");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.json({
      success: true,
      message: "Task updated successfully",
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating task",
      error: error.message,
    });
  }
});

// DELETE task
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.json({
      success: true,
      message: "Task deleted successfully",
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting task",
      error: error.message,
    });
  }
});

module.exports = router;
