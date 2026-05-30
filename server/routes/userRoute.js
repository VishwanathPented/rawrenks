import express from "express";
import {
  registerUser,
  verifyEmail,
  loginUser,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  isAuth,
  logout,
} from "../controllers/userController.js";
import authUser from "../middlewares/authUser.js";
import { authLimiter, verificationLimiter } from "../middlewares/rateLimiter.js";

const userRouter = express.Router();

userRouter.post("/register", authLimiter, registerUser);
userRouter.post("/verify-email", verificationLimiter, verifyEmail);
userRouter.post("/login", authLimiter, loginUser);

userRouter.post("/forgot-password", authLimiter, forgotPassword);
userRouter.post("/verify-reset-otp", verificationLimiter, verifyResetOtp);
userRouter.post("/reset-password", authLimiter, resetPassword);

userRouter.get("/is-auth", authUser, isAuth);
userRouter.post("/logout", logout);

export default userRouter;
