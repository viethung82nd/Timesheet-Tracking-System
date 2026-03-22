require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Routes
app.use("/api/departments", require("./routes/admin/departmentRoutes"));
app.use("/api/users", require("./routes/admin/userRoutes"));

// Route test đơn giản
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Backend đang chạy bình thường (không auth)",
    time: new Date().toISOString(),
  });
});

// Xử lý 404
app.use((req, res) => {
  res.status(404).json({ message: "Không tìm thấy endpoint" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Có lỗi xảy ra", error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
