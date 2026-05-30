import { stub } from "./_stub.js";

// Phase 2 — Auth
export const registerUser = stub("registerUser", 2);
export const verifyEmail = stub("verifyEmail", 2);
export const loginUser = stub("loginUser", 2);
export const forgotPassword = stub("forgotPassword", 2);
export const verifyResetOtp = stub("verifyResetOtp", 2);
export const resetPassword = stub("resetPassword", 2);
export const isAuth = stub("isAuth", 2);
export const logout = stub("logout", 2);
