import express, { Router } from "express";
import isAuthenticated from "../../../../packages/middleware/isAuthenticated";
import {
  createDiscountCodes,
  createProduct,
  deleteDiscountCode,
  deleteProductImage,
  getCategories,
  getDiscountCodes,
  uploadProductImage,
} from "../controllers/product.controller";

const router: Router = express.Router();

router.get("/get-categories", getCategories);
router.post("/create-discount-code", isAuthenticated, createDiscountCodes);
router.get("/get-discount-codes", isAuthenticated, getDiscountCodes);
router.delete("/delete-discount-code/:id", isAuthenticated, deleteDiscountCode);

router.post("/upload-product-image", isAuthenticated, uploadProductImage);
router.delete("/delete-product-image", isAuthenticated, deleteProductImage);
router.post("/create-product", isAuthenticated, createProduct);

export default router;
