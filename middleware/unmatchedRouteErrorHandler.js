import { AppError } from "../errors/AppError.js";

export const unmatchedRouteErrorHandler = (_req, _res) => {
  throw new AppError("This page doesn't exists please go back to homepage or other pages", 404);
};
