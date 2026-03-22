// src/components/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <div
      className="bg-dark text-white d-flex flex-column"
      style={{
        width: "260px",
        minHeight: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
        boxShadow: "2px 0 8px rgba(0,0,0,0.4)",
      }}
    >
      <div className="p-4 border-bottom border-secondary text-center">
        <h5 className="mb-1 fw-bold text-white">Timesheet System</h5>
        <small className="text-secondary">Quan ly nhan su</small>
      </div>

      <nav className="flex-grow-1 py-3">
        <ul className="nav flex-column">
          <li className="nav-item">
            <NavLink
              to="/add-department"
              className={({ isActive }) =>
                `nav-link d-flex align-items-center px-4 py-3 fw-medium ${
                  isActive
                    ? "active bg-primary text-white shadow-sm"
                    : "text-white-75 hover-bg-secondary"
                }`
              }
            >
              <i className="bi bi-plus-circle-fill me-3 fs-4 text-primary"></i>
              <span>Them phong ban moi</span>
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink
              to="/assign-personnel"
              className={({ isActive }) =>
                `nav-link d-flex align-items-center px-4 py-3 fw-medium ${
                  isActive
                    ? "active bg-primary text-white shadow-sm"
                    : "text-white-75 hover-bg-secondary"
                }`
              }
            >
              <i className="bi bi-people-fill me-3 fs-4 text-info"></i>
              <span>Sap xep nhan su</span>
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink
              to="/admin-accounts"
              to="/assignments"
              className={({ isActive }) =>
                `nav-link d-flex align-items-center px-4 py-3 fw-medium ${
                  isActive
                    ? "active bg-primary text-white shadow-sm"
                    : "text-white-75 hover-bg-secondary"
                }`
              }
            >
              <i className="bi bi-shield-lock-fill me-3 fs-4 text-warning"></i>
              <span>Quan ly tai khoan</span>
            </NavLink>
          </li>
              <i className="bi bi-clipboard-check me-3 fs-4 text-success"></i>
              <span>Phân công công việc</span>
            </NavLink>
          </li>

          {/* Thêm mục khác sau này nếu cần */}
        </ul>
      </nav>

      <div className="p-4 border-top border-secondary mt-auto text-center">
        <small className="text-secondary">2026 - Hung</small>
      </div>
    </div>
  );
}

export default Sidebar;
