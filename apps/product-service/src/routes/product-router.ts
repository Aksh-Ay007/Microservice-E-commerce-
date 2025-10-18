import { isSeller } from "@packages/middleware/authorizeRoles";
import express, { Router } from "express";
import { isSellerAuthenticated } from "../../../../packages/middleware/sellerAuth.middleware";
import {
  createDiscountCodes,
  createEvent,
  createProduct,
  createRating,
  deleteDiscountCode,
  deleteEvent,
  deleteProduct,
  deleteProductImage,
  deleteRating,
  getAllEvents,
  getAllProducts,
  getAvailableCouponsForCart,
  getCategories,
  getDiscountCodes,
  getEventDetails,
  getFilteredEvents,
  getFilteredProducts,
  getFilteredShops,
  getProductDetails,
  getProductRatings,
  getRatingStats,
  getShopEvents,
  getShopProducts,
  getStripeAccount,
  restoreProduct,
  searchProducts,
  topShops,
  updateRating,
  uploadProductImage,
} from "../controllers/product.controller";
import isAuthenticated from '../../../../packages/middleware/isAuthenticated';

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




router.post("/create-event", isSellerAuthenticated, createEvent);
router.get("/get-shop-events", isSellerAuthenticated, getShopEvents);
router.delete("/delete-event/:eventId", isSellerAuthenticated, deleteEvent);
router.get("/get-event-details/:slug", getEventDetails);


router.post("/ratings", isAuthenticated, createRating);
router.get("/ratings/product/:productId", getProductRatings);
router.get("/ratings/stats/:productId", getRatingStats);
router.put("/ratings/:id", isAuthenticated, updateRating);
router.delete("/ratings/:id", isAuthenticated, deleteRating);

router.post("/available-coupons", getAvailableCouponsForCart);


export default router;
