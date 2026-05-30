import { stub } from "./_stub.js";

// Phase 2 — Seller auth
export const sellerLogin = stub("sellerLogin", 2);
export const isSellerAuth = stub("isSellerAuth", 2);
export const sellerLogout = stub("sellerLogout", 2);

// Phase 6 — Dashboard
export const getSellerDashboardStats = stub("getSellerDashboardStats", 6);
