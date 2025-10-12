import express, { Router } from "express";
import { isSeller } from "../../../../packages/middleware/authorizeRoles";
import isAuthenticated from "../../../../packages/middleware/isAuthenticated";
import { isSellerAuthenticated } from "../../../../packages/middleware/sellerAuth.middleware";
import {
  createPaymentIntent,
  createPaymentSession,
  getOrderDetails,
  getSellerOrders,
  getUserOrders,
  updateDeliveryStatus,
  verifyCouponCode,
  verifyPaymentSession,
} from "../controllers/order.controller";

const router: Router = express.Router();

router.post("/create-payment-intent", isAuthenticated, createPaymentIntent);
router.post("/create-payment-session", isAuthenticated, createPaymentSession);
router.get("/verifying-payment-session", isAuthenticated, verifyPaymentSession);

router.get(
  "/get-seller-orders",
  isSellerAuthenticated,
  isSeller,
  getSellerOrders
);
router.get("/get-order-details/:id", isSellerAuthenticated, getOrderDetails);

router.put(
  "/update-status/:orderId",
  isSellerAuthenticated,
  isSeller,
  updateDeliveryStatus
);

router.put("/verify-coupon", isAuthenticated, verifyCouponCode);
router.get("/get-user-orders", isAuthenticated, getUserOrders);

export default router;
