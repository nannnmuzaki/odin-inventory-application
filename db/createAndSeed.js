import { Client } from "pg";
import { loadEnvFile } from "node:process";
import { randomUUIDv7 } from "node:crypto";

try {
  loadEnvFile();
} catch (e) {} // oxlint-disable-line

const createTablesSql = `
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY NOT NULL,
  category_id UUID,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  image_url text DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT NULL,

  CONSTRAINT fk_items_categories
    FOREIGN KEY (category_id)
    REFERENCES categories(id)
    ON DELETE SET NULL
);
`;

const populateCategoriesTableSql = `
  INSERT INTO categories (id, name)
  VALUES
    ('${randomUUIDv7()}', 'GPU'),
    ('${randomUUIDv7()}', 'CPU'),
    ('${randomUUIDv7()}', 'RAM')
  RETURNING id;
`;

async function main() {
  console.log("seeding...");
  const client = new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB,
  });

  await client.connect();

  try {
    await client.query("BEGIN");
    await client.query(createTablesSql);
    const { rows } = await client.query(populateCategoriesTableSql);
    await client.query(
      `
      INSERT INTO items (id, category_id, name, description)
      VALUES
        ('${randomUUIDv7()}', $1, 'NVIDIA CESPLENK', 'BEST GPU ON EARTH WORTH HUNNID DOLLARS'),
        ('${randomUUIDv7()}', $2, 'AMD FX', 'HOTTEST CPU ON EARTH FR'),
        ('${randomUUIDv7()}', $3, 'SAMSUNG', 'RAM FROM YOUR SCHOOL PC');
      `,
      rows.map((row) => row.id),
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    await client.end();
    throw error;
  } finally {
    await client.end();
  }
  console.log("done");
}

main();
