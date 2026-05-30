import express from "express";
import authUser from "../middlewares/authUser.js";
import { getCart, updateCart, clearCart } from "../controllers/cartController.js";

const cartRouter = express.Router();

cartRouter.get("/", authUser, getCart);
cartRouter.post("/update", authUser, updateCart);
cartRouter.post("/clear", authUser, clearCart);

export default cartRouter;
