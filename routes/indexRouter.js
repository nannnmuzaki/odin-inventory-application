import { Router } from "express";

export const indexRouter = Router();

indexRouter.get("/", (_req, res) => {
  console.log("index get / router");
  res.end();
});
