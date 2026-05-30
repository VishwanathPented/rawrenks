import express from "express";
import { upload } from "../configs/multer.js";
import authSeller from "../middlewares/authSeller.js";
import {
  addProduct,
  updateProduct,
  productList,
  productById,
  changeStock,
  deleteProduct,
  addReview,
} from "../controllers/productController.js";

const productRouter = express.Router();

productRouter.get("/list", productList);
productRouter.get("/:id", productById);
productRouter.post("/:id/review", addReview);

productRouter.post("/add", authSeller, upload.array("images", 8), addProduct);
productRouter.post("/update", authSeller, upload.array("images", 8), updateProduct);
productRouter.post("/stock", authSeller, changeStock);
productRouter.post("/delete", authSeller, deleteProduct);

export default productRouter;
