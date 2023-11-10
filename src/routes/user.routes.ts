import express from "express";
import {
  index,
  update,
  changeConfirm,
  verifyNick
} from "../controllers/user.controller";
import verifyToken from "../middleware/verifyToken.middleware";

const router = express.Router();

router.get("/", verifyToken, index);
router.put("/", verifyToken, update);
router.put("/:id", verifyToken, changeConfirm);
router.post("/verifyNick", verifyNick);

export default router;
