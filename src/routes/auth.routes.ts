import express from "express";
import {
  register,
  login,
  mailForgotPassword,
  resetPassword
} from "../controllers/auth.controller";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", mailForgotPassword);
router.post("/reset-password", resetPassword);

export default router;
