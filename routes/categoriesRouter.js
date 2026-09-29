import { Router } from "express";
import { index } from "../controllers/categoryController.js";

export const categoriesRouter = Router();

categoriesRouter.get("/", index);
