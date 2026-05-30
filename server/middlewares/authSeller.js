import jwt from "jsonwebtoken";

export default function authSeller(req, res, next) {
  const token = req.cookies?.sellerToken;
  if (!token) return res.status(401).json({ success: false, message: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.email !== process.env.SELLER_EMAIL) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: "Token expired or invalid" });
  }
}
