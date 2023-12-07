import { Request, Response } from "express";
import { Rembg } from "rembg-node";
import sharp from "sharp";
import fs from "fs";
import dayjs from "dayjs";
import axios from "axios";
import os from "os";

const TMP_FOLDER = os.tmpdir() ? os.tmpdir() : "src/assets";
// const TMP_FOLDER = "src/assets";

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
    console.log("[BASE64] Imagem convertida em base64.", base64String);
    return `data:image/${imageType};base64,${base64String}`;
  } catch (error) {
    throw new Error(`file ${filename} no exist ❌`);
  }
};

const compositeImages = async (
  image: string,
  template: string,
  dimensions?: any
) => {
  try {
    await sharp(`${TMP_FOLDER}/${template}`)
      .resize({
        width: dimensions.width,
        height: dimensions.height
      })
      .composite([
        {
          input: `${TMP_FOLDER}/${image}-output.png`,
          top: 0,
          left: 0
        }
      ])
      .resize({
        width: dimensions.width,
        height: dimensions.height
      })
      .normalise()
      .toFile(`${TMP_FOLDER}/${image}-output-template.jpg`);
    console.log("[SHARP] Composite images successfully!");
  } catch (error) {
    console.log(error);
  }
};

export const removeBg = async (req: Request, res: Response) => {
  try {
    const { imageSrc, bgSrc, orientation } = req.body;
    const FINAL_DIMENSIONS =
      orientation === "horizontal"
        ? {
            width: 1920,
            height: 1080
          }
        : {
            width: 1080,
            height: 1920
          };
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
    await output
      .resize({
        width: FINAL_DIMENSIONS.width,
        height: FINAL_DIMENSIONS.height,
        kernel: "cubic"
      })
      .png()
      .toFile(`${TMP_FOLDER}/${fileName}-output.png`);
    // APLICA O TEMPLATE
    await compositeImages(fileName, fileNameTemplate, FINAL_DIMENSIONS);

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
      /*fs.unlink(`${TMP_FOLDER}/${fileName}-output-template.jpg`, error => {
        if (error) {
          console.log("UnlinkError", error);
        }
      });*/
      fs.unlink(`${TMP_FOLDER}/${fileNameTemplate}`, error => {
        if (error) {
          console.log("UnlinkError", error);
        }
      });
    }
    console.log("[FIM] Processo finalizado com sucesso!", base64Photo);
    return res.status(201).json({ photo: base64Photo });
  } catch (error) {
    console.log("ERRROUYUUU", error);
    return res
      .status(500)
      .json({ error: "Erro ao remover o background da imagem." });
  }
};

export const applyPhraseToPicture = async (req: Request, res: Response) => {
  try {
    const { imageSrc, phraseSrc, orientation } = req.body;
    const FINAL_DIMENSIONS =
      orientation === "horizontal"
        ? {
            width: 1920,
            height: 1080
          }
        : {
            width: 1080,
            height: 1920
          };
    // SAVE PHRASE TEMP
    const filePhraseName: any = `temp-phrase-${dayjs().unix()}.png`;
    await download_image(phraseSrc, `${TMP_FOLDER}/${filePhraseName}`);
    // SAVE TEMPORARY CLIENT PICTURE
    let base64Image = imageSrc.split(";base64,").pop();
    const fileImageName: any = dayjs().unix();
    await fs.writeFile(
      `${TMP_FOLDER}/${fileImageName}.jpg`,
      base64Image,
      { encoding: "base64" },
      function(err) {
        console.log("File created");
      }
    );
    // SHARP FUNCTIONS
    try {
      // RESIZE PHRASE TO DEFAULT
      await sharp(`${TMP_FOLDER}/${filePhraseName}`)
        .resize({
          width: FINAL_DIMENSIONS.width,
          height: FINAL_DIMENSIONS.height
        })
        .toFile(`${TMP_FOLDER}/resized-${filePhraseName}`);
      // MISTURA AS DUAS
      await sharp(`${TMP_FOLDER}/${fileImageName}.jpg`)
        .resize({
          width: FINAL_DIMENSIONS.width,
          height: FINAL_DIMENSIONS.height
        })
        .composite([
          {
            input: `${TMP_FOLDER}/resized-${filePhraseName}`,
            top: 0,
            left: 0
          }
        ])
        .resize({
          width: FINAL_DIMENSIONS.width,
          height: FINAL_DIMENSIONS.height
        })
        .normalise()
        .toFile(`${TMP_FOLDER}/${fileImageName}-output-phrase.jpg`);
    } catch (error) {
      console.log("sharpError", error);
    }
    // SALVA O BASE 64, EXCLUIR E RETORNA
    const base64Photo = convertImageToBase64URL(
      `${TMP_FOLDER}/${fileImageName}-output-phrase.jpg`
    );
    // JOGA DE RALO AS IMAGENS GERADAS
    if (base64Photo) {
      fs.unlink(`${TMP_FOLDER}/${fileImageName}.jpg`, error => {
        if (error) {
          console.log("UnlinkError", error);
        }
      });
      fs.unlink(`${TMP_FOLDER}/${filePhraseName}`, error => {
        if (error) {
          console.log("UnlinkError", error);
        }
      });
      fs.unlink(`${TMP_FOLDER}/resized-${filePhraseName}`, error => {
        if (error) {
          console.log("UnlinkError", error);
        }
      });
      fs.unlink(`${TMP_FOLDER}/${fileImageName}-output-phrase.jpg`, error => {
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
      .json({ error: "Erro ao aplicar a frase na imagem." });
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
