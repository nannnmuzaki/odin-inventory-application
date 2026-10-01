import { AppError } from "../errors/AppError.js";
import { Category } from "../models/Category.js";
import { body, matchedData, validationResult } from "express-validator";

const nameError = "Name is required and max 255 characters";

const validateCategory = [
  body("name").trim().isLength({ min: 1, max: 255 }).withMessage(nameError),
];

// Helper function to build page window pagination
function getPaginationRange(current, total, delta = 2) {
  const range = [];
  const rangeWithDots = [];
  let l;

  for (let i = 1; i <= total; i++) {
    // Keep first, last, and pages within 'delta' distance from current page
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }

  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push("...");
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
}

export const index = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit, 10) || 32);

  const { categories, totalCount } = await Category.findAndCountAll(page, limit);
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
  });
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
