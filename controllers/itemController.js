import { Item } from "../models/Item.js";

export const index = async (_req, res) => {
  const items = Item.findAll();
  console.log(items);
  res.end();
};
