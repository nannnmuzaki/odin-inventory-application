import { Client } from "pg";
import { loadEnvFile } from "node:process";
import { randomUUIDv7 } from "node:crypto";

try {
  loadEnvFile();
} catch (e) {} // oxlint-disable-line

const createTablesSql = `
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY NOT NULL,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY NOT NULL,
  category_id UUID,
  name VARCHAR(255) NOT NULL,
  stock INTEGER NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT NULL,

  CONSTRAINT fk_items_categories
    FOREIGN KEY (category_id)
    REFERENCES categories(id)
    ON DELETE SET NULL
);
`;

// 40 categories -> 2 pages at default limit=32
const CATEGORY_NAMES = [
  "GPU",
  "CPU",
  "RAM",
  "Motherboard",
  "SSD",
  "HDD",
  "PSU",
  "PC Case",
  "CPU Cooler",
  "Monitor",
  "Keyboard",
  "Mouse",
  "Headset",
  "Speakers",
  "Webcam",
  "Microphone",
  "Laptop",
  "Tablet",
  "Smartphone",
  "Router",
  "Network Switch",
  "External SSD",
  "USB Drive",
  "Memory Card",
  "Graphics Tablet",
  "Printer",
  "Scanner",
  "Docking Station",
  "Power Strip",
  "UPS",
  "Office Chair",
  "Desk",
  "Monitor Arm",
  "Thermal Paste",
  "Case Fan",
  "RGB Strip",
  "Capture Card",
  "VR Headset",
  "Game Controller",
  "Mousepad",
];

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

// Hand-written showcase rows (keeps your original flavor + real image rendering)
const SHOWCASE_ITEMS = [
  {
    category: "GPU",
    name: "NVIDIA CESPLENK",
    description: "BEST GPU ON EARTH WORTH HUNNID DOLLARS",
    stock: 4,
    imageUrl: "https://picsum.photos/seed/gpu-cesplenk/600/400",
  },
  {
    category: "CPU",
    name: "AMD FX",
    description: "HOTTEST CPU ON EARTH FR",
    stock: 5,
    imageUrl: "https://picsum.photos/seed/cpu-fx/600/400",
  },
  {
    category: "RAM",
    name: "SAMSUNG",
    description: "RAM FROM YOUR SCHOOL PC",
    stock: 10,
    imageUrl: null, // no-image case
  },
  {
    category: "Monitor",
    name: "LG ULTRAGEAR 27GP950",
    description: "27 inch 4K 144Hz Nano IPS gaming monitor",
    stock: 7,
    imageUrl: "https://picsum.photos/seed/monitor-lg/600/400",
  },
  {
    category: "Keyboard",
    name: "KEYCHRON K8 PRO",
    description: "Hot-swappable wireless mechanical keyboard",
    stock: 15,
    imageUrl: "https://picsum.photos/seed/keyboard-k8/600/400",
  },
  {
    category: "Headset",
    name: "BROKEN IMAGE DEMO",
    description: "This one has a dead image URL to test broken-image rendering",
    stock: 1,
    imageUrl: "https://example.com/does-not-exist-12345.png",
  },
];

function buildClient() {
  if (process.env.DATABASE_URL) {
    return new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }
  return new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB,
  });
}

async function main() {
  console.log("seeding...");
  const client = buildClient();

  await client.connect();

  try {
    await client.query("BEGIN");
    await client.query(createTablesSql);
    // Rerunnable: wipe first so pagination counts stay stable
    await client.query("TRUNCATE TABLE items, categories");

    // Insert categories
    const categoryIds = new Map();
    for (const name of CATEGORY_NAMES) {
      const id = randomUUIDv7();
      await client.query(`INSERT INTO categories (id, name) VALUES ($1, $2)`, [id, name]);
      categoryIds.set(name, id);
    }

    // Insert showcase items
    for (const item of SHOWCASE_ITEMS) {
      await client.query(
        `INSERT INTO items (id, category_id, name, description, stock, image_url)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          randomUUIDv7(),
          categoryIds.get(item.category),
          item.name,
          item.description,
          item.stock,
          item.imageUrl,
        ],
      );
    }

    // Bulk-fill 3 items per category -> ~120 items = 4 pages at limit=32.
    // Every 5th item has NULL image to test the no-image path.
    const suffixes = ["Pro", "Lite", "Ultra"];
    let counter = 0;
    for (const name of CATEGORY_NAMES) {
      for (const suffix of suffixes) {
        counter += 1;
        // Skip duplicates of showcase names already inserted for this category
        const itemName = `${name} ${suffix} ${counter}`;
        const noImage = counter % 5 === 0;
        await client.query(
          `INSERT INTO items (id, category_id, name, description, stock, image_url)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            randomUUIDv7(),
            categoryIds.get(name),
            itemName,
            `${suffix} edition ${name.toLowerCase()} for your setup (demo item #${counter})`,
            counter % 21,
            noImage ? null : `https://picsum.photos/seed/${slug(name)}-${counter}/600/400`,
          ],
        );
      }
    }

    // One uncategorized item to test ON DELETE SET NULL UI
    await client.query(
      `INSERT INTO items (id, category_id, name, description, stock, image_url)
       VALUES ($1, NULL, $2, $3, $4, $5)`,
      [
        randomUUIDv7(),
        "MYSTERY BOX",
        "Item with no category (delete-category demo)",
        3,
        "https://picsum.photos/seed/mystery-box/600/400",
      ],
    );

    await client.query("COMMIT");
    console.log(
      `done: ${CATEGORY_NAMES.length} categories, ~${counter + SHOWCASE_ITEMS.length + 1} items`,
    );
  } catch (error) {
    await client.query("ROLLBACK");
    await client.end();
    throw error;
  } finally {
    await client.end();
  }
}

main();
