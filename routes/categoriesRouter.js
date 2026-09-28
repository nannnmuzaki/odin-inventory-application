import { Router } from "express";
import { Category } from "../models/Category.js";

export const categoriesRouter = Router();

categoriesRouter.get("/", async (_req, res) => {
  console.log(await Category.findAll());
  res.end();
});
