import { pool } from "../db/pool.js";
import { randomUUIDv7 } from "node:crypto";

export const Item = {
  async findAll() {
    const { rows } = await pool.query(
      `SELECT id, category_id, name, description, image_url, created_at, updated_at
       FROM items`,
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT id, category_id, name, description, image_url, created_at, updated_at
       FROM items
       WHERE id = $1`,
      [id],
    );
    return rows[0];
  },

  async findByCategoryId(id, page, limit) {
    const offset = (page - 1) * limit;

    const { rows } = await pool.query(
      `
      SELECT id, category_id, name, description, image_url, created_at, updated_at,
      COUNT(id) OVER() as total_count
      FROM items
      WHERE category_id = $1
      ORDER BY id ASC
      LIMIT $2 OFFSET $3
      `,
      [id, limit, offset],
    );

    const totalCount = rows.length > 0 ? parseInt(rows[0].total_count, 10) : 0;
    const items = rows.map(({ total_count, ...item }) => item); // oxlint-disable-line

    return { totalCount, items };
  },

  async create(categoryId, name, description, imageUrl = null) {
    const { rows } = await pool.query(
      `INSERT INTO items(id, category_id, name, description, image_url)
       VALUES($1, $2, $3, $4)
       RETURNING *`,
      [randomUUIDv7(), categoryId, name, description, imageUrl],
    );

    return rows[0];
  },

  async update(id, categoryId, name, description, imageUrl = null) {
    const { rows } = await pool.query(
      `UPDATE items
       SET category_id = $2, name = $3, description = $4, image_url = $5, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, categoryId, name, description, imageUrl],
    );

    return rows[0];
  },

  async delete(id) {
    const { rows } = await pool.query(
      `DELETE FROM items
       WHERE id = $1
       RETURNING *`,
      [id],
    );

    return rows[0];
  },
};
