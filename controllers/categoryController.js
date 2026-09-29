import { AppError } from "../errors/AppError.js";
import { Category } from "../models/Category.js";
import { body, matchedData, validationResult } from "express-validator";

const nameError = "Name is required and max 255 characters";

const validateCategory = [
  body("name").trim().isLength({ min: 1, max: 255 }).withMessage(nameError),
];

export const index = async (_req, res) => {
  const categories = await Category.findAll();
  console.log(categories);
  res.end();
};

export const show = async (req, res) => {
  const id = req.params.id;
  const category = await Category.findById(id);

  if (!category) {
    throw new AppError("No Category with this ID was found", 404);
  }

  console.log(category);
  res.end();
};

export const store = [
  validateCategory,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // console.log(errors.array());
      console.log(errors);
    }

    console.log(matchedData(req));
    const { name } = matchedData(req);

    try {
      const createdCategory = await Category.create(name);
      console.log(createdCategory);
      res.end();
    } catch (err) {
      if (err.code === "23505") {
        console.log({
          errors: [{ path: "name", msg: "A category with this name already exists" }],
        });
        return res.end();
      }
      throw err;
    }
  },
];

export const update = [
  validateCategory,
  async (req, res) => {
    const id = req.params.id;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // console.log(errors.array());
      console.log(errors);
    }

    console.log(matchedData(req));
    const { name } = matchedData(req);

    try {
      const updatedCategory = await Category.update(id, name);

      if (!updatedCategory) {
        throw new AppError("No Category with this ID was found", 404);
      }

      console.log(updatedCategory);
      res.end();
    } catch (err) {
      if (err.code === "23505") {
        console.log({
          errors: [{ path: "name", msg: "A category with this name already exists" }],
        });
        return res.end();
      }
      throw err;
    }
  },
];

export const destroy = async (req, res) => {
  const id = req.params.id;
  const deletedCategory = await Category.delete(id);

  if (!deletedCategory) {
    throw new AppError("No Category with this ID was found", 404);
  }

  console.log(deletedCategory);
  res.end();
};
