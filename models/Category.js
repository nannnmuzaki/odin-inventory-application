import { pool } from "../db/pool.js";
import { randomUUIDv7 } from "node:crypto";

export const Category = {
  async findAll() {
    const { rows } = await pool.query(
      `SELECT id, name, created_at, updated_at
       FROM categories`,
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT id, name, created_at, updated_at
       FROM categories
       WHERE id = $1`,
      [id],
    );
    return rows[0];
  },

  async create(name) {
    const { rows } = await pool.query(
      `INSERT INTO categories(id, name)
       VALUES($1, $2)
       RETURNING *`,
      [randomUUIDv7(), name],
    );

    return rows[0];
  },

  async update(id, name) {
    const { rows } = await pool.query(
      `UPDATE categories
       SET name = $2, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, name],
    );

    return rows[0];
  },

  async delete(id) {
    const { rows } = await pool.query(
      `DELETE FROM categories
       WHERE id = $1
       RETURNING *`,
      [id],
    );

    return rows[0];
  },
};
