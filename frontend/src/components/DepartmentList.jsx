import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000/api/departments";

function DepartmentList() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/all`);
      setDepartments(res.data.departments || []);
    } catch (err) {
      setError("Không tải được danh sách phòng ban");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleEdit = (dept) => {
    setEditId(dept._id);
    setEditName(dept.name);
  };

  const saveEdit = async (id) => {
    if (!editName.trim()) return setError("Tên không được để trống");

    try {
      await axios.put(`${API_BASE}/${id}`, { name: editName.trim() });
      setSuccess("Cập nhật tên thành công");
      setEditId(null);
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.message || "Cập nhật thất bại");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa phòng ban này?")) return;

    try {
      await axios.delete(`${API_BASE}/${id}`);
      setSuccess("Xóa phòng ban thành công");
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.message || "Xóa thất bại");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await axios.patch(`${API_BASE}/${id}/toggle-status`);
      setSuccess(res.data.message);
      fetchDepartments();
    } catch (err) {
      setError("Thay đổi trạng thái thất bại");
    }
  };

  return (
    <div>
      <h2 className="mb-4">Quản lý phòng ban</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {loading ? (
        <div className="text-center">
          <div className="spinner-border"></div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover table-bordered">
            <thead className="table-dark">
              <tr>
                <th>Tên phòng ban</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept._id}>
                  <td>
                    {editId === dept._id ? (
                      <input
                        type="text"
                        className="form-control"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    ) : (
                      dept.name
                    )}
                  </td>
                  <td>
                    <span
                      className={`badge ${dept.status === "active" ? "bg-success" : "bg-danger"}`}
                    >
                      {dept.status === "active"
                        ? "Hoạt động"
                        : "Dừng hoạt động"}
                    </span>
                  </td>
                  <td>
                    {editId === dept._id ? (
                      <>
                        <button
                          className="btn btn-sm btn-success me-2"
                          onClick={() => saveEdit(dept._id)}
                        >
                          Lưu
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => setEditId(null)}
                        >
                          Hủy
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn-sm btn-primary me-2"
                          onClick={() => handleEdit(dept)}
                        >
                          Sửa
                        </button>
                        <button
                          className={`btn btn-sm ${dept.status === "active" ? "btn-warning" : "btn-success"} me-2`}
                          onClick={() => handleToggleStatus(dept._id)}
                        >
                          {dept.status === "active" ? "Dừng" : "Kích hoạt"}
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(dept._id)}
                        >
                          Xóa
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {departments.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center">
                    Chưa có phòng ban nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DepartmentList;
