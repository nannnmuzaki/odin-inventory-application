import { Router } from "express";
import { Item } from "../models/Item.js";

export const itemsRouter = Router();

itemsRouter.get("/", async (_req, res) => {
  console.log(await Item.findAll());
  res.end();
});
