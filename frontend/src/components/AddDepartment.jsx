// src/components/AddDepartment.jsx
import React, { useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000/api/departments";

function AddDepartment() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await axios.post(`${API_BASE}/create`, { name: name.trim() });
      setMessage({ type: "success", text: "Tạo phòng ban thành công!" });
      setName("");
    } catch (err) {
      setMessage({
        type: "danger",
        text: err.response?.data?.message || "Tạo thất bại",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="mb-4">Thêm phòng ban mới</h2>

      {message.text && (
        <div
          className={`alert alert-${message.type} alert-dismissible fade show`}
        >
          {message.text}
          <button
            type="button"
            className="btn-close"
            onClick={() => setMessage({ type: "", text: "" })}
          ></button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Tên phòng ban (ví dụ: Phòng Marketing)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading || !name.trim()}
          >
            {loading ? "Đang tạo..." : "Tạo phòng ban"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddDepartment;
