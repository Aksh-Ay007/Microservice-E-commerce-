import express, { Router } from "express";
import { isSeller } from "../../../../packages/middleware/authorizeRoles";
import isAuthenticated from "../../../../packages/middleware/isAuthenticated";
import { isSellerAuthenticated } from "../../../../packages/middleware/sellerAuth.middleware";
import {
  createShop,
  createStripeConnectLink,
  deleteSellerNotification,
  followShop,
  getSeller,
  getSellerDetails,
  getSellerEvents,
  getSellerNotificationStats,
  getSellerProducts,
  isFollowingShop,
  loginSeller,
  logOutSeller,
  markAllSellerNotificationsAsRead,
  markSellerNotificationAsRead,
  refreshToken,
  registerSeller,
  sellerNotification,
  unfollowShop,
  updateSellerAvatar,
  updateSellerBanner,
  updateSellerProfile,
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

// ✅ Add missing route for seller details
router.get("/get-seller/:id", getSellerDetails);

router.get("/get-seller-products/:id", getSellerProducts);
router.get("/get-seller-events/:id", getSellerEvents);

// Follow/unfollow endpoints (user auth required)
router.get("/is-following/:id", isAuthenticated as any, isFollowingShop);
router.post("/follow-shop", isAuthenticated as any, followShop);
router.post("/unfollow-shop", isAuthenticated as any, unfollowShop);

// ✅ Use your seller-specific authentication middleware
router.post("/logout-seller", isSellerAuthenticated, isSeller, logOutSeller);
router.get("/logged-in-seller", isSellerAuthenticated, isSeller, getSeller);

// Add these routes
router.post(
  "/update-avatar",
  isSellerAuthenticated,
  isSeller,
  updateSellerAvatar
);
router.post(
  "/update-banner",
  isSellerAuthenticated,
  isSeller,
  updateSellerBanner
);
router.put(
  "/update-profile",
  isSellerAuthenticated,
  isSeller,
  updateSellerProfile
);

// Seller Notification Routes
router.get(
  "/seller-notifications",
  isSellerAuthenticated,
  isSeller,
  sellerNotification
);
router.get(
  "/seller-notifications/stats",
  isSellerAuthenticated,
  isSeller,
  getSellerNotificationStats
);
router.put(
  "/seller-notifications/:id/read",
  isSellerAuthenticated,
  isSeller,
  markSellerNotificationAsRead
);
router.delete(
  "/seller-notifications/:id",
  isSellerAuthenticated,
  isSeller,
  deleteSellerNotification
);
router.put(
  "/seller-notifications/mark-all-read",
  isSellerAuthenticated,
  isSeller,
  markAllSellerNotificationsAsRead
);

export default router;
