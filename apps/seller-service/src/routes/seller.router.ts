import express, { Router } from "express";
import { isSeller } from "../../../../packages/middleware/authorizeRoles";
import isAuthenticated from "../../../../packages/middleware/isAuthenticated";
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

//notification route
router.get(
  "/seller-notifications",
  isSellerAuthenticated,
  isSeller,
  sellerNotification
);

// Event management routes
router.get(
  "/events",
  isSellerAuthenticated,
  isSeller,
  async (req, res) => {
    try {
      const events = await prisma.products.findMany({
        where: {
          shopId: req.seller.shop.id,
          starting_date: { not: null },
          ending_date: { not: null },
          isDeleted: false,
        },
        include: { images: true },
        orderBy: { createdAt: "desc" },
      });

      res.status(200).json({
        success: true,
        events,
      });
    } catch (error) {
      console.error("Error fetching seller events:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch events",
      });
    }
  }
);

export default router;
