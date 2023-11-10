import express from "express";
import userRoutes from "./user.routes";
import authRoutes from "./auth.routes";
import photoRoutes from "./photo.routes";

const router = express.Router();

router.use("/api/auth", authRoutes);
router.use("/api/users", userRoutes);
router.use("/api/photo", photoRoutes);

export default router;
