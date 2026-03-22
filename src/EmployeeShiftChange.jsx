import React, { useEffect, useState } from "react";
// Đảm bảo file database.json nằm trong thư mục src
import data from "./database.json"; 

const STORAGE_KEY = "shift_change_requests_v3";

const SHIFT_OPTIONS = [
  { value: "morning", label: "Ca Sáng (08:00 - 16:00)" },
  { value: "evening", label: "Ca Chiều (16:00 - 00:00)" },
  { value: "night", label: "Ca Đêm (00:00 - 08:00)" },
];

function EmployeeShiftChange() {
  const [currentUser, setCurrentUser] = useState(null);
  const [notice, setNotice] = useState("");
  const [requests, setRequests] = useState([]);

  const [form, setForm] = useState({
    from_shift: "",
    to_shift: "",
    date: "",
    reason: "",
  });

  // Tự động nhận diện người dùng từ database
  useEffect(() => {
    const empData = data.employee || data.employees;
    if (empData && empData.length > 0) {
      // Giả lập bạn đang đăng nhập với tư cách là nhân viên đầu tiên trong file JSON
      setCurrentUser(empData[0]); 
    }
  }, []);

  // Load lịch sử từ LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setRequests(JSON.parse(saved)); } catch { setRequests([]); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  }, [requests]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // Nút gửi chỉ sáng khi chọn đủ ca (khác nhau), ngày và lý do
  const canSubmit = 
    form.from_shift !== "" && 
    form.to_shift !== "" && 
    form.from_shift !== form.to_shift && 
    form.date !== "" &&
    form.reason.trim() !== "";

  const handleSubmit = (e) => {
    e.preventDefault();
    const newItem = {
      request_id: `SC-${Date.now()}`,
      emp_name: currentUser?.full_name || "N/A",
      from_shift: form.from_shift,
      to_shift: form.to_shift,
      date: form.date,
      reason: form.reason.trim(),
      status: "pending",
      created_at: new Date().toISOString(),
    };

    setRequests([newItem, ...requests]);
    setForm({ from_shift: "", to_shift: "", date: "", reason: "" });
    setNotice("Gửi yêu cầu thành công!");
    setTimeout(() => setNotice(""), 3000);
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm p-4 border-0">
        <h2 className="mb-4 text-primary">Yêu cầu đổi ca làm việc</h2>
        
        {notice && <div className="alert alert-success">{notice}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            {/* HỆ THỐNG TỰ ĐIỀN TÊN - KHÔNG CHO SỬA */}
            <div className="col-md-6">
              <label className="form-label fw-bold">Nhân viên đang đăng nhập</label>
              <input 
                type="text" 
                className="form-control bg-light" 
                value={currentUser ? currentUser.full_name : "Đang tải..."} 
                readOnly 
              />
              <small className="text-muted">Hệ thống tự động nhận diện tài khoản của bạn.</small>
            </div>

            <div className="col-md-3">
              <label className="form-label fw-bold">Ca hiện tại</label>
              <select className="form-select" value={form.from_shift} onChange={handleChange("from_shift")}>
                <option value="">-- Chọn ca --</option>
                {SHIFT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label fw-bold">Ca muốn đổi</label>
              <select className="form-select" value={form.to_shift} onChange={handleChange("to_shift")}>
                <option value="">-- Chọn ca --</option>
                {SHIFT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <div className="col-md-4 mt-3">
              <label className="form-label fw-bold">Ngày áp dụng</label>
              <input type="date" className="form-control" value={form.date} onChange={handleChange("date")} />
            </div>

            <div className="col-md-8 mt-3">
              <label className="form-label fw-bold">Lý do</label>
              <input type="text" className="form-control" placeholder="Nhập lý do đổi ca..." value={form.reason} onChange={handleChange("reason")} />
            </div>
          </div>

          <button className="btn btn-primary w-100 mt-4 py-2" type="submit" disabled={!canSubmit}>
            Gửi yêu cầu
          </button>
        </form>
      </div>

      <div className="card shadow-sm border-0 mt-4 overflow-hidden">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0">Lịch sử yêu cầu của tôi</h5>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Từ ca</th>
                <th>Sang ca</th>
                <th>Ngày</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-4 text-muted">Bạn chưa gửi yêu cầu nào</td></tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.request_id}>
                    <td>{SHIFT_OPTIONS.find(s => s.value === r.from_shift)?.label}</td>
                    <td>{SHIFT_OPTIONS.find(s => s.value === r.to_shift)?.label}</td>
                    <td>{r.date}</td>
                    <td><span className="badge bg-warning text-dark">Đang chờ duyệt</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default EmployeeShiftChange;