// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AddDepartment from "./components/AddDepartment";
import DepartmentList from "./components/DepartmentList";
import AssignPersonnel from "./components/AssignPersonnel";
import AdminAccounts from "./components/admin/AdminAccounts";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* Trang mặc định khi mở */}
          <Route index element={<Navigate to="/add-department" replace />} />

          <Route path="add-department" element={<AddDepartment />} />
          <Route path="assign-personnel" element={<AssignPersonnel />} />
          <Route path="departments" element={<DepartmentList />} />
          <Route path="admin-accounts" element={<AdminAccounts />} />

          {/* Trang 404 nếu cần */}
          <Route
            path="*"
            element={
              <div className="text-center py-5">
                <h3>404 - Không tìm thấy trang</h3>
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
