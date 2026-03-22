// src/layouts/MainLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function MainLayout() {
  return (
    <div className="d-flex min-vh-100">
      {/* Sidebar cố định */}
      <Sidebar />

      {/* Nội dung chính - chừa khoảng trống bên trái */}
      <main
        className="flex-grow-1 bg-light overflow-auto"
        style={{ marginLeft: "260px" }} // ← Đây là fix chính!
      >
        <div className="container-fluid p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default MainLayout;
