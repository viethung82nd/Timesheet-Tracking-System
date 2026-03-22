import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import "./AdminAccounts.css";

const API_BASE = "http://localhost:5000/api/users";
const DEPT_API = "http://localhost:5000/api/departments/all";

const roleLabel = {
  employee: "Employee",
  manager: "Manager",
  senior_manager: "Senior Manager",
};

const statusLabel = {
  active: "Active",
  locked: "Locked",
};

const initialsFromName = (name) => {
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

function AdminAccounts() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "employee",
    status: "active",
    departmentId: "",
    location: "",
  });
  const [formError, setFormError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 2400);
    return () => clearTimeout(timer);
  }, [notice]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE);
      setUsers(res.data.users || []);
    } catch (err) {
      pushNotice("Cannot connect to backend");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(DEPT_API);
      setDepartments(res.data.departments || []);
    } catch (err) {
      setDepartments([]);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((user) => {
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" || user.status === statusFilter;
      const matchesQuery =
        !q ||
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.department.toLowerCase().includes(q);
      return matchesRole && matchesStatus && matchesQuery;
    });
  }, [users, query, roleFilter, statusFilter]);

  const groupedUsers = useMemo(() => {
    const groups = {
      senior_manager: [],
      manager: [],
      employee: [],
    };
    filteredUsers.forEach((user) => {
      if (groups[user.role]) {
        groups[user.role].push(user);
      }
    });
    return groups;
  }, [filteredUsers]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "active").length;
    const locked = users.filter((u) => u.status === "locked").length;
    return { total, active, locked };
  }, [users]);

  const isSelected = (id) => selectedIds.includes(id);
  const allVisibleSelected =
    filteredUsers.length > 0 &&
    filteredUsers.every((user) => selectedIds.includes(user.id));

  const toggleSelected = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      const visibleIds = new Set(filteredUsers.map((user) => user.id));
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.has(id)));
      return;
    }
    const visibleIds = filteredUsers.map((user) => user.id);
    setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
  };

  const pushNotice = (message) => setNotice(message);

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      role: "employee",
      status: "active",
      departmentId: "",
      location: "",
    });
    setFormError("");
    setFormErrors({});
  };

  const handleFormChange = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Name is required.";
    if (!form.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      errors.email = "Email is invalid.";
    }
    if (!form.role) errors.role = "Role is required.";
    if (!form.status) errors.status = "Status is required.";
    return errors;
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setFormError("");
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setFormLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        status: form.status,
        location: form.location.trim(),
      };
      if (form.departmentId) {
        payload.departmentId = form.departmentId;
      }

      const res = await axios.post(API_BASE, payload);
      setUsers((prev) => [res.data.user, ...prev]);
      pushNotice("Account created");
      resetForm();
      setShowModal(false);
    } catch (err) {
      setFormError(err.response?.data?.message || "Create failed");
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleLock = (id) => {
    const user = users.find((item) => item.id === id);
    if (!user) return;
    const nextStatus = user.status === "locked" ? "active" : "locked";
    axios
      .patch(`${API_BASE}/${id}`, { status: nextStatus })
      .then((res) => {
        setUsers((prev) =>
          prev.map((item) => (item.id === id ? res.data.user : item)),
        );
        pushNotice(
          `${user.name} ${nextStatus === "locked" ? "locked" : "unlocked"}`,
        );
      })
      .catch(() => {
        pushNotice("Update failed");
      });
  };

  const handleResetPassword = (id) => {
    axios
      .post(`${API_BASE}/${id}/reset-password`)
      .then((res) => {
        pushNotice(res.data.message || "Reset link sent");
      })
      .catch(() => {
        pushNotice("Reset failed");
      });
  };

  const handleRoleChange = (id, role) => {
    const user = users.find((item) => item.id === id);
    if (!user) return;
    axios
      .patch(`${API_BASE}/${id}`, { role })
      .then((res) => {
        setUsers((prev) =>
          prev.map((item) => (item.id === id ? res.data.user : item)),
        );
        pushNotice(`${user.name} -> ${roleLabel[role]}`);
      })
      .catch(() => {
        pushNotice("Update failed");
      });
  };

  const handleBulkLock = (lock) => {
    if (selectedIds.length === 0) return;
    const nextStatus = lock ? "locked" : "active";
    axios
      .patch(`${API_BASE}/bulk-status`, {
        ids: selectedIds,
        status: nextStatus,
      })
      .then((res) => {
        const updatedMap = new Map(
          (res.data.users || []).map((user) => [user.id, user]),
        );
        setUsers((prev) =>
          prev.map((item) => updatedMap.get(item.id) || item),
        );
        pushNotice(
          lock ? "Selected accounts locked" : "Selected accounts unlocked",
        );
        handleClearSelection();
      })
      .catch(() => {
        pushNotice("Bulk update failed");
      });
  };

  const handleClearSelection = () => setSelectedIds([]);

  return (
    <div className="admin-accounts">
      <header className="admin-hero">
        <div>
          <p className="admin-eyebrow">Admin Management</p>
          <h1 className="admin-title">Quản lý tài khoản nhân viên</h1>
          <p className="admin-subtitle">
            Dề dàng quản lý nhân viên.
          </p>
        </div>
        <div className="admin-hero-actions">
          <button className="aa-btn primary" onClick={() => setShowModal(true)}>
            Create account
          </button>
        </div>
      </header>

      {notice && <div className="admin-notice">{notice}</div>}

      {showModal && (
        <div
          className="account-modal-backdrop"
          onClick={() => setShowModal(false)}
        >
          <div
            className="account-modal-card"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="account-modal-header">
              <div>
                <h2>Create new account</h2>
                <p>Add a new user and assign role or department.</p>
              </div>
              <button
                className="account-modal-close"
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            {formError && <div className="form-error">{formError}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-grid">
                <label className="form-field">
                  Name
                  <input
                    type="text"
                    value={form.name}
                    onChange={handleFormChange("name")}
                    placeholder="Full name"
                  />
                  {formErrors.name && (
                    <span className="field-error">{formErrors.name}</span>
                  )}
                </label>
                <label className="form-field">
                  Email
                  <input
                    type="email"
                    value={form.email}
                    onChange={handleFormChange("email")}
                    placeholder="name@company.vn"
                  />
                  {formErrors.email && (
                    <span className="field-error">{formErrors.email}</span>
                  )}
                </label>
                <label className="form-field">
                  Role
                  <select value={form.role} onChange={handleFormChange("role")}>
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="senior_manager">Senior Manager</option>
                  </select>
                  {formErrors.role && (
                    <span className="field-error">{formErrors.role}</span>
                  )}
                </label>
                <label className="form-field">
                  Status
                  <select
                    value={form.status}
                    onChange={handleFormChange("status")}
                  >
                    <option value="active">Active</option>
                    <option value="locked">Locked</option>
                  </select>
                  {formErrors.status && (
                    <span className="field-error">{formErrors.status}</span>
                  )}
                </label>
                <label className="form-field">
                  Department
                  <select
                    value={form.departmentId}
                    onChange={handleFormChange("departmentId")}
                  >
                    <option value="">Unassigned</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="form-field">
                  Location
                  <input
                    type="text"
                    value={form.location}
                    onChange={handleFormChange("location")}
                    placeholder="HCMC, Hanoi..."
                  />
                </label>
              </div>
              <div className="form-actions">
                <button
                  className="aa-btn primary"
                  type="submit"
                  disabled={formLoading}
                >
                  {formLoading ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <section className="admin-stats">
        <div className="stat-card">
          <div className="stat-icon accent-blue">
            <i className="bi bi-people-fill"></i>
          </div>
          <div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total accounts</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon accent-green">
            <i className="bi bi-shield-check"></i>
          </div>
          <div>
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">Active</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon accent-amber">
            <i className="bi bi-lock-fill"></i>
          </div>
          <div>
            <div className="stat-value">{stats.locked}</div>
            <div className="stat-label">Locked</div>
          </div>
        </div>
      </section>

      <section className="admin-controls">
        <div className="search-field">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Search name, email, department"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button className="aa-btn tiny" onClick={() => setQuery("")}>
            Clear
          </button>
        </div>
        <div className="filter-group">
          <label className="filter-label">
            Role
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
            >
              <option value="all">All roles</option>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="senior_manager">Senior Manager</option>
            </select>
          </label>
          <label className="filter-label">
            Status
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="locked">Locked</option>
            </select>
          </label>
          <label className="select-toggle">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleSelectAll}
            />
            Select visible
          </label>
          <button
            className="aa-btn tiny ghost btn-refresh"
            onClick={fetchUsers}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </section>

      {selectedIds.length > 0 && (
        <section className="selection-bar">
          <span>{selectedIds.length} selected</span>
          <div className="selection-actions">
            <button className="aa-btn tiny" onClick={() => handleBulkLock(true)}>
              Lock
            </button>
            <button
              className="aa-btn tiny"
              onClick={() => handleBulkLock(false)}
            >
              Unlock
            </button>
            <button className="aa-btn tiny ghost" onClick={handleClearSelection}>
              Clear
            </button>
          </div>
        </section>
      )}

      <section className="role-sections">
        {filteredUsers.length === 0 ? (
          <div className="empty-state">
            <h3>No accounts found</h3>
            <p>Try clearing filters or create a new account.</p>
            <button className="aa-btn primary" onClick={() => setShowModal(true)}>
              Create account
            </button>
          </div>
        ) : (
          [
            {
              key: "senior_manager",
              title: "Senior manager",
            },
            {
              key: "manager",
              title: "Manager",
            },
            {
              key: "employee",
              title: "Employee",
            },
          ].map((group) => (
            <div className="role-section" key={group.key}>
              <div className={`role-header role-${group.key}`}>
                <div>{group.title}</div>
                <span>{groupedUsers[group.key].length}</span>
              </div>
              <div className="role-list">
                {groupedUsers[group.key].map((user, index) => (
                  <article
                    key={user.id}
                    className={`user-card role-${user.role} ${
                      isSelected(user.id) ? "selected" : ""
                    }`}
                    style={{ "--i": index }}
                  >
                    <div className="user-top">
                      <button
                        className={`select-dot ${isSelected(user.id) ? "active" : ""}`}
                        onClick={() => toggleSelected(user.id)}
                        aria-pressed={isSelected(user.id)}
                        aria-label="Select user"
                      ></button>
                      <span className={`status-pill ${user.status}`}>
                        {statusLabel[user.status]}
                      </span>
                    </div>
                    <div className="user-head">
                      <div className="avatar">{initialsFromName(user.name)}</div>
                      <div className="user-info">
                        <div className="user-name">{user.name}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </div>
                    <div className="user-meta">
                      <div>
                        <span className="meta-label">Department</span>
                        <span className="meta-value">{user.department}</span>
                      </div>
                      <div>
                        <span className="meta-label">Location</span>
                        <span className="meta-value">{user.location}</span>
                      </div>
                    </div>
                    <div className="user-foot">
                      <label className="role-select">
                        Role
                        <select
                          value={user.role}
                          onChange={(event) =>
                            handleRoleChange(user.id, event.target.value)
                          }
                        >
                          <option value="employee">Employee</option>
                          <option value="manager">Manager</option>
                          <option value="senior_manager">Senior Manager</option>
                        </select>
                      </label>
                      <div className="user-actions">
                        <button
                          className="aa-btn tiny ghost btn-reset"
                          onClick={() => handleResetPassword(user.id)}
                        >
                          Reset
                        </button>
                        <button
                          className="aa-btn tiny btn-lock"
                          onClick={() => handleToggleLock(user.id)}
                        >
                          {user.status === "locked" ? "Unlock" : "Lock"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
                {groupedUsers[group.key].length === 0 && (
                  <div className="empty-state">
                    <h3>No accounts</h3>
                    <p>Nothing here yet.</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

export default AdminAccounts;
