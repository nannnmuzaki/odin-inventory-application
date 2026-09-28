import { Category } from "../models/Category.js";

export const index = async (_req, res) => {
  const categories = await Category.findAll();
  console.log(categories);
  res.end();
};
