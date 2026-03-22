const express = require("express");
const mongoose = require("mongoose");
const User = require("../../models/User");
const Department = require("../../models/Department");

const router = express.Router();

const toUserDto = (userDoc) => ({
  id: userDoc._id.toString(),
  name: userDoc.name,
  email: userDoc.email,
  role: userDoc.role || "employee",
  status: userDoc.status || "active",
  department: userDoc.department?.name || "Unassigned",
  departmentId: userDoc.department?._id?.toString() || null,
  location: userDoc.location || "Unknown",
});

router.get("/", async (req, res) => {
  try {
    const users = await User.find()
      .populate("department", "name")
      .sort({ name: 1 });
    res.json({ users: users.map(toUserDto) });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, email, role, status, departmentId, location } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    let department = null;
    if (departmentId) {
      if (!mongoose.Types.ObjectId.isValid(departmentId)) {
        return res.status(400).json({ message: "Invalid departmentId" });
      }
      department = await Department.findById(departmentId);
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
    }

    const user = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: role || "employee",
      status: status || "active",
      department: department ? department._id : null,
      location: location ? location.trim() : "Unknown",
    });

    await user.save();
    const saved = await User.findById(user._id).populate("department", "name");
    res.status(201).json({ user: toUserDto(saved) });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.patch("/bulk-status", async (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "ids is required" });
    }
    if (!["active", "locked"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length !== ids.length) {
      return res.status(400).json({ message: "Invalid user id in list" });
    }

    await User.updateMany(
      { _id: { $in: validIds } },
      { $set: { status } },
    );

    const updated = await User.find({ _id: { $in: validIds } }).populate(
      "department",
      "name",
    );
    res.json({ users: updated.map(toUserDto) });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { role, status, departmentId, location, name, email } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (role) {
      if (!["employee", "manager", "senior_manager"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      user.role = role;
    }

    if (status) {
      if (!["active", "locked"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      user.status = status;
    }

    if (typeof location === "string") {
      user.location = location.trim() || "Unknown";
    }

    if (typeof name === "string") {
      user.name = name.trim();
    }

    if (typeof email === "string") {
      user.email = email.trim().toLowerCase();
    }

    if (departmentId !== undefined) {
      if (departmentId === "" || departmentId === null) {
        user.department = null;
      } else if (!mongoose.Types.ObjectId.isValid(departmentId)) {
        return res.status(400).json({ message: "Invalid departmentId" });
      } else {
        const department = await Department.findById(departmentId);
        if (!department) {
          return res.status(404).json({ message: "Department not found" });
        }
        user.department = department._id;
      }
    }

    await user.save();
    const updated = await User.findById(user._id).populate("department", "name");
    res.json({ user: toUserDto(updated) });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/:id/reset-password", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: `Reset link sent to ${user.email}` });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
