import express from "express";
import {
  sellerLogin,
  isSellerAuth,
  sellerLogout,
  getSellerDashboardStats,
} from "../controllers/sellerController.js";
import authSeller from "../middlewares/authSeller.js";

const sellerRouter = express.Router();

sellerRouter.post("/login", sellerLogin);
sellerRouter.get("/is-auth", authSeller, isSellerAuth);
sellerRouter.post("/logout", authSeller, sellerLogout);
sellerRouter.get("/dashboard-stats", authSeller, getSellerDashboardStats);

export default sellerRouter;
