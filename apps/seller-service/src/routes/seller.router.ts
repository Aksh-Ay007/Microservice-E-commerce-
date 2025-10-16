import express, { Router } from "express";
import { isSeller } from "../../../../packages/middleware/authorizeRoles";
import { isSellerAuthenticated } from "../../../../packages/middleware/sellerAuth.middleware";
import {
  createShop,
  createStripeConnectLink,
  getSeller,
  getSellerDetails,
  loginSeller,
  logOutSeller,
  refreshToken,
  registerSeller,
  verifySeller,
} from "../controller/seller.controller";

const router: Router = express.Router();

// ✅ Seller routes
router.post("/refresh-token", refreshToken);
router.post("/seller-registration", registerSeller);
router.post("/verify-seller", verifySeller);
router.post("/create-shop", createShop);
router.post("/create-stripe-link", createStripeConnectLink);
router.post("/login-seller", loginSeller);
router.get("/refresh-token", refreshToken);

// ✅ Use your seller-specific authentication middleware
router.post("/logout-seller", isSellerAuthenticated, isSeller, logOutSeller);
router.get("/logged-in-seller", isSellerAuthenticated, isSeller, getSeller);

// Public route to fetch seller details by shop id
router.get("/get-seller/:id", getSellerDetails);

export default router;
