import { isSeller } from "@packages/middleware/authorizeRoles";
import express, { Router } from "express";
import { isSellerAuthenticated } from "../../../../packages/middleware/sellerAuth.middleware";
import {
  createDiscountCodes,
  createProduct,
  deleteDiscountCode,
  deleteProduct,
  deleteProductImage,
  getAllEvents,
  getAllProducts,
  getCategories,
  getDiscountCodes,
  getFilteredEvents,
  getFilteredProducts,
  getFilteredShops,
  getProductDetails,
  getShopProducts,
  getStripeAccount,
  restoreProduct,
  searchProducts,
  topShops,
  uploadProductImage,
} from "../controllers/product.controller";

const router: Router = express.Router();

router.get("/get-categories", getCategories);
router.post(
  "/create-discount-code",
  isSellerAuthenticated,
  createDiscountCodes
);
router.get("/get-discount-codes", isSellerAuthenticated, getDiscountCodes);
router.delete(
  "/delete-discount-code/:id",
  isSellerAuthenticated,
  deleteDiscountCode
);

router.post("/upload-product-image", isSellerAuthenticated, uploadProductImage);
router.delete(
  "/delete-product-image",
  isSellerAuthenticated,
  deleteProductImage
);
router.post("/create-product", isSellerAuthenticated, createProduct);
router.get("/get-shop-products", isSellerAuthenticated, getShopProducts);
router.delete(
  "/delete-product/:productId",
  isSellerAuthenticated,
  deleteProduct
);
router.put(
  "/restore-product/:productId",
  isSellerAuthenticated,
  restoreProduct
);

router.get(
  "/get-stripe-account",
  isSellerAuthenticated,
  isSeller,
  getStripeAccount
);

router.get("/get-all-products", getAllProducts);
router.get("/get-all-events", getAllEvents);

router.get("/get-product/:slug", getProductDetails);
router.get("/get-filtered-products", getFilteredProducts);
router.get("/get-filtered-offers", getFilteredEvents);
router.get("/get-filtered-shops", getFilteredShops);

router.get("/search-products", searchProducts);
router.get("/top-shops", topShops);

export default router;
