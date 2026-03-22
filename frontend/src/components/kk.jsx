import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";

const API_BASE = "http://localhost:5000/api/departments";

function AssignPersonnel() {
  const [departments, setDepartments] = useState([]);
  const [unassignedUsers, setUnassignedUsers] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [selectedDeptUsers, setSelectedDeptUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal xóa
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [userToRemove, setUserToRemove] = useState(null);

  // Tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await axios.get(API_BASE);
      setDepartments(res.data.departments || []);
      setUnassignedUsers(res.data.unassignedUsers || []);

      if (selectedDeptId) {
        await loadDeptUsers(selectedDeptId);
      }
    } catch (err) {
      setError("Không kết nối được backend");
    } finally {
      setLoading(false);
    }
  };
  const exportUnassignedToExcel = () => {
    if (filteredUnassigned.length === 0) {
      alert("Không có dữ liệu để xuất");
      return;
    }

    const data = filteredUnassigned.map((user) => ({
      "Tên nhân viên": user.name,
      Email: user.email,
      "Chức vụ": user.role === "manager" ? "Quản lý" : "Nhân viên",
      "Trạng thái": "Chưa phân phòng ban",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Nhân viên chưa phân");

    // Tùy chỉnh cột (tùy chọn)
    ws["!cols"] = [
      { wch: 25 }, // Tên
      { wch: 30 }, // Email
      { wch: 15 }, // Chức vụ
      { wch: 20 }, // Trạng thái
    ];

    XLSX.writeFile(wb, "Nhan_vien_chua_phan_phong_ban.xlsx");
  };

  const exportDeptUsersToExcel = () => {
    if (selectedDeptUsers.length === 0) {
      alert("Phòng ban này chưa có nhân viên");
      return;
    }

    const deptName =
      departments.find((d) => d._id === selectedDeptId)?.name ||
      "Không xác định";

    const data = selectedDeptUsers.map((user) => ({
      "Tên nhân viên": user.name,
      Email: user.email,
      "Chức vụ": user.role === "manager" ? "Quản lý" : "Nhân viên",
      "Phòng ban": deptName,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Nhan_vien_phong_ban");

    ws["!cols"] = [
      { wch: 25 },
      { wch: 30 },
      { wch: 15 },
      { wch: 25 },
      { wch: 15 },
    ];

    XLSX.writeFile(wb, `Nhan_vien_${deptName.replace(/\s+/g, "_")}.xlsx`);
  };

  const loadDeptUsers = async (deptId) => {
    try {
      const res = await axios.get(`${API_BASE}/${deptId}/users`);
      setSelectedDeptUsers(res.data.users || []);
    } catch (err) {
      setSelectedDeptUsers([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedDeptId) loadDeptUsers(selectedDeptId);
    else setSelectedDeptUsers([]);
  }, [selectedDeptId]);

  const handleAssign = async (userId) => {
    if (!selectedDeptId) {
      setError("Vui lòng chọn phòng ban trước");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/assign`, {
        userId,
        departmentId: selectedDeptId,
      });
      setSuccess("Gán nhân viên thành công!");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Gán thất bại");
    } finally {
      setLoading(false);
    }
  };

  const openRemoveModal = (user) => {
    setUserToRemove(user);
    setShowRemoveModal(true);
  };

  const handleRemoveConfirm = async () => {
    if (!userToRemove) return;

    setLoading(true);
    setShowRemoveModal(false);

    try {
      await axios.post(`${API_BASE}/remove`, { userId: userToRemove._id });
      setSuccess("Đã gỡ nhân viên khỏi phòng ban!");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Gỡ thất bại");
    } finally {
      setLoading(false);
      setUserToRemove(null);
    }
  };

  const filteredUnassigned = unassignedUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Sắp xếp nhân sự vào phòng ban</h2>
        <div>
          <button
            className="btn btn-outline-success me-2"
            onClick={exportUnassignedToExcel}
            disabled={loading || filteredUnassigned.length === 0}
          >
            <i className="bi bi-file-earmark-excel me-1"></i>
            Xuất Excel (chưa phân)
          </button>

          {selectedDeptId && (
            <button
              className="btn btn-outline-primary"
              onClick={exportDeptUsersToExcel}
              disabled={loading || selectedDeptUsers.length === 0}
            >
              <i className="bi bi-file-earmark-excel me-1"></i>
              Xuất Excel (phòng đang chọn)
            </button>
          )}

          <button
            className="btn btn-outline-secondary ms-2"
            onClick={fetchData}
            disabled={loading}
          >
            <i className="bi bi-arrow-repeat me-1"></i> Làm mới
          </button>
        </div>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <div className="row g-4">
        {/* Cột trái: Danh sách phòng ban + số nhân viên */}
        <div className="col-lg-4 col-xl-3">
          <div className="card shadow-sm">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">Danh sách phòng ban</h5>
            </div>
            <div className="list-group list-group-flush">
              {departments.map((dept) => (
                <button
                  key={dept._id}
                  className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                    selectedDeptId === dept._id
                      ? "active bg-primary text-white"
                      : ""
                  }`}
                  onClick={() => setSelectedDeptId(dept._id)}
                >
                  <span>{dept.name}</span>
                  <span className="badge bg-light text-dark rounded-pill">
                    {dept.employeeCount || 0}
                  </span>
                </button>
              ))}
              {departments.length === 0 && (
                <div className="list-group-item text-muted text-center py-4">
                  Chưa có phòng ban nào
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cột phải */}
        <div className="col-lg-8 col-xl-9">
          {/* Nhân viên trong phòng ban */}
          {selectedDeptId && (
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  Nhân viên thuộc phòng:{" "}
                  {departments.find((d) => d._id === selectedDeptId)?.name ||
                    ""}
                </h5>
              </div>
              <div className="card-body p-0">
                {selectedDeptUsers.length === 0 ? (
                  <div className="alert alert-info m-3 text-center">
                    Phòng ban này hiện chưa có nhân viên nào
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Tên nhân viên</th>
                          <th>Email</th>
                          <th>Chức vụ</th>
                          <th className="text-end">Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedDeptUsers.map((user) => (
                          <tr key={user._id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>
                              <span
                                className={`badge ${user.role === "manager" ? "bg-warning text-dark" : "bg-secondary"}`}
                              >
                                {user.role === "manager"
                                  ? "Quản lý"
                                  : "Nhân viên"}
                              </span>
                            </td>
                            <td className="text-end">
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => openRemoveModal(user)}
                              >
                                Gỡ khỏi phòng
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Nhân viên chưa phân */}
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                Nhân viên chưa được phân vào phòng ban (
                {filteredUnassigned.length})
              </h5>
              {loading && <div className="spinner-border spinner-border-sm" />}
            </div>

            <div className="card-body">
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm kiếm theo tên hoặc email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {filteredUnassigned.length === 0 ? (
                <div className="alert alert-info text-center">
                  Không tìm thấy nhân viên nào phù hợp
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Tên nhân viên</th>
                        <th>Email</th>
                        <th>Chức vụ</th>
                        <th className="text-end">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUnassigned.map((user) => (
                        <tr key={user._id}>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>
                            <span
                              className={`badge ${user.role === "manager" ? "bg-warning text-dark" : "bg-secondary"}`}
                            >
                              {user.role === "manager"
                                ? "Quản lý"
                                : "Nhân viên"}
                            </span>
                          </td>
                          <td className="text-end">
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() => handleAssign(user._id)}
                              disabled={loading || !selectedDeptId}
                            >
                              Gán vào phòng đã chọn
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Modal xác nhận gỡ nhân viên */}
      <Modal
        show={showRemoveModal}
        onHide={() => setShowRemoveModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận gỡ nhân viên</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc chắn muốn <strong>gỡ {userToRemove?.name}</strong> ra khỏi
          phòng ban hiện tại không?
          <br />
          <small className="text-muted">
            Nhân viên này sẽ được chuyển về danh sách "chưa phân phòng ban".
          </small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRemoveModal(false)}>
            Hủy
          </Button>
          <Button
            variant="danger"
            onClick={handleRemoveConfirm}
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Xác nhận gỡ"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default AssignPersonnel;
