import express, { Router } from "express";
import { isAdmin } from "../../../../packages/middleware/authorizeRoles";
import isAuthenticated from "../../../../packages/middleware/isAuthenticated";

import {
  addCategory,
  addNewAdmin,
  addSubCategory,
  createNotification,
  deleteNotification,
  getAllAdmins,
  getAllCustomizations,
  getAllEvents,
  getAllNotifications,
  getAllProducts,
  getAllSellers,
  getAllUsers,
  getNotificationStats,
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  uploadBanner,
  uploadLogo,
  // New functions
  banUser,
  unbanUser,
  banSeller,
  unbanSeller,
  getDashboardStats,
  getRecentOrders,
  getDeviceAnalytics,
  getGeographicalData,
} from "../controllers/admin.controller";

const router: Router = express.Router();

router.get("/get-all-products", isAuthenticated, isAdmin, getAllProducts);
router.get("/get-all-events", isAuthenticated, isAdmin, getAllEvents);
router.get("/get-all-admins", isAuthenticated, isAdmin, getAllAdmins);
router.put("/add-new-admin", isAuthenticated, isAdmin, addNewAdmin);
router.get("/get-all-users", isAuthenticated, isAdmin, getAllUsers);
router.get("/get-all-sellers", isAuthenticated, isAdmin, getAllSellers);
router.get("/get-all", getAllCustomizations);

// Site Customization - Category Management
router.post("/add-category", isAuthenticated, isAdmin, addCategory);
router.post("/add-sub-category", isAuthenticated, isAdmin, addSubCategory);

// Site Customization - Image Upload (Using ImageKit with base64, no multer needed)
router.post("/upload-logo", isAuthenticated, isAdmin, uploadLogo);
router.post("/upload-banner", isAuthenticated, isAdmin, uploadBanner);

// Admin Notifications
// Admin Notifications
router.get("/notifications", isAuthenticated, isAdmin, getAllNotifications);
router.get(
  "/notifications/stats",
  isAuthenticated,
  isAdmin,
  getNotificationStats
);
router.put(
  "/notifications/:id/read",
  isAuthenticated,
  isAdmin,
  markNotificationAsRead
);
router.put(
  "/notifications/mark-all-read",
  isAuthenticated,
  isAdmin,
  markAllNotificationsAsRead
);
router.delete(
  "/notifications/:id",
  isAuthenticated,
  isAdmin,
  deleteNotification
);
router.get("/notifications/user/:receiverId", getUserNotifications);
router.post("/notifications", createNotification);

// Ban/Unban routes
router.put("/ban-user/:userId", isAuthenticated, isAdmin, banUser);
router.put("/unban-user/:userId", isAuthenticated, isAdmin, unbanUser);
router.put("/ban-seller/:sellerId", isAuthenticated, isAdmin, banSeller);
router.put("/unban-seller/:sellerId", isAuthenticated, isAdmin, unbanSeller);

// Dashboard analytics routes
router.get("/dashboard-stats", isAuthenticated, isAdmin, getDashboardStats);
router.get("/recent-orders", isAuthenticated, isAdmin, getRecentOrders);
router.get("/device-analytics", isAuthenticated, isAdmin, getDeviceAnalytics);
router.get("/geographical-data", isAuthenticated, isAdmin, getGeographicalData);

export default router;
