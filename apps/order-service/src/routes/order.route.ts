import express, { Router } from "express";
import { isAdmin, isSeller } from "../../../../packages/middleware/authorizeRoles";
import isAuthenticated from "../../../../packages/middleware/isAuthenticated";
import { isSellerAuthenticated } from "../../../../packages/middleware/sellerAuth.middleware";
import {
  createPaymentIntent,
  createPaymentSession,
  getAdminOrders,
  getOrderDetails,
  getSellerOrders,
  getUserOrders,
  updateDeliveryStatus,
  verifyCouponCode,
  verifyPaymentSession,
  // COD functions
  createCODOrder,
  updateCODOrderStatus,
  confirmCODPayment,
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
router.get("/get-userOrder-details/:id", isAuthenticated, getOrderDetails);

router.put(
  "/update-status/:orderId",
  isSellerAuthenticated,
  isSeller,
  updateDeliveryStatus
);

router.put("/verify-coupon", isAuthenticated, verifyCouponCode);
router.get("/get-user-orders", isAuthenticated, getUserOrders);

router.get("/get-admin-orders", isAuthenticated,isAdmin, getAdminOrders);

// COD (Cash on Delivery) routes
router.post("/create-cod-order", isAuthenticated, createCODOrder);
router.put("/update-cod-order/:orderId", isSellerAuthenticated, isSeller, updateCODOrderStatus);
router.put("/confirm-cod-payment/:orderId", isSellerAuthenticated, isSeller, confirmCODPayment);

export default router;
