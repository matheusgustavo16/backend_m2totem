import express from "express";
import userRoutes from "./user.routes";
import authRoutes from "./auth.routes";
import photoRoutes from "./photo.routes";
import statsRoutes from "./stats.routes";

const router = express.Router();

router.use("/api/auth", authRoutes);
router.use("/api/users", userRoutes);
router.use("/api/photo", photoRoutes);
router.use("/api/stats", statsRoutes);

export default router;
