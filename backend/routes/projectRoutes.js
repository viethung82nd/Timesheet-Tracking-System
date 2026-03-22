// routes/projectRoutes.js
const express = require("express");
const router = express.Router();
const Project = require("../models/Project");

// GET all projects
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("manager_id", "username email full_name")
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      data: projects,
      count: projects.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching projects",
      error: error.message,
    });
  }
});

// GET project by ID
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "manager_id",
      "username email full_name"
    );
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }
    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching project",
      error: error.message,
    });
  }
});

// CREATE new project
router.post("/", async (req, res) => {
  try {
    const { name, description, project_code, status, start_date, end_date, manager_id, budget } = req.body;

    // Validation
    if (!name || !project_code || !start_date) {
      return res.status(400).json({
        success: false,
        message: "Name, project_code, and start_date are required",
      });
    }

    // Check if project_code already exists
    const existingProject = await Project.findOne({ project_code });
    if (existingProject) {
      return res.status(409).json({
        success: false,
        message: "Project code already exists",
      });
    }

    const newProject = new Project({
      name,
      description,
      project_code: project_code.toUpperCase(),
      status: status || "planning",
      start_date,
      end_date,
      manager_id,
      budget: budget || 0,
    });

    await newProject.save();
    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: newProject,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating project",
      error: error.message,
    });
  }
});

// UPDATE project
router.put("/:id", async (req, res) => {
  try {
    const { name, description, status, end_date, manager_id, budget } = req.body;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        status,
        end_date,
        manager_id,
        budget,
      },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.json({
      success: true,
      message: "Project updated successfully",
      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating project",
      error: error.message,
    });
  }
});

// DELETE project
router.delete("/:id", async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.json({
      success: true,
      message: "Project deleted successfully",
      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting project",
      error: error.message,
    });
  }
});

module.exports = router;
