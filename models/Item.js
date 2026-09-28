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

  async create(categoryId, name, description, imageUrl) {
    try {
      const { rows } = await pool.query(
        `INSERT INTO items(id, category_id, name, description, image_url)
       VALUES($1, $2, $3, $4)
       RETURNING *`,
        [randomUUIDv7(), categoryId, name, description, imageUrl],
      );

      return rows[0];
    } catch (error) {
      if (error.code === 23503) {
        throw new NotFoundError(`No Category with id ${categoryId} was found.`);
      }

      throw error;
    }
  },

  async update(id, categoryId, name, description, imageUrl) {
    try {
      const { rows, rowCount } = await pool.query(
        `UPDATE items
       SET category_id = $2, name = $3, description = $4, image_url = $5, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
        [id, categoryId, name, description, imageUrl],
      );

      if (rowCount === 0) {
        throw new NotFoundError(`No Item with id ${id} was found.`);
      }

      return rows[0];
    } catch (error) {
      if (error.code === 23503) {
        throw new NotFoundError(`No Category with id ${categoryId} was found.`);
      }

      throw error;
    }
  },

  async delete(id) {
    const { rows, rowCount } = await pool.query(
      `DELETE FROM items
       WHERE id = $1
       RETURNING *`,
      [id],
    );

    if (rowCount === 0) {
      throw new NotFoundError(`No Item with id ${id} was found.`);
    }

    return rows[0];
  },
};
