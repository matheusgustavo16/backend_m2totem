import express from "express";
import { statsDashboard } from "../controllers/stats.controller";

const router = express.Router();

router.get("/dashboard", statsDashboard);

export default router;
