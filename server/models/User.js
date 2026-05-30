import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    name: { type: String, default: "" },
    password: { type: String },
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },

    otpHash: String,
    otpExpire: Date,
    otpAttempts: { type: Number, default: 0 },

    // Cart key format: "productId|size|color" → quantity
    cartItems: { type: Map, of: Number, default: {} },

    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "product" }],
  },
  { minimize: false, timestamps: true }
);

export default mongoose.models.user || mongoose.model("user", userSchema);
