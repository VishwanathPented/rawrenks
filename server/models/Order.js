import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
    name: String,
    image: String,
    price: { type: Number, required: true }, // snapshot at time of order
    quantity: { type: Number, required: true, min: 1 },
    size: { type: String, default: "" },
    color: { type: String, default: "" },
  },
  { _id: false }
);

const historySchema = new mongoose.Schema(
  {
    status: String,
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    items: [orderItemSchema],

    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    amount: { type: Number, required: true }, // grand total

    address: { type: mongoose.Schema.Types.ObjectId, ref: "address", required: true },
    coupon: { type: String, default: "" },

    status: {
      type: String,
      enum: ["Order Placed", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"],
      default: "Order Placed",
    },
    history: [historySchema],

    paymentType: { type: String, enum: ["COD", "ONLINE"], required: true },
    isPaid: { type: Boolean, default: false },
    paymentMethod: String, // "COD" | "Razorpay" | "UPI" etc.

    razorpayOrderId: String,
    payment: Object, // raw razorpay payment payload after verify
  },
  { timestamps: true }
);

export default mongoose.models.order || mongoose.model("order", orderSchema);
