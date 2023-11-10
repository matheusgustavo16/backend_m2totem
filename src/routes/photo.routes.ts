import express from "express";
import { generateQrCode, removeBg } from "../controllers/photo.controller";

const router = express.Router();

router.post("/removeBg", removeBg);
router.post("/generateQr", generateQrCode);

export default router;
