const express = require("express");
const router = express.Router();
const Department = require("../../models/Department");
const User = require("../../models/User");
const mongoose = require("mongoose");

// POST /api/departments/remove
// Xóa nhân viên khỏi phòng ban (set department = null)
router.post("/remove", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "Thiếu userId" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy nhân viên" });
    }

    if (!user.department) {
      return res
        .status(400)
        .json({ message: "Nhân viên này chưa thuộc phòng ban nào" });
    }

    user.department = null;
    await user.save();

    // Populate nếu cần thông tin đầy đủ
    const updatedUser = await User.findById(userId).populate(
      "department",
      "name",
    );

    res.json({
      message: "Đã xóa nhân viên khỏi phòng ban",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Lỗi xóa khỏi phòng ban:", err);
    res.status(500).json({
      message: "Lỗi server khi xóa khỏi phòng ban",
      error: err.message,
    });
  }
});
// ... giữ nguyên các route cũ (get /, create, assign, remove, :id/users)

// Lấy danh sách tất cả phòng ban (dùng cho trang quản lý)
router.get("/all", async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json({ departments });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// Sửa tên phòng ban
router.put("/:id", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Tên phòng ban không hợp lệ" });
    }

    const dept = await Department.findById(req.params.id);
    if (!dept)
      return res.status(404).json({ message: "Không tìm thấy phòng ban" });

    // Kiểm tra trùng tên (trừ chính nó)
    const existing = await Department.findOne({
      name: name.trim(),
      _id: { $ne: req.params.id },
    });
    if (existing)
      return res.status(400).json({ message: "Tên phòng ban đã tồn tại" });

    dept.name = name.trim();
    await dept.save();

    res.json({ message: "Cập nhật thành công", department: dept });
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật", error: err.message });
  }
});

// Xóa phòng ban (chỉ cho phép nếu không còn nhân viên nào)
router.delete("/:id", async (req, res) => {
  try {
    const deptId = req.params.id;

    const userCount = await User.countDocuments({ department: deptId });
    if (userCount > 0) {
      return res.status(400).json({
        message:
          "Không thể xóa phòng ban vì vẫn còn nhân viên thuộc phòng ban này",
      });
    }

    const deleted = await Department.findByIdAndDelete(deptId);
    if (!deleted)
      return res.status(404).json({ message: "Không tìm thấy phòng ban" });

    res.json({ message: "Xóa phòng ban thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xóa phòng ban", error: err.message });
  }
});

// Dừng / Kích hoạt phòng ban
router.patch("/:id/toggle-status", async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept)
      return res.status(404).json({ message: "Không tìm thấy phòng ban" });

    dept.status = dept.status === "active" ? "inactive" : "active";
    await dept.save();

    res.json({
      message:
        dept.status === "active"
          ? "Đã kích hoạt phòng ban"
          : "Đã dừng hoạt động phòng ban",
      department: dept,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi thay đổi trạng thái", error: err.message });
  }
});
// GET /api/departments
// Lấy tất cả phòng ban + danh sách nhân viên chưa có phòng ban
// GET /api/departments
router.get("/", async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });

    // Thêm employeeCount cho từng phòng ban
    const departmentsWithCount = await Promise.all(
      departments.map(async (dept) => {
        const count = await User.countDocuments({ department: dept._id });
        return {
          ...dept.toObject(),
          employeeCount: count,
        };
      }),
    );

    const unassignedUsers = await User.find({ department: null })
      .select("name email role")
      .sort({ role: -1 });

    res.json({
      departments: departmentsWithCount,
      unassignedUsers,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// POST /api/departments/bulk-assign
router.post("/bulk-assign", async (req, res) => {
  try {
    const { userIds, departmentId } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "Thiếu danh sách userIds" });
    }

    if (!departmentId) {
      return res.status(400).json({ message: "Thiếu departmentId" });
    }

    const department = await Department.findById(departmentId);
    if (!department)
      return res.status(404).json({ message: "Không tìm thấy phòng ban" });

    if (department.status === "inactive") {
      return res
        .status(400)
        .json({ message: "Không thể gán vào phòng ban đang dừng hoạt động" });
    }

    await User.updateMany(
      { _id: { $in: userIds } },
      { $set: { department: departmentId } },
    );

    res.json({ message: `Đã gán ${userIds.length} nhân viên thành công` });
  } catch (err) {
    res.status(500).json({ message: "Lỗi gán hàng loạt", error: err.message });
  }
});

// POST /api/departments/create
// Tạo phòng ban mới
router.post("/create", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({ message: "Tên phòng ban không hợp lệ" });
    }

    const existing = await Department.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: "Phòng ban đã tồn tại" });
    }

    const department = new Department({ name: name.trim() });
    await department.save();

    res.status(201).json(department);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Lỗi khi tạo phòng ban", error: err.message });
  }
});

// POST /api/departments/assign
// Gán nhân viên vào phòng ban
// POST /api/departments/assign
router.post("/assign", async (req, res) => {
  try {
    const { userId, departmentId } = req.body;

    if (!userId || !departmentId) {
      return res
        .status(400)
        .json({ message: "Thiếu userId hoặc departmentId" });
    }

    // Kiểm tra định dạng ObjectId (tùy chọn nhưng tốt)
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(departmentId)
    ) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy nhân viên" });
    }

    const department = await Department.findById(departmentId);
    if (!department)
      return res.status(404).json({ message: "Không tìm thấy phòng ban" });

    if (department.status === "inactive") {
      return res.status(400).json({
        message: "Không thể gán nhân viên vào phòng ban đang dừng hoạt động",
      });
    }

    user.department = new mongoose.Types.ObjectId(departmentId);
    await user.save();

    // Populate để trả về thông tin đầy đủ hơn (tùy chọn)
    const updatedUser = await User.findById(userId).populate(
      "department",
      "name",
    );

    res.json({
      message: "Gán phòng ban thành công",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Lỗi gán phòng ban:", err);
    res.status(500).json({
      message: "Lỗi server khi gán phòng ban",
      error: err.message,
    });
  }
});

// GET /api/departments/:id/users - Lấy tất cả nhân viên của phòng ban
router.get("/:id/users", async (req, res) => {
  try {
    const users = await User.find({ department: req.params.id })
      .select("name email role department")
      .populate("department", "name"); // populate để có tên phòng ban nếu cần

    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

module.exports = router;
