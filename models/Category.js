import { pool } from "../db/pool.js";
import { randomUUIDv7 } from "node:crypto";

export const Category = {
  async findAll(page = 1, limit = 32) {
    const offset = (page - 1) * limit;

    const { rows } = await pool.query(
      `SELECT id, name, created_at, updated_at, COUNT(id) OVER() as total_count
       FROM categories
       ORDER BY id ASC
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    const totalCount = rows.length > 0 ? parseInt(rows[0].total_count, 10) : 0;
    const categories = rows.map(({ total_count, ...category }) => category); // oxlint-disable-line

    return { categories, totalCount };
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
