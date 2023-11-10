import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

export default function verifyToken(
  req: any,
  res: Response,
  next: NextFunction
) {
  const token = req.headers["authorization"];
  const formatToken = token ? token.split(" ")[1] : ``;
  jwt.verify(formatToken.trim(), JWT_SECRET, (err: any, decoded: any) => {
    if (err) return res.sendStatus(401);
    req.userMail = decoded.email;
    req.userId = decoded.id;
    next();
  });
}
