import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";

const API_BASE = "http://localhost:5000/api/departments";

function AssignPersonnel() {
  const [departments, setDepartments] = useState([]);
  const [unassignedUsers, setUnassignedUsers] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [selectedDeptUsers, setSelectedDeptUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal xóa
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [userToRemove, setUserToRemove] = useState(null);

  // Modal chi tiết nhân viên
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Bulk transfer
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkTargetDeptId, setBulkTargetDeptId] = useState("");

  // Tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE);
      setDepartments(res.data.departments || []);
      setUnassignedUsers(res.data.unassignedUsers || []);

      if (selectedDeptId) await loadDeptUsers(selectedDeptId);
    } catch (err) {
      toast.error("Không kết nối được backend");
    } finally {
      setLoading(false);
    }
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

  // Gán 1 người
  const handleAssign = async (userId) => {
    if (!selectedDeptId) {
      toast.warning("Vui lòng chọn phòng ban trước");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/assign`, {
        userId,
        departmentId: selectedDeptId,
      });
      toast.success("Gán nhân viên thành công!");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gán thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Gỡ 1 người (modal)
  const openRemoveModal = (user) => {
    setUserToRemove(user);
    setShowRemoveModal(true);
  };

  const handleRemoveConfirm = async () => {
    setLoading(true);
    setShowRemoveModal(false);
    try {
      await axios.post(`${API_BASE}/remove`, { userId: userToRemove._id });
      toast.success("Đã gỡ nhân viên khỏi phòng ban!");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gỡ thất bại");
    } finally {
      setLoading(false);
      setUserToRemove(null);
    }
  };

  // Mở modal chi tiết
  const openDetailModal = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  // Bulk select
  const toggleSelectUser = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  // Mở modal bulk transfer
  const openBulkModal = () => {
    if (selectedUserIds.length === 0) {
      toast.warning("Vui lòng chọn ít nhất 1 nhân viên");
      return;
    }
    setBulkTargetDeptId("");
    setShowBulkModal(true);
  };

  // Thực hiện bulk transfer
  const handleBulkAssign = async () => {
    if (!bulkTargetDeptId) {
      toast.warning("Vui lòng chọn phòng ban đích");
      return;
    }

    setLoading(true);
    setShowBulkModal(false);
    try {
      await axios.post(`${API_BASE}/bulk-assign`, {
        userIds: selectedUserIds,
        departmentId: bulkTargetDeptId,
      });
      toast.success(`Đã gán ${selectedUserIds.length} nhân viên thành công!`);
      setSelectedUserIds([]);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gán hàng loạt thất bại");
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

  const filteredUnassigned = unassignedUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />

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
              className="btn btn-outline-primary me-2"
              onClick={exportDeptUsersToExcel}
              disabled={loading || selectedDeptUsers.length === 0}
            >
              <i className="bi bi-file-earmark-excel me-1"></i>
              Xuất Excel (phòng đang chọn)
            </button>
          )}

          {selectedUserIds.length > 0 && (
            <button
              className="btn btn-outline-warning me-2"
              onClick={openBulkModal}
            >
              <i className="bi bi-people-fill me-1"></i>
              Gán {selectedUserIds.length} người đã chọn
            </button>
          )}

          <button
            className="btn btn-outline-secondary"
            onClick={fetchData}
            disabled={loading}
          >
            <i className="bi bi-arrow-repeat me-1"></i> Làm mới
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* Cột trái: Phòng ban */}
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
          {/* Nhân viên trong phòng */}
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
                            <td
                              style={{ cursor: "pointer", color: "#0d6efd" }}
                              onClick={() => openDetailModal(user)}
                            >
                              {user.name}
                            </td>
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

          {/* Nhân viên chưa phân + checkbox */}
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
                  Không tìm thấy nhân viên nào
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>
                          <input type="checkbox" disabled />
                        </th>
                        <th>Tên nhân viên</th>
                        <th>Email</th>
                        <th>Chức vụ</th>
                        <th className="text-end">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUnassigned.map((user) => (
                        <tr key={user._id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedUserIds.includes(user._id)}
                              onChange={() => toggleSelectUser(user._id)}
                            />
                          </td>
                          <td
                            style={{ cursor: "pointer", color: "#0d6efd" }}
                            onClick={() => openDetailModal(user)}
                          >
                            {user.name}
                          </td>
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

      {/* Modal chi tiết nhân viên */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Thông tin chi tiết nhân viên</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <>
              <p>
                <strong>Tên:</strong> {selectedUser.name}
              </p>
              <p>
                <strong>Email:</strong> {selectedUser.email}
              </p>
              <p>
                <strong>Chức vụ:</strong>{" "}
                {selectedUser.role === "manager" ? "Quản lý" : "Nhân viên"}
              </p>
              <p>
                <strong>Phòng ban hiện tại:</strong>{" "}
                {selectedUser?.department?.name ? (
                  <span className="text-success fw-medium">
                    {selectedUser.department.name}
                  </span>
                ) : (
                  <span className="text-warning fw-bold">
                    <i className=""></i>
                    Chưa được phân vào phòng ban nào
                  </span>
                )}
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal bulk transfer */}
      <Modal
        show={showBulkModal}
        onHide={() => setShowBulkModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Gán hàng loạt {selectedUserIds.length} nhân viên
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Chọn phòng ban đích:</Form.Label>
            <Form.Select
              value={bulkTargetDeptId}
              onChange={(e) => setBulkTargetDeptId(e.target.value)}
            >
              <option value="">-- Chọn phòng ban --</option>
              {departments
                .filter((d) => d.status === "active")
                .map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name} ({dept.employeeCount || 0} người)
                  </option>
                ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBulkModal(false)}>
            Hủy
          </Button>
          <Button
            variant="success"
            onClick={handleBulkAssign}
            disabled={loading || !bulkTargetDeptId}
          >
            {loading ? "Đang gán..." : "Gán hàng loạt"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal gỡ nhân viên */}
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
