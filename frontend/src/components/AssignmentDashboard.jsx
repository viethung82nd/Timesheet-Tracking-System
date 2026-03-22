import React, { useState, useEffect } from "react";
import "../styles/AssignmentDashboard.css";

const AssignmentDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState("projects");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});

  const API_BASE = "http://localhost:5000/api";

  // Fetch all data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError("");

      const [projectsRes, tasksRes, assignmentsRes, timesheetsRes, employeesRes] = await Promise.all([
        fetch(`${API_BASE}/projects`),
        fetch(`${API_BASE}/tasks`),
        fetch(`${API_BASE}/assignments`),
        fetch(`${API_BASE}/timesheets`),
        fetch(`${API_BASE}/employees`),
      ]);

      const projectsData = await projectsRes.json();
      const tasksData = await tasksRes.json();
      const assignmentsData = await assignmentsRes.json();
      const timesheetsData = await timesheetsRes.json();
      const employeesData = await employeesRes.json();

      if (projectsData.success) setProjects(projectsData.data);
      if (tasksData.success) setTasks(tasksData.data);
      if (assignmentsData.success) setAssignments(assignmentsData.data);
      if (timesheetsData.success) setTimesheets(timesheetsData.data);
      if (employeesData.success) setEmployees(employeesData.data);
    } catch (err) {
      setError("Error loading data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete functions
  const deleteProject = async (id) => {
    if (!window.confirm("Confirm delete?")) return;
    try {
      const res = await fetch(`${API_BASE}/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProjects(projects.filter((p) => p._id !== id));
        setError("Project deleted successfully!");
      }
    } catch (err) {
      setError("Error deleting project: " + err.message);
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Confirm delete?")) return;
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTasks(tasks.filter((t) => t._id !== id));
        setError("Task deleted successfully!");
      }
    } catch (err) {
      setError("Error deleting task: " + err.message);
    }
  };

  const deleteAssignment = async (id) => {
    if (!window.confirm("Confirm delete?")) return;
    try {
      const res = await fetch(`${API_BASE}/assignments/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAssignments(assignments.filter((a) => a._id !== id));
        setError("Assignment deleted successfully!");
      }
    } catch (err) {
      setError("Error deleting assignment: " + err.message);
    }
  };

  const deleteTimesheet = async (id) => {
    if (!window.confirm("Confirm delete?")) return;
    try {
      const res = await fetch(`${API_BASE}/timesheets/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTimesheets(timesheets.filter((ts) => ts._id !== id));
        setError("Timesheet deleted successfully!");
      }
    } catch (err) {
      setError("Error deleting timesheet: " + err.message);
    }
  };

  // Create/Update functions
  const openCreateForm = (type) => {
    setEditingId(null);
    setShowForm(type);
    setFormData({});
  };

  const openEditForm = (type, data) => {
    setEditingId(data._id);
    setShowForm(type);
    setFormData(data);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({});
  };

  const saveData = async (type) => {
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `${API_BASE}/${type}/${editingId}` : `${API_BASE}/${type}`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const resData = await res.json();

      if (resData.success) {
        setError(`${type} ${editingId ? "updated" : "created"} successfully!`);
        fetchAllData();
        closeForm();
      } else {
        setError(resData.message || "Error saving data");
      }
    } catch (err) {
      setError("Error saving data: " + err.message);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="assignment-dashboard">
      <h1>📋 Assignment Management Dashboard</h1>

      {error && (
        <div className={`banner ${error.includes("Error") ? "error-banner" : "success-banner"}`}>
          {error}
          <button onClick={() => setError("")} className="close-banner">×</button>
        </div>
      )}
      {loading && <div className="loading">Loading...</div>}

      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === "projects" ? "active" : ""}`}
          onClick={() => setActiveTab("projects")}
        >
          📁 Projects ({projects.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "tasks" ? "active" : ""}`}
          onClick={() => setActiveTab("tasks")}
        >
          ✅ Tasks ({tasks.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "assignments" ? "active" : ""}`}
          onClick={() => setActiveTab("assignments")}
        >
          👥 Assignments ({assignments.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "timesheets" ? "active" : ""}`}
          onClick={() => setActiveTab("timesheets")}
        >
          ⏱️ Timesheets ({timesheets.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "employees" ? "active" : ""}`}
          onClick={() => setActiveTab("employees")}
        >
          👤 Nhân viên ({employees.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "managers" ? "active" : ""}`}
          onClick={() => setActiveTab("managers")}
        >
          📊 Quản lý
        </button>
        <button className="refresh-btn" onClick={fetchAllData}>
          🔄 Refresh
        </button>
      </div>

      {/* PROJECTS TAB */}
      {activeTab === "projects" && (
        <div className="content-panel">
          <div className="panel-header">
            <h2>Projects</h2>
            <button className="create-btn" onClick={() => openCreateForm("projects")}>
              ➕ New Project
            </button>
          </div>
          <div className="data-table">
            {projects.length === 0 ? (
              <div className="no-data">No projects found</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Budget</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => (
                    <tr key={p._id}>
                      <td>{p.project_code}</td>
                      <td>{p.name}</td>
                      <td>
                        <span className={`status ${p.status}`}>{p.status}</span>
                      </td>
                      <td>{new Date(p.start_date).toLocaleDateString()}</td>
                      <td>{p.end_date ? new Date(p.end_date).toLocaleDateString() : "N/A"}</td>
                      <td>${p.budget}</td>
                      <td>
                        <button
                          className="edit-btn"
                          onClick={() => openEditForm("projects", p)}
                        >
                          ✏️
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => deleteProject(p._id)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TASKS TAB */}
      {activeTab === "tasks" && (
        <div className="content-panel">
          <div className="panel-header">
            <h2>Tasks</h2>
            <button className="create-btn" onClick={() => openCreateForm("tasks")}>
              ➕ New Task
            </button>
          </div>
          <div className="data-table">
            {tasks.length === 0 ? (
              <div className="no-data">No tasks found</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Est. Hours</th>
                    <th>Due Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t) => (
                    <tr key={t._id}>
                      <td>{t.title}</td>
                      <td>{t.task_type}</td>
                      <td>
                        <span className={`status ${t.status}`}>{t.status}</span>
                      </td>
                      <td>
                        <span className={`priority ${t.priority}`}>{t.priority}</span>
                      </td>
                      <td>{t.estimated_hours}h</td>
                      <td>{new Date(t.due_date).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="edit-btn"
                          onClick={() => openEditForm("tasks", t)}
                        >
                          ✏️
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => deleteTask(t._id)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ASSIGNMENTS TAB */}
      {activeTab === "assignments" && (
        <div className="content-panel">
          <div className="panel-header">
            <h2>Assignments</h2>
            <button className="create-btn" onClick={() => openCreateForm("assignments")}>
              ➕ New Assignment
            </button>
          </div>
          <div className="data-table">
            {assignments.length === 0 ? (
              <div className="no-data">No assignments found</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Employee</th>
                    <th>Status</th>
                    <th>Est. Hours</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Priority</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => (
                    <tr key={a._id}>
                      <td>{a.task_id?.title || "N/A"}</td>
                      <td>{a.employee_id?.username || "N/A"}</td>
                      <td>
                        <span className={`status ${a.status}`}>{a.status}</span>
                      </td>
                      <td>{a.estimated_hours}h</td>
                      <td>{new Date(a.start_date).toLocaleDateString()}</td>
                      <td>{new Date(a.end_date).toLocaleDateString()}</td>
                      <td>
                        <span className={`priority ${a.priority}`}>{a.priority}</span>
                      </td>
                      <td>
                        <button
                          className="edit-btn"
                          onClick={() => openEditForm("assignments", a)}
                        >
                          ✏️
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => deleteAssignment(a._id)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TIMESHEETS TAB */}
      {activeTab === "timesheets" && (
        <div className="content-panel">
          <div className="panel-header">
            <h2>Timesheets</h2>
            <button className="create-btn" onClick={() => openCreateForm("timesheets")}>
              ➕ New Timesheet
            </button>
          </div>
          <div className="data-table">
            {timesheets.length === 0 ? (
              <div className="no-data">No timesheets found</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Hours</th>
                    <th>Status</th>
                    <th>Description</th>
                    <th>Approved By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {timesheets.map((ts) => (
                    <tr key={ts._id}>
                      <td>{new Date(ts.work_date).toLocaleDateString()}</td>
                      <td>{ts.hours_worked}h</td>
                      <td>
                        <span className={`status ${ts.status}`}>{ts.status}</span>
                      </td>
                      <td>{ts.description || "N/A"}</td>
                      <td>{ts.approved_by?.username || "Pending"}</td>
                      <td>
                        <button
                          className="edit-btn"
                          onClick={() => openEditForm("timesheets", ts)}
                        >
                          ✏️
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => deleteTimesheet(ts._id)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* MODAL FORM */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-form">
            <div className="modal-header">
              <h3>{editingId ? "Edit" : "Create New"} {showForm}</h3>
              <button className="modal-close" onClick={closeForm}>×</button>
            </div>

            <div className="modal-body">
              {/* PROJECT FORM */}
              {showForm === "projects" && (
                <>
                  <div className="form-group">
                    <label>Mã dự án (Project Code) *</label>
                    <input
                      type="text"
                      name="project_code"
                      value={formData.project_code || ""}
                      onChange={handleFormChange}
                      placeholder="e.g., FPT-TS-2024"
                    />
                  </div>
                  <div className="form-group">
                    <label>Tên dự án (Project Name) *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ""}
                      onChange={handleFormChange}
                      placeholder="Tên dự án"
                    />
                  </div>
                  <div className="form-group">
                    <label>Mô tả (Description)</label>
                    <textarea
                      name="description"
                      value={formData.description || ""}
                      onChange={handleFormChange}
                      placeholder="Mô tả dự án"
                      rows="3"
                    />
                  </div>
                  <div className="form-group">
                    <label>Người quản lý (Manager) *</label>
                    <select 
                      name="manager_id" 
                      value={formData.manager_id || ""} 
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">-- Chọn người quản lý --</option>
                      {employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.full_name} ({emp.username})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Trạng thái (Status)</label>
                    <select name="status" value={formData.status || "planning"} onChange={handleFormChange}>
                      <option value="planning">planning</option>
                      <option value="active">active</option>
                      <option value="on_hold">on_hold</option>
                      <option value="completed">completed</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Ngày bắt đầu (Start Date)</label>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date?.split("T")[0] || ""}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Ngày kết thúc (End Date)</label>
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date?.split("T")[0] || ""}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Ngân sách (Budget)</label>
                    <input
                      type="number"
                      name="budget"
                      value={formData.budget || ""}
                      onChange={handleFormChange}
                      placeholder="0"
                    />
                  </div>
                </>
              )}

              {/* TASK FORM */}
              {showForm === "tasks" && (
                <>
                  <div className="form-group">
                    <label>Dự án (Project) *</label>
                    <select 
                      name="project_id" 
                      value={formData.project_id || ""} 
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">-- Chọn dự án --</option>
                      {projects.map((proj) => (
                        <option key={proj._id} value={proj._id}>
                          {proj.name} ({proj.project_code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Tiêu đề (Title) *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title || ""}
                      onChange={handleFormChange}
                      placeholder="Tiêu đề công việc"
                    />
                  </div>
                  <div className="form-group">
                    <label>Mô tả (Description)</label>
                    <textarea
                      name="description"
                      value={formData.description || ""}
                      onChange={handleFormChange}
                      placeholder="Mô tả chi tiết công việc"
                      rows="3"
                    />
                  </div>
                  <div className="form-group">
                    <label>Loại công việc (Task Type)</label>
                    <select name="task_type" value={formData.task_type || "development"} onChange={handleFormChange}>
                      <option value="development">development</option>
                      <option value="testing">testing</option>
                      <option value="design">design</option>
                      <option value="documentation">documentation</option>
                      <option value="meetings">meetings</option>
                      <option value="other">other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Trạng thái (Status)</label>
                    <select name="status" value={formData.status || "open"} onChange={handleFormChange}>
                      <option value="open">open</option>
                      <option value="in_progress">in_progress</option>
                      <option value="completed">completed</option>
                      <option value="on_hold">on_hold</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Độ ưu tiên (Priority)</label>
                    <select name="priority" value={formData.priority || "medium"} onChange={handleFormChange}>
                      <option value="low">low</option>
                      <option value="medium">medium</option>
                      <option value="high">high</option>
                      <option value="urgent">urgent</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Giờ ước tính (Estimated Hours)</label>
                    <input
                      type="number"
                      name="estimated_hours"
                      value={formData.estimated_hours || ""}
                      onChange={handleFormChange}
                      placeholder="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Ngày đến hạn (Due Date)</label>
                    <input
                      type="date"
                      name="due_date"
                      value={formData.due_date?.split("T")[0] || ""}
                      onChange={handleFormChange}
                    />
                  </div>
                </>
              )}

              {/* ASSIGNMENT FORM */}
              {showForm === "assignments" && (
                <>
                  <div className="form-group">
                    <label>Công việc * (Task)</label>
                    <select 
                      name="task_id" 
                      value={formData.task_id || ""} 
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">-- Chọn công việc --</option>
                      {tasks.map((task) => (
                        <option key={task._id} value={task._id}>
                          {task.title} ({task.project_id?.name || "N/A"})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Nhân viên * (Employee)</label>
                    <select 
                      name="employee_id" 
                      value={formData.employee_id || ""} 
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">-- Chọn nhân viên --</option>
                      {employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.full_name} ({emp.username})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Trạng thái (Status)</label>
                    <select name="status" value={formData.status || "pending"} onChange={handleFormChange}>
                      <option value="pending">pending</option>
                      <option value="assigned">assigned</option>
                      <option value="in_progress">in_progress</option>
                      <option value="completed">completed</option>
                      <option value="rejected">rejected</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Giờ ước tính (Estimated Hours)</label>
                    <input
                      type="number"
                      name="estimated_hours"
                      value={formData.estimated_hours || ""}
                      onChange={handleFormChange}
                      placeholder="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Giờ thực tế (Actual Hours)</label>
                    <input
                      type="number"
                      name="actual_hours"
                      value={formData.actual_hours || ""}
                      onChange={handleFormChange}
                      placeholder="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Độ ưu tiên (Priority)</label>
                    <select name="priority" value={formData.priority || "medium"} onChange={handleFormChange}>
                      <option value="low">low</option>
                      <option value="medium">medium</option>
                      <option value="high">high</option>
                      <option value="urgent">urgent</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Ngày bắt đầu (Start Date)</label>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date?.split("T")[0] || ""}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Ngày kết thúc (End Date)</label>
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date?.split("T")[0] || ""}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Ghi chú (Notes)</label>
                    <textarea
                      name="notes"
                      value={formData.notes || ""}
                      onChange={handleFormChange}
                      rows="3"
                    />
                  </div>
                </>
              )}

              {/* TIMESHEET FORM */}
              {showForm === "timesheets" && (
                <>
                  <div className="form-group">
                    <label>Phân công (Assignment) *</label>
                    <select 
                      name="assignment_id" 
                      value={formData.assignment_id || ""} 
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">-- Chọn phân công --</option>
                      {assignments.map((assign) => (
                        <option key={assign._id} value={assign._id}>
                          {assign.task_id?.title || "N/A"} - {assign.employee_id?.full_name || "N/A"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Ngày làm việc (Work Date)</label>
                    <input
                      type="date"
                      name="work_date"
                      value={formData.work_date?.split("T")[0] || ""}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Giờ làm việc (Hours Worked) 0-24 *</label>
                    <input
                      type="number"
                      name="hours_worked"
                      min="0"
                      max="24"
                      value={formData.hours_worked || ""}
                      onChange={handleFormChange}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Trạng thái (Status)</label>
                    <select name="status" value={formData.status || "draft"} onChange={handleFormChange}>
                      <option value="draft">draft</option>
                      <option value="submitted">submitted</option>
                      <option value="approved">approved</option>
                      <option value="rejected">rejected</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Mô tả công việc (Work Description)</label>
                    <textarea
                      name="description"
                      value={formData.description || ""}
                      onChange={handleFormChange}
                      placeholder="Mô tả công việc đã làm"
                      rows="3"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeForm}>Cancel</button>
              <button className="btn-save" onClick={() => saveData(showForm)}>
                {editingId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMPLOYEES TAB - Nhân viên và công việc họ đang làm */}
      {activeTab === "employees" && (
        <div className="content-panel">
          <h2>👤 Nhân viên & Công việc</h2>
          <div className="data-table">
            {employees.length === 0 ? (
              <div className="no-data">No employees found</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Tên nhân viên</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Trạng thái</th>
                    <th>Công việc hiện tại</th>
                    <th>Phân công</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => {
                    const empAssignments = assignments.filter((a) => a.employee_id?._id === emp._id);
                    const activeAssignments = empAssignments.filter((a) => 
                      a.status === "assigned" || a.status === "in_progress"
                    );
                    return (
                      <tr key={emp._id}>
                        <td><strong>{emp.full_name}</strong></td>
                        <td>{emp.username}</td>
                        <td>{emp.email}</td>
                        <td>
                          <span className={`status ${emp.status}`}>{emp.status}</span>
                        </td>
                        <td>
                          {activeAssignments.length > 0 ? (
                            <ul style={{ margin: 0, paddingLeft: "20px" }}>
                              {activeAssignments.map((assign) => (
                                <li key={assign._id}>
                                  {assign.task_id?.title}
                                  <br />
                                  <small style={{ color: "#666" }}>
                                    {assign.task_id?.task_type} | 
                                    <span className={`priority ${assign.priority}`}>
                                      {assign.priority}
                                    </span>
                                  </small>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span style={{ color: "#999" }}>Không có công việc</span>
                          )}
                        </td>
                        <td>
                          <span className="badge">{empAssignments.length} task(s)</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* MANAGERS TAB - Quản lý dự án */}
      {activeTab === "managers" && (
        <div className="content-panel">
          <h2>📊 Quản lý & Dự án</h2>
          <div className="data-table">
            {projects.length === 0 ? (
              <div className="no-data">No projects found</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Dự án</th>
                    <th>Mã dự án</th>
                    <th>Quản lý</th>
                    <th>Trạng thái</th>
                    <th>Từ - Đến</th>
                    <th>Ngân sách</th>
                    <th>Số công việc</th>
                    <th>Nhân viên tham gia</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((proj) => {
                    const projTasks = tasks.filter((t) => t.project_id?._id === proj._id || t.project_id === proj._id);
                    const projAssignments = assignments.filter((a) => {
                      const taskBelongsToProj = projTasks.some((t) => a.task_id?._id === t._id || a.task_id === t._id);
                      return taskBelongsToProj;
                    });
                    const uniqueEmployees = [...new Set(projAssignments.map((a) => a.employee_id?._id).filter(Boolean))];
                    
                    return (
                      <tr key={proj._id}>
                        <td><strong>{proj.name}</strong></td>
                        <td>{proj.project_code}</td>
                        <td>
                          <strong>{proj.manager_id?.full_name}</strong>
                          <br />
                          <small style={{ color: "#666" }}>({proj.manager_id?.username})</small>
                        </td>
                        <td>
                          <span className={`status ${proj.status}`}>{proj.status}</span>
                        </td>
                        <td>
                          {new Date(proj.start_date).toLocaleDateString()} → {new Date(proj.end_date).toLocaleDateString()}
                        </td>
                        <td>${proj.budget.toLocaleString()}</td>
                        <td>
                          <span className="badge">{projTasks.length}</span>
                        </td>
                        <td>
                          {uniqueEmployees.length > 0 ? (
                            <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "12px" }}>
                              {uniqueEmployees.map((empId) => {
                                const emp = employees.find((e) => e._id === empId);
                                return (
                                  <li key={empId}>{emp?.full_name} ({emp?.username})</li>
                                );
                              })}
                            </ul>
                          ) : (
                            <span style={{ color: "#999" }}>Chưa có nhân viên</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* MODAL FORM */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-form">
            <div className="modal-header">
              <h3>{editingId ? "Edit" : "Create New"} {showForm}</h3>
              <button className="modal-close" onClick={closeForm}>×</button>
            </div>

            <div className="modal-body">
              {/* PROJECT FORM */}
              {showForm === "projects" && (
                <>
                  <div className="form-group">
                    <label>Mã dự án (Project Code) *</label>
                    <input
                      type="text"
                      name="project_code"
                      value={formData.project_code || ""}
                      onChange={handleFormChange}
                      placeholder="e.g., FPT-TS-2024"
                    />
                  </div>
                  <div className="form-group">
                    <label>Tên dự án (Project Name) *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ""}
                      onChange={handleFormChange}
                      placeholder="Tên dự án"
                    />
                  </div>
                  <div className="form-group">
                    <label>Mô tả (Description)</label>
                    <textarea
                      name="description"
                      value={formData.description || ""}
                      onChange={handleFormChange}
                      placeholder="Mô tả dự án"
                      rows="3"
                    />
                  </div>
                  <div className="form-group">
                    <label>Người quản lý (Manager) *</label>
                    <select 
                      name="manager_id" 
                      value={formData.manager_id || ""} 
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">-- Chọn người quản lý --</option>
                      {employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.full_name} ({emp.username})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Trạng thái (Status)</label>
                    <select name="status" value={formData.status || "planning"} onChange={handleFormChange}>
                      <option value="planning">planning</option>
                      <option value="active">active</option>
                      <option value="on_hold">on_hold</option>
                      <option value="completed">completed</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Ngày bắt đầu (Start Date)</label>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date?.split("T")[0] || ""}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Ngày kết thúc (End Date)</label>
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date?.split("T")[0] || ""}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Ngân sách (Budget)</label>
                    <input
                      type="number"
                      name="budget"
                      value={formData.budget || ""}
                      onChange={handleFormChange}
                      placeholder="0"
                    />
                  </div>
                </>
              )}

              {/* TASK FORM */}
              {showForm === "tasks" && (
                <>
                  <div className="form-group">
                    <label>Dự án (Project) *</label>
                    <select 
                      name="project_id" 
                      value={formData.project_id || ""} 
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">-- Chọn dự án --</option>
                      {projects.map((proj) => (
                        <option key={proj._id} value={proj._id}>
                          {proj.name} ({proj.project_code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Tiêu đề (Title) *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title || ""}
                      onChange={handleFormChange}
                      placeholder="Tiêu đề công việc"
                    />
                  </div>
                  <div className="form-group">
                    <label>Mô tả (Description)</label>
                    <textarea
                      name="description"
                      value={formData.description || ""}
                      onChange={handleFormChange}
                      placeholder="Mô tả chi tiết công việc"
                      rows="3"
                    />
                  </div>
                  <div className="form-group">
                    <label>Loại công việc (Task Type)</label>
                    <select name="task_type" value={formData.task_type || "development"} onChange={handleFormChange}>
                      <option value="development">development</option>
                      <option value="testing">testing</option>
                      <option value="design">design</option>
                      <option value="documentation">documentation</option>
                      <option value="meetings">meetings</option>
                      <option value="other">other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Trạng thái (Status)</label>
                    <select name="status" value={formData.status || "open"} onChange={handleFormChange}>
                      <option value="open">open</option>
                      <option value="in_progress">in_progress</option>
                      <option value="completed">completed</option>
                      <option value="on_hold">on_hold</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Độ ưu tiên (Priority)</label>
                    <select name="priority" value={formData.priority || "medium"} onChange={handleFormChange}>
                      <option value="low">low</option>
                      <option value="medium">medium</option>
                      <option value="high">high</option>
                      <option value="urgent">urgent</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Giờ ước tính (Estimated Hours)</label>
                    <input
                      type="number"
                      name="estimated_hours"
                      value={formData.estimated_hours || ""}
                      onChange={handleFormChange}
                      placeholder="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Ngày đến hạn (Due Date)</label>
                    <input
                      type="date"
                      name="due_date"
                      value={formData.due_date?.split("T")[0] || ""}
                      onChange={handleFormChange}
                    />
                  </div>
                </>
              )}

              {/* ASSIGNMENT FORM */}
              {showForm === "assignments" && (
                <>
                  <div className="form-group">
                    <label>Công việc * (Task)</label>
                    <select 
                      name="task_id" 
                      value={formData.task_id || ""} 
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">-- Chọn công việc --</option>
                      {tasks.map((task) => (
                        <option key={task._id} value={task._id}>
                          {task.title} ({task.project_id?.name || "N/A"})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Nhân viên * (Employee)</label>
                    <select 
                      name="employee_id" 
                      value={formData.employee_id || ""} 
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">-- Chọn nhân viên --</option>
                      {employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.full_name} ({emp.username})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Trạng thái (Status)</label>
                    <select name="status" value={formData.status || "pending"} onChange={handleFormChange}>
                      <option value="pending">pending</option>
                      <option value="assigned">assigned</option>
                      <option value="in_progress">in_progress</option>
                      <option value="completed">completed</option>
                      <option value="rejected">rejected</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Giờ ước tính (Estimated Hours)</label>
                    <input
                      type="number"
                      name="estimated_hours"
                      value={formData.estimated_hours || ""}
                      onChange={handleFormChange}
                      placeholder="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Giờ thực tế (Actual Hours)</label>
                    <input
                      type="number"
                      name="actual_hours"
                      value={formData.actual_hours || ""}
                      onChange={handleFormChange}
                      placeholder="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Độ ưu tiên (Priority)</label>
                    <select name="priority" value={formData.priority || "medium"} onChange={handleFormChange}>
                      <option value="low">low</option>
                      <option value="medium">medium</option>
                      <option value="high">high</option>
                      <option value="urgent">urgent</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Ngày bắt đầu (Start Date)</label>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date?.split("T")[0] || ""}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Ngày kết thúc (End Date)</label>
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date?.split("T")[0] || ""}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Ghi chú (Notes)</label>
                    <textarea
                      name="notes"
                      value={formData.notes || ""}
                      onChange={handleFormChange}
                      rows="3"
                    />
                  </div>
                </>
              )}

              {/* TIMESHEET FORM */}
              {showForm === "timesheets" && (
                <>
                  <div className="form-group">
                    <label>Phân công (Assignment) *</label>
                    <select 
                      name="assignment_id" 
                      value={formData.assignment_id || ""} 
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">-- Chọn phân công --</option>
                      {assignments.map((assign) => (
                        <option key={assign._id} value={assign._id}>
                          {assign.task_id?.title || "N/A"} - {assign.employee_id?.full_name || "N/A"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Ngày làm việc (Work Date)</label>
                    <input
                      type="date"
                      name="work_date"
                      value={formData.work_date?.split("T")[0] || ""}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Giờ làm việc (Hours Worked) 0-24 *</label>
                    <input
                      type="number"
                      name="hours_worked"
                      min="0"
                      max="24"
                      value={formData.hours_worked || ""}
                      onChange={handleFormChange}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Trạng thái (Status)</label>
                    <select name="status" value={formData.status || "draft"} onChange={handleFormChange}>
                      <option value="draft">draft</option>
                      <option value="submitted">submitted</option>
                      <option value="approved">approved</option>
                      <option value="rejected">rejected</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Mô tả công việc (Work Description)</label>
                    <textarea
                      name="description"
                      value={formData.description || ""}
                      onChange={handleFormChange}
                      placeholder="Mô tả công việc đã làm"
                      rows="3"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeForm}>Cancel</button>
              <button className="btn-save" onClick={() => saveData(showForm)}>
                {editingId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentDashboard;
