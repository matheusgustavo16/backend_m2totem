import { Request, Response } from "express";
import { users } from "../models/user.model";
import "dotenv/config";
import pool from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import emailjs from "@emailjs/nodejs";
import { JWT_SECRET } from "../config";
dayjs.locale("pt-br");

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, cellphone, password } = req.body;

    const selectQuery = `SELECT * FROM users WHERE email = '${email}'`;
    const existingUser = await pool.query(selectQuery);

    if (existingUser.rowCount >= 1) {
      return res
        .status(400)
        .json({ error: "O e-mail informado já está cadastrado." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertQuery = `
      INSERT INTO users (name, email, cellphone, password, provider, confirmed, blocked, createdat, updatedat)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;

    const values = [
      name,
      email,
      cellphone,
      hashedPassword,
      "local",
      1,
      0,
      dayjs().locale("pt-br").format("YYYY-MM-DD HH:mm:ss"),
      dayjs().locale("pt-br").format("YYYY-MM-DD HH:mm:ss")
    ];

    const result = await pool.query(insertQuery, values);
    const lastId = result.rows[0].id;

    const token = jwt.sign({ email, id: lastId }, JWT_SECRET, {
      expiresIn: "1h"
    });

    return res.status(201).json({ token });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Erro ao criar o usuário, tente novamente mais tarde." });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const selectQuery = `SELECT * FROM users WHERE email = '${email}'`;
    const existingUser = await pool.query(selectQuery);

    if (existingUser.rowCount === 0) {
      return res
        .status(401)
        .json({ error: "O e-mail informado não está cadastrado" });
    }

    const user = existingUser.rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res
        .status(401)
        .json({ error: "A senha informada está incorreta." });
    }

    const token = jwt.sign({ email, id: user.id }, JWT_SECRET, {
      expiresIn: "1h"
    });
    return res.status(200).json({ token, id: user.id });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Erro ao fazer login, tente novamente mais tarde." });
  }
};

export const mailForgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const selectQuery = `SELECT * FROM users WHERE email = '${email}'`;
    const existingUser = await pool.query(selectQuery);

    if (existingUser.rowCount === 0) {
      return res.status(401).json({ error: "E-mail não cadastrado" });
    }

    const user = existingUser.rows[0];

    // verify reset_password in last 15 minutes
    const selectQueryLastReset = await pool.query(
      `SELECT*FROM reset_password WHERE id_user = $1 ORDER BY id DESC LIMIT 1`,
      [user.id]
    );
    if (selectQueryLastReset.rowCount >= 1) {
      const dataCompare = dayjs().unix();
      const dataLastReset = dayjs(selectQueryLastReset.rows[0].expireat).unix();

      if (dataCompare <= dataLastReset) {
        return res.status(401).json({
          error: "Você já solicitou a redefinição de senha recentemente."
        });
      }
    }

    // generate reset_password

    const randomToken = crypto.randomUUID();
    const expire = dayjs().add(15, "minutes").format("YYYY-MM-DDTHH:mm:ssZ");

    const insertQuery = `INSERT INTO reset_password (id_user, createdat, expireat, token) VALUES ($1, $2, $3, $4)`;
    await pool.query(insertQuery, [user.id, new Date(), expire, randomToken]);

    /* emailjs
      .send(
        "noreply_ebookify",
        "forgot-password",
        {
          name: user.name,
          email: email,
          link_reset_password: `https://ebookify.io/auth/reset-password/${randomToken}`
        },
        {
          publicKey: "lUmZvwbo3Of4mENW7",
          privateKey: "WADO52dPbBzaWodc1pGy7"
        }
      )
      .then(
        response => {
          console.log("E-mail enviado!", response.status, response.text);
        },
        err => {
          console.log("E-mail falhou...", err);
          return res.status(500).json({
            error: "O servidor falhou ao enviar e-mail de redefinição"
          });
        }
      ); */

    return res.status(200).json({ token: randomToken, name: user.name, email });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ error: "Erro ao fazer login" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { password, token: _token } = req.body;

    const selectQuery = `SELECT * FROM reset_password WHERE token = '${_token}'`;
    const existingToken = await pool.query(selectQuery);

    if (existingToken.rowCount === 0) {
      return res.status(401).json({ error: "Token informado não existe." });
    }

    const tokenData = existingToken.rows[0];

    // expired or not
    const dataCompare = dayjs().unix();
    const dataLastReset = dayjs(tokenData.expireat).unix();

    if (dataCompare > dataLastReset) {
      return res.status(401).json({
        error: "Token informado não é mais válido."
      });
    }

    // redefinir a senha no banco
    const hashedPassword = await bcrypt.hash(password, 10);
    const updateRes = await pool.query(
      `UPDATE users SET password = $1 WHERE id = $2`,
      [hashedPassword, tokenData.id_user]
    );

    // console.log("updateRes", hashedPassword, tokenData.id_user, updateRes);

    return res
      .status(200)
      .json({ message: "A senha foi atualizada com sucesso, faça login!" });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao fazer login", err: error });
  }
};
