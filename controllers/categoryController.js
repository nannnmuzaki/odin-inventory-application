import { NotFoundError } from "../errors/NotFoundError.js";
import { Category } from "../models/Category.js";
import { body, matchedData, validationResult } from "express-validator";

const nameError = "Name is required and max 255 characters";

const validateCategory = [body("name").isLength({ min: 1, max: 255 }).withMessage(nameError)];

export const index = async (_req, res) => {
  const categories = await Category.findAll();
  console.log(categories);
  res.end();
};

export const show = async (req, res) => {
  const id = req.params.id;
  const category = await Category.findById(id);

  if (!category) {
    throw new NotFoundError(`No Item with id ${id} was found.`);
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
    const category = await Category.create(name);
    console.log(category);
    res.end();
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
    const updatedCategory = await Category.update(id, name);

    if (!updatedCategory) {
      throw new NotFoundError(`No Item with id ${id} was found.`);
    }

    console.log(updatedCategory);
    res.end();
  },
];

export const destroy = async (req, res) => {
  const id = req.params.id;
  const deletedCategory = await Category.delete(id);

  if (!deletedCategory) {
    throw new NotFoundError(`No Item with id ${id} was found.`);
  }

  console.log(deletedCategory);
  res.end();
};
