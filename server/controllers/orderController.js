import { stub } from "./_stub.js";

// Phase 4 — COD checkout
export const placeOrderCOD = stub("placeOrderCOD", 4);
export const getUserOrders = stub("getUserOrders", 4);
export const getAllOrders = stub("getAllOrders", 4);
export const updateOrderStatus = stub("updateOrderStatus", 4);

// Phase 5 — Razorpay
export const createRazorpayOrder = stub("createRazorpayOrder", 5);
export const verifyRazorpayPayment = stub("verifyRazorpayPayment", 5);
