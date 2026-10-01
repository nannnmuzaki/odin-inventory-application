import express from "express";
import path from "node:path";
import { indexRouter } from "./routes/indexRouter.js";
import { loadEnvFile } from "node:process";
import { categoriesRouter } from "./routes/categoriesRouter.js";
import { itemsRouter } from "./routes/itemsRouter.js";
import { globalErrorHandler } from "./middleware/globalErrorHandler.js";

try {
  loadEnvFile();
} catch (e) {} // oxlint-disable-line

const app = express();
const PORT = process.env.APP_PORT;

app.set("views", path.join(import.meta.dirname, "views"));
app.set("view engine", "ejs");

const assetsPath = path.join(import.meta.dirname, "public");
app.use(
  express.static(
    assetsPath,
    process.env.NODE_ENV === "production" ? { maxAge: "1d" } : { maxAge: 0 },
  ),
);

app.use(express.urlencoded({ extended: true }));

app.use("/", indexRouter);
app.use("/categories", categoriesRouter);
app.use("/items", itemsRouter);

app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Listening at localhost:${PORT}`);
});
