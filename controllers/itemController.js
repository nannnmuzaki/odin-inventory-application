import { AppError } from "../errors/AppError.js";
import { Item } from "../models/Item.js";
import { Category } from "../models/Category.js";
import { body, matchedData, validationResult } from "express-validator";
import { getPaginationRange } from "../utils/getPaginationRange.js";

const nameError = "Name is required and max 255 characters";
const categoryIdError = "Category is required";
const descriptionError = "Description is required and max 1000 characters";
const stockError = "Stock is required and must be an Integer >= 0";
const imageUrlError = "Image URL must be a valid URL";

const validateItem = [
  body("name").trim().isLength({ min: 1, max: 255 }).withMessage(nameError),
  body("categoryId")
    .trim()
    .notEmpty()
    .withMessage(categoryIdError)
    .bail()
    .isUUID(7)
    .withMessage(categoryIdError),
  body("description").trim().isLength({ min: 1, max: 1000 }).withMessage(descriptionError),
  body("stock")
    .trim()
    .notEmpty()
    .withMessage(stockError)
    .bail()
    .toInt()
    .isInt({ min: 0 })
    .withMessage(stockError),
  body("imageUrl").trim(),
  body("imageUrl").optional({ values: "falsy" }).isURL().withMessage(imageUrlError),
];

export const index = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit, 10) || 32);

  const { items, totalCount } = await Item.findAll(page, limit);
  const totalPages = Math.ceil(totalCount / limit) || 1;
  const paginationRange = getPaginationRange(page, totalPages);

  res.render("items/index", {
    items,
    currentPage: page,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    paginationRange,
    basePath: "/items",
  });
};

export const show = async (req, res) => {
  const id = req.params.id;
  const item = await Item.findById(id);

  if (!item) {
    throw new AppError("No Item with this ID was found", 404);
  }

  res.render("items/item", { item });
};

export const create = async (_req, res) => {
  const categories = await Category.findAllOptions();
  res.render("items/create-item", {
    formType: "create",
    item: null,
    categories,
  });
};

export const store = [
  validateItem,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const categories = await Category.findAllOptions();
      return res.status(400).render("items/create-item", {
        formType: "create",
        errors: errors.array(),
        item: req.body,
        categories,
      });
    }

    const { categoryId, name, description, stock, imageUrl } = matchedData(req);
    const createdItem = await Item.create(categoryId, name, description, stock, imageUrl || null);
    res.redirect(`/items/${createdItem.id}`);
  },
];

export const edit = async (req, res) => {
  const id = req.params.id;
  const item = await Item.findById(id);

  if (!item) {
    throw new AppError("No Item with this ID was found", 404);
  }

  const categories = await Category.findAllOptions();
  res.render("items/edit-item", {
    formType: "edit",
    item: {
      id: item.id,
      name: item.name,
      categoryId: item.category_id,
      description: item.description,
      stock: item.stock,
      imageUrl: item.image_url,
    },
    categories,
  });
};

export const update = [
  validateItem,
  async (req, res) => {
    const id = req.params.id;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const categories = await Category.findAllOptions();
      return res.status(400).render("items/edit-item", {
        formType: "edit",
        errors: errors.array(),
        item: { id, ...req.body },
        categories,
      });
    }

    const { categoryId, name, description, stock, imageUrl } = matchedData(req);
    const updatedItem = await Item.update(
      id,
      categoryId,
      name,
      description,
      stock,
      imageUrl || null,
    );

    if (!updatedItem) {
      throw new AppError("No Item with this ID was found", 404);
    }

    res.redirect(`/items/${id}`);
  },
];

export const destroy = async (req, res) => {
  const id = req.params.id;
  const deletedItem = await Item.delete(id);

  if (!deletedItem) {
    throw new AppError("No Item with this ID was found", 404);
  }

  res.redirect("/items");
};
