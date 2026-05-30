import { stub } from "./_stub.js";
import Product from "../models/Product.js";

// Phase 3 — Products
export const addProduct = stub("addProduct", 3);
export const updateProduct = stub("updateProduct", 3);
export const changeStock = stub("changeStock", 3);
export const deleteProduct = stub("deleteProduct", 3);
export const addReview = stub("addReview", 3);

// Read-only routes work as soon as DB is reachable + seeded.
export const productList = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const productById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, product });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
