import { Request, Response } from "express";
import { Rembg } from "rembg-node";
import sharp from "sharp";
import fs from "fs";
import dayjs from "dayjs";

export const statsDashboard = async (req: Request, res: Response) => {
  try {
    const { imageSrc, bgSrc } = req.body;
    // SAVE TEMPORARY BACKGROUND PICTURE
    return res.status(201).json({});
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Erro ao remover o background da imagem." });
  }
};
