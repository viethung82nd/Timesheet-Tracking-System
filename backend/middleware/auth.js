const jwt = require("jsonwebtoken");

const auth =
  (roles = []) =>
  async (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ msg: "Không có token" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ msg: "Không có quyền truy cập" });
      }
      next();
    } catch (err) {
      res.status(401).json({ msg: "Token không hợp lệ" });
    }
  };

module.exports = { auth };
