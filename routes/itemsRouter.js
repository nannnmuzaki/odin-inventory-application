import { Router } from "express";
import { index, show, store, update, destroy } from "../controllers/itemController.js";

export const itemsRouter = Router();

itemsRouter.get("/", index);
// itemsRouter.get("/create", create);
itemsRouter.post("/create", store);
itemsRouter.get("/:id", show);
// itemsRouter.get("/:id/edit", edit);
itemsRouter.post("/:id/edit", update);
itemsRouter.post("/:id/delete", destroy);
