import { AppError } from "../errors/AppError.js";
import { Item } from "../models/Item.js";
import { body, matchedData, validationResult } from "express-validator";

const nameError = "Name is required and max 255 characters";
const categoryIdError = "Invalid category ID format";
const descriptionError = "Description is required and max 1000 characters";
const imageUrlError = "Image URL is optional and need to be a valid URL of an image";

const validateItem = [
  body("name").trim().isLength({ min: 1, max: 255 }).withMessage(nameError),
  body("categoryId").trim().isUUID(7).withMessage(categoryIdError),
  body("description").trim().isLength({ min: 1, max: 1000 }).withMessage(descriptionError),
  body("imageUrl").trim(),
  body("imageUrl").optional({ values: "falsy" }).isURL().withMessage(imageUrlError),
];

export const index = async (_req, res) => {
  const items = await Item.findAll();
  console.log(items);
  res.end();
};

export const show = async (req, res) => {
  const id = req.params.id;
  const item = await Item.findById(id);

  if (!item) {
    throw new AppError("No Item with this ID was found", 404);
  }

  console.log(item);
  res.end();
};

export const store = [
  validateItem,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors);
      return res.status(400).end();
    }

    const { categoryId, name, description, imageUrl } = matchedData(req);
    const createdItem = await Item.create(categoryId, name, description, imageUrl);
    console.log(createdItem);
    res.end();
  },
];

export const update = [
  validateItem,
  async (req, res) => {
    const id = req.params.id;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors);
      return res.status(400).end();
    }

    const { categoryId, name, description, imageUrl } = matchedData(req);
    const updatedItem = await Item.update(id, categoryId, name, description, imageUrl);

    if (!updatedItem) {
      throw new AppError("No Item with this ID was found", 404);
    }

    console.log(updatedItem);
    res.end();
  },
];

export const destroy = async (req, res) => {
  const id = req.params.id;
  const deletedItem = await Item.delete(id);

  if (!deletedItem) {
    throw new AppError("No Item with this ID was found", 404);
  }

  console.log(deletedItem);
  res.end();
};
