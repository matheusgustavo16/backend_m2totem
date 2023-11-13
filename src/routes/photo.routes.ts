import express from "express";
import {
  applyPhraseToPicture,
  generateQrCode,
  removeBg
} from "../controllers/photo.controller";

const router = express.Router();

router.post("/removeBg", removeBg);
router.post("/applyPhrase", applyPhraseToPicture);
router.post("/generateQr", generateQrCode);

export default router;
