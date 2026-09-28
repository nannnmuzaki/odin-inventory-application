import { Router } from "express";
import { index } from "../controllers/itemController.js";

export const itemsRouter = Router();

itemsRouter.get("/", index);
