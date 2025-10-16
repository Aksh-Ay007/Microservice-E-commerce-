import express, { Router } from "express";
import { isSeller } from "../../../../packages/middleware/authorizeRoles";
import { isSellerAuthenticated } from "../../../../packages/middleware/sellerAuth.middleware";
import {
  createShop,
  createStripeConnectLink,
  followShop,
  getSeller,
  getSellerDetails,
  getSellerEvents,
  getSellerProducts,
  isFollowingShop,
  loginSeller,
  logOutSeller,
  refreshToken,
  registerSeller,
  unfollowShop,
  verifySeller,
} from "../controller/seller.controller";
import isAuthenticated from '../../../../packages/middleware/isAuthenticated';

const router: Router = express.Router();

// ✅ Seller routes
router.post("/refresh-token", refreshToken);
router.post("/seller-registration", registerSeller);
router.post("/verify-seller", verifySeller);
router.post("/create-shop", createShop);
router.post("/create-stripe-link", createStripeConnectLink);
router.post("/login-seller", loginSeller);
router.get("/refresh-token", refreshToken);




// ✅ Add missing route for seller details
router.get("/get-seller/:id", getSellerDetails);


// GET endpoints
router.get("/get-seller-products/:shopId", getSellerProducts);
router.get("/get-seller-events/:shopId", getSellerEvents);
router.get("/is-following/:shopId", isAuthenticated, isFollowingShop);

// POST endpoints
router.post("/follow-shop", isAuthenticated, followShop);
router.post("/unfollow-shop", isAuthenticated, unfollowShop);




// ✅ Use your seller-specific authentication middleware
router.post("/logout-seller", isSellerAuthenticated, isSeller, logOutSeller);
router.get("/logged-in-seller", isSellerAuthenticated, isSeller, getSeller);

export default router;
