import { Request, Response } from "express";
import { Rembg } from "rembg-node";
import sharp from "sharp";
import fs from "fs";
import dayjs from "dayjs";
import axios from "axios";
import os from "os";

const TMP_FOLDER = os.tmpdir() || "/tmp/";

const download_image = (url: string, image_path: string) =>
  axios({
    url,
    responseType: "stream"
  }).then(
    response =>
      new Promise((resolve, reject) => {
        response.data
          .pipe(fs.createWriteStream(image_path))
          .on("finish", () => resolve(null))
          .on("error", (e: any) => reject(e));
      })
  );

const convertImageToBase64URL = (filename: string, imageType = "jpg") => {
  try {
    const buffer = fs.readFileSync(filename);
    const base64String = Buffer.from(buffer).toString("base64");
    return `data:image/${imageType};base64,${base64String}`;
  } catch (error) {
    throw new Error(`file ${filename} no exist ❌`);
  }
};

const compositeImages = async (image: string, template: string) => {
  try {
    await sharp(`${TMP_FOLDER}/${template}`)
      .resize({
        width: 800,
        height: 600
      })
      .composite([
        {
          input: `${TMP_FOLDER}/${image}-output.png`,
          top: 0,
          left: 0
        }
      ])
      .resize({
        width: 800,
        height: 600
      })
      .normalise()
      .toFile(`${TMP_FOLDER}/${image}-output-template.jpg`);
  } catch (error) {
    console.log(error);
  }
};

export const removeBg = async (req: Request, res: Response) => {
  try {
    const { imageSrc, bgSrc, phraseSrc } = req.body;
    // SAVE TEMPORARY BACKGROUND PICTURE
    const fileNameTemplate: any = `temp-${dayjs().unix()}.jpg`;
    await download_image(bgSrc, `${TMP_FOLDER}/${fileNameTemplate}`);
    // SAVE TEMPORARY CLIENT PICTURE
    let base64Image = imageSrc.split(";base64,").pop();
    const fileName: any = dayjs().unix();
    await fs.writeFile(
      `${TMP_FOLDER}/${fileName}.jpg`,
      base64Image,
      { encoding: "base64" },
      function(err) {
        console.log("File created");
      }
    );
    const input = sharp(`${TMP_FOLDER}/${fileName}.jpg`);
    const remBg = new Rembg({
      logging: true
    });
    const output = await remBg.remove(input);
    await output.png().toFile(`${TMP_FOLDER}/${fileName}-output.png`);
    // APLICA O TEMPLATE
    await compositeImages(fileName, fileNameTemplate);

    const base64Photo = convertImageToBase64URL(
      `${TMP_FOLDER}/${fileName}-output-template.jpg`
    );
    if (base64Photo) {
      fs.unlink(`${TMP_FOLDER}/${fileName}.jpg`, error => {
        if (error) {
          console.log("UnlinkError", error);
        }
      });
      fs.unlink(`${TMP_FOLDER}/${fileName}-output.png`, error => {
        if (error) {
          console.log("UnlinkError", error);
        }
      });
      fs.unlink(`${TMP_FOLDER}/${fileName}-output-template.jpg`, error => {
        if (error) {
          console.log("UnlinkError", error);
        }
      });
      fs.unlink(`${TMP_FOLDER}/${fileNameTemplate}`, error => {
        if (error) {
          console.log("UnlinkError", error);
        }
      });
    }
    return res.status(201).json({ photo: base64Photo });
  } catch (error) {
    console.log("ERRROUYUUU", error);
    return res
      .status(500)
      .json({ error: "Erro ao remover o background da imagem." });
  }
};

export const generateQrCode = async (req: Request, res: Response) => {
  try {
    return res.status(201).json({});
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Erro ao criar o usuário, tente novamente mais tarde." });
  }
};
