import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    author: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    text: { type: String, required: true },
    approved: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: "date", updatedAt: false } }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["Men", "Women", "Accessories"],
    },
    description: { type: String, default: "" },

    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, default: 0, min: 0 }, // 0 = no discount

    sizes: { type: [String], default: [] },
    colors: { type: [String], default: [] },

    // Cloudinary URLs
    images: { type: [String], default: [] },

    // Stock matrix: key = "size|color" → qty
    stock: { type: Map, of: Number, default: {} },

    tag: { type: String, default: "" }, // "Summer Collection", "Best Sellers", etc.

    reviews: [reviewSchema],

    views: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },
  },
  { minimize: false, timestamps: true }
);

productSchema.index({ name: "text", brand: "text", description: "text" });

export default mongoose.models.product || mongoose.model("product", productSchema);
