// backend/seed.js
require("dotenv").config();
const mongoose = require("mongoose");

// Import models
const Employee = require("./models/Employee");
const Project = require("./models/Project");
const Task = require("./models/Task");
const Assignment = require("./models/Assignment");
const Timesheet = require("./models/Timesheet");

const seedDatabase = async () => {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Xóa dữ liệu cũ (chỉ assignment module)
    await Employee.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await Assignment.deleteMany({});
    await Timesheet.deleteMany({});
    console.log("🗑️ Cleared existing assignment data");

    // 1. Tạo sample Employees trước
    const employees = await Employee.create([
      {
        emp_id: "EMP001",
        username: "nguyen.a",
        password_hash: "hashed_password_1",
        email: "nguyen.a@fsoft.com.vn",
        full_name: "Nguyễn Văn A",
        phone: "0123456789",
        status: "active",
      },
      {
        emp_id: "EMP002",
        username: "tran.b",
        password_hash: "hashed_password_2",
        email: "tran.b@fsoft.com.vn",
        full_name: "Trần Văn B",
        phone: "0987654321",
        status: "active",
      },
      {
        emp_id: "EMP003",
        username: "phan.c",
        password_hash: "hashed_password_3",
        email: "phan.c@fsoft.com.vn",
        full_name: "Phan Thị C",
        phone: "0912345678",
        status: "active",
      },
      {
        emp_id: "EMP004",
        username: "le.d",
        password_hash: "hashed_password_4",
        email: "le.d@fsoft.com.vn",
        full_name: "Lê Văn D",
        phone: "0911223344",
        status: "active",
      },
      {
        emp_id: "EMP005",
        username: "vo.e",
        password_hash: "hashed_password_5",
        email: "vo.e@fsoft.com.vn",
        full_name: "Võ Thị E",
        phone: "0922334455",
        status: "active",
      },
    ]);
    console.log("✅ Created 5 employees");

    // 2. Tạo Projects
    const projects = await Project.create([
      {
        name: "FPT.IS - Timesheet System",
        description: "Hệ thống quản lý timesheet cho FPT Software",
        project_code: "FPT-TS-2024",
        status: "active",
        start_date: new Date("2024-01-01"),
        end_date: new Date("2024-12-31"),
        manager_id: employees[0]._id,
        budget: 500000,
      },
      {
        name: "Mobile Banking App",
        description: "Ứng dụng ngân hàng di động",
        project_code: "MBA-2024",
        status: "active",
        start_date: new Date("2024-02-01"),
        end_date: new Date("2024-11-30"),
        manager_id: employees[1]._id,
        budget: 800000,
      },
      {
        name: "E-Commerce Platform",
        description: "Nền tảng thương mại điện tử",
        project_code: "ECOM-2024",
        status: "planning",
        start_date: new Date("2024-04-01"),
        end_date: new Date("2025-03-31"),
        manager_id: employees[0]._id,
        budget: 1200000,
      },
    ]);
    console.log("✅ Created 3 projects");

    // 3. Tạo Tasks
    const tasks = await Task.create([
      {
        title: "API Development - User Module",
        description: "Phát triển REST API cho quản lý người dùng",
        project_id: projects[0]._id,
        created_by: employees[0]._id,
        status: "open",
        priority: "high",
        estimated_hours: 40,
        task_type: "development",
        start_date: new Date("2024-01-05"),
        due_date: new Date("2024-01-20"),
      },
      {
        title: "Database Schema Design",
        description: "Thiết kế schema MongoDB cho hệ thống",
        project_id: projects[0]._id,
        created_by: employees[0]._id,
        status: "open",
        priority: "high",
        estimated_hours: 30,
        task_type: "development",
        start_date: new Date("2024-01-05"),
        due_date: new Date("2024-01-15"),
      },
      {
        title: "Frontend Dashboard UI",
        description: "Xây dựng giao diện dashboard responsive",
        project_id: projects[0]._id,
        created_by: employees[1]._id,
        status: "open",
        priority: "medium",
        estimated_hours: 50,
        task_type: "design",
        start_date: new Date("2024-01-10"),
        due_date: new Date("2024-01-30"),
      },
      {
        title: "QA Testing Sprint 1",
        description: "Testing toàn bộ features sprint 1",
        project_id: projects[0]._id,
        created_by: employees[2]._id,
        status: "open",
        priority: "medium",
        estimated_hours: 35,
        task_type: "testing",
        start_date: new Date("2024-01-25"),
        due_date: new Date("2024-02-05"),
      },
      {
        title: "API Security Audit",
        description: "Kiểm toàn bộ API về bảo mật",
        project_id: projects[1]._id,
        created_by: employees[1]._id,
        status: "open",
        priority: "high",
        estimated_hours: 25,
        task_type: "testing",
        start_date: new Date("2024-02-10"),
        due_date: new Date("2024-02-20"),
      },
      {
        title: "Mobile UI/UX Design",
        description: "Thiết kế giao diện ứng dụng mobile",
        project_id: projects[1]._id,
        created_by: employees[1]._id,
        status: "open",
        priority: "high",
        estimated_hours: 60,
        task_type: "design",
        start_date: new Date("2024-02-05"),
        due_date: new Date("2024-02-25"),
      },
    ]);
    console.log("✅ Created 6 tasks");

    // 4. Tạo Assignments
    const assignments = await Assignment.create([
      {
        task_id: tasks[0]._id,
        employee_id: employees[2]._id,
        assigned_by: employees[0]._id,
        estimated_hours: 40,
        actual_hours: 0,
        status: "assigned",
        priority: "high",
        assigned_date: new Date(),
        start_date: new Date("2024-01-05"),
        end_date: new Date("2024-01-20"),
        notes: "Ưu tiên cao - cần hoàn thành trước deadline",
      },
      {
        task_id: tasks[1]._id,
        employee_id: employees[3]._id,
        assigned_by: employees[0]._id,
        estimated_hours: 30,
        actual_hours: 0,
        status: "assigned",
        priority: "high",
        assigned_date: new Date(),
        start_date: new Date("2024-01-05"),
        end_date: new Date("2024-01-15"),
        notes: "Cần đáp ứng các yêu cầu từ khách hàng",
      },
      {
        task_id: tasks[2]._id,
        employee_id: employees[4]._id,
        assigned_by: employees[1]._id,
        estimated_hours: 50,
        actual_hours: 0,
        status: "assigned",
        priority: "medium",
        assigned_date: new Date(),
        start_date: new Date("2024-01-10"),
        end_date: new Date("2024-01-30"),
        notes: "Làm theo design system của công ty",
      },
      {
        task_id: tasks[3]._id,
        employee_id: employees[0]._id,
        assigned_by: employees[2]._id,
        estimated_hours: 35,
        actual_hours: 0,
        status: "pending",
        priority: "medium",
        assigned_date: new Date(),
        start_date: new Date("2024-01-25"),
        end_date: new Date("2024-02-05"),
      },
      {
        task_id: tasks[4]._id,
        employee_id: employees[1]._id,
        assigned_by: employees[1]._id,
        estimated_hours: 25,
        actual_hours: 0,
        status: "assigned",
        priority: "high",
        assigned_date: new Date(),
        start_date: new Date("2024-02-10"),
        end_date: new Date("2024-02-20"),
      },
      {
        task_id: tasks[5]._id,
        employee_id: employees[4]._id,
        assigned_by: employees[1]._id,
        estimated_hours: 60,
        actual_hours: 0,
        status: "assigned",
        priority: "high",
        assigned_date: new Date(),
        start_date: new Date("2024-02-05"),
        end_date: new Date("2024-02-25"),
      },
    ]);
    console.log("✅ Created 6 assignments");

    // 5. Tạo sample Timesheets
    const timesheets = await Timesheet.create([
      {
        assignment_id: assignments[0]._id,
        employee_id: employees[2]._id,
        task_id: tasks[0]._id,
        project_id: projects[0]._id,
        work_date: new Date("2024-01-05"),
        hours_worked: 8,
        description: "Phát triển authentication API",
        status: "approved",
        submitted_date: new Date("2024-01-05"),
        approved_by: employees[0]._id,
        approved_date: new Date("2024-01-05"),
      },
      {
        assignment_id: assignments[0]._id,
        employee_id: employees[2]._id,
        task_id: tasks[0]._id,
        project_id: projects[0]._id,
        work_date: new Date("2024-01-06"),
        hours_worked: 8,
        description: "Tiếp tục phát triển user endpoints",
        status: "submitted",
        submitted_date: new Date("2024-01-06"),
      },
      {
        assignment_id: assignments[1]._id,
        employee_id: employees[3]._id,
        task_id: tasks[1]._id,
        project_id: projects[0]._id,
        work_date: new Date("2024-01-05"),
        hours_worked: 6,
        description: "Thiết kế collection schemas",
        status: "draft",
      },
    ]);
    console.log("✅ Created 3 sample timesheets");

    console.log("\n📊 ========== DATABASE SEEDING COMPLETED ==========");
    console.log(`
    📈 Assignment Module Summary:
    ├─ Employees: ${employees.length}
    ├─ Projects: ${projects.length}
    ├─ Tasks: ${tasks.length}
    ├─ Assignments: ${assignments.length}
    └─ Timesheets: ${timesheets.length}
    
    💾 Database: ${process.env.MONGO_URI}
    🎯 Ready for development!
    `);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
