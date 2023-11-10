import { Request, Response } from "express";
import pool from "../db";
import dayjs from "dayjs";

export const index = async (req: any, res: Response) => {
  try {
    const id_user = req.userId;

    const queryUser =
      "SELECT id, name, email, provider, confirmed, blocked, createdat, updatedat FROM users WHERE id = $1";
    const resultUser = await pool.query(queryUser, [id_user]);

    /*const queryPayment = 'SELECT * FROM payments WHERE id_user = $1 ORDER BY id DESC LIMIT 1'
    const resultPayment = await pool.query(queryPayment, [id_user]);*/

    const userPayload = {
      ...resultUser.rows[0]
      // plan: resultPayment.rowCount >= 1 ? resultPayment.rows[0].plan : 'free'
    };

    return res.status(200).json(userPayload);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Erro ao buscar usuário" });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, username } = req.body;

    const resultCheckUsername = await pool.query(
      `SELECT * FROM users WHERE username = $1`,
      [username]
    );

    if (resultCheckUsername.rowCount >= 1) {
      return res.status(401).json({ error: "Nickname não disponível" });
    }

    const query = `
      UPDATE users
      SET name = $1, email = $2, username = $3, updatedat = $4
      WHERE id = $5
      RETURNING *;
    `;

    const values = [
      name,
      email,
      username,
      dayjs().locale("pt-br").format(),
      id
    ];

    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ error: "Erro ao atualizar o usuário" });
  }
};

export const changeConfirm = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { confirmed } = req.body;

    const query = `
      UPDATE users
      SET confirmed = $1, updatedat = $2
      WHERE id = $3
      RETURNING *;
    `;

    const values = [confirmed, new Date(), id];

    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ error: "Erro ao atualizar o usuário" });
  }
};

export const verifyNick = async (req: Request, res: Response) => {
  try {
    const { nickname } = req.body;

    const result = await pool.query(`SELECT*FROM users WHERE username = $1`, [
      nickname
    ]);

    if (result.rowCount >= 1) {
      return res.status(401).json({ error: "Nickname não disponível" });
    }

    return res.status(200).json({ message: "Nickname disponível" });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ error: "Erro ao atualizar o usuário" });
  }
};
