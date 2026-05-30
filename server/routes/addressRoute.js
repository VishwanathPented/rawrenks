import express from "express";
import authUser from "../middlewares/authUser.js";
import {
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
} from "../controllers/addressController.js";

const addressRouter = express.Router();

addressRouter.get("/", authUser, getAddresses);
addressRouter.post("/add", authUser, addAddress);
addressRouter.put("/:id", authUser, updateAddress);
addressRouter.delete("/:id", authUser, deleteAddress);

export default addressRouter;
