import express, { Router } from "express";
import { isAdmin } from "../../../../packages/middleware/authorizeRoles";
import isAuthenticated from "../../../../packages/middleware/isAuthenticated";

import {
  addCategory,
  addNewAdmin,
  addSubCategory,
  getDashboardOverview,
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
} from "../controllers/admin.controller";

const router: Router = express.Router();

router.get("/get-all-products", isAuthenticated, isAdmin, getAllProducts);
router.get("/get-all-events", isAuthenticated, isAdmin, getAllEvents);
router.get("/get-all-admins", isAuthenticated, isAdmin, getAllAdmins);
router.get(
  "/dashboard/overview",
  isAuthenticated,
  isAdmin,
  getDashboardOverview
);
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


export default router;
