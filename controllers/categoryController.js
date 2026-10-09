import { AppError } from "../errors/AppError.js";
import { Category } from "../models/Category.js";
import { body, matchedData, validationResult } from "express-validator";
import { Item } from "../models/Item.js";
import { getPaginationRange } from "../utils/getPaginationRange.js";

const nameError = "Name is required and max 255 characters";

const validateCategory = [
  body("name").trim().isLength({ min: 1, max: 255 }).withMessage(nameError),
];

export const index = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit, 10) || 32);

  const { categories, totalCount } = await Category.findAll(page, limit);
  const totalPages = Math.ceil(totalCount / limit) || 1;

  // Build truncated page window (e.g., [1, '...', 4, 5, 6, '...', 50])
  const paginationRange = getPaginationRange(page, totalPages);

  res.render("categories/index", {
    categories,
    currentPage: page,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    paginationRange,
    basePath: "/categories",
  });
};

export const show = async (req, res) => {
  const id = req.params.id;
  const category = await Category.findById(id);

  if (!category) {
    throw new AppError("No Category with this ID was found", 404);
  }

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit, 10) || 32);

  const { items, totalCount } = await Item.findByCategoryId(category.id, page, limit);
  const totalPages = Math.ceil(totalCount / limit) || 1;

  // Build truncated page window (e.g., [1, '...', 4, 5, 6, '...', 50])
  const paginationRange = getPaginationRange(page, totalPages);

  res.render("categories/category", {
    category,
    items,
    currentPage: page,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    paginationRange,
    basePath: `/categories/${category.id}`,
  });
};

export const create = async (_req, res) => {
  res.render("categories/create-category", {
    formType: "create",
    category: null,
  });
};

export const store = [
  validateCategory,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).render("categories/create-category", {
        formType: "create",
        errors: errors.array(),
        category: req.body,
      });
    }

    const { name } = matchedData(req);

    try {
      await Category.create(name);
      res.redirect("/categories");
    } catch (err) {
      if (err.code === "23505") {
        return res.status(400).render("categories/create-category", {
          formType: "create",
          errors: [{ path: "name", msg: "A category with this name already exists" }],
          category: req.body,
        });
      }
      throw err;
    }
  },
];

export const edit = async (req, res) => {
  const id = req.params.id;
  const category = await Category.findById(id);

  if (!category) {
    throw new AppError("No Category with this ID was found", 404);
  }

  res.render("categories/edit-category", {
    formType: "edit",
    category,
  });
};

export const update = [
  validateCategory,
  async (req, res) => {
    const id = req.params.id;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).render("categories/edit-category", {
        formType: "edit",
        errors: errors.array(),
        category: { id, ...req.body },
      });
    }

    const { name } = matchedData(req);

    try {
      const updatedCategory = await Category.update(id, name);

      if (!updatedCategory) {
        throw new AppError("No Category with this ID was found", 404);
      }

      res.redirect(`/categories/${id}`);
    } catch (err) {
      if (err.code === "23505") {
        return res.status(400).render("categories/edit-category", {
          formType: "edit",
          errors: [{ path: "name", msg: "A category with this name already exists" }],
          category: { id, ...req.body },
        });
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

  res.redirect("/categories");
};
