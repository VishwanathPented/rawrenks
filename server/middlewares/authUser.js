import jwt from "jsonwebtoken";

export default function authUser(req, res, next) {
  let token = req.cookies?.token;
  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.slice(7);
  }
  if (!token) return res.status(401).json({ success: false, message: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.id) return res.status(401).json({ success: false, message: "Invalid token" });
    req.userId = decoded.id;
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: "Token expired or invalid" });
  }
}
