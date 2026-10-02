import { Router } from "express";
import { index, show, store, update, destroy } from "../controllers/categoryController.js";

export const categoriesRouter = Router();

categoriesRouter.get("/", index);
// categoriesRouter.get("/create", create);
categoriesRouter.post("/create", store);
categoriesRouter.get("/:id", show);
// categoriesRouter.get("/:id/edit", edit);
categoriesRouter.post("/:id/edit", update);
categoriesRouter.post("/:id/delete", destroy);
