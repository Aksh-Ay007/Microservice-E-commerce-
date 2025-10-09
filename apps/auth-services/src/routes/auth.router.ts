import { isSeller, isUser } from "@packages/middleware/authorizeRoles";
import isAuthenticated from "@packages/middleware/isAuthenticated";
import express, { Router } from "express";
import {
  addUserAddress,
  createShop,
  createStripeConnectLink,
  deleteUserAddress,
  getSeller,
  getUser,
  getUserAddress,
  loginSeller,
  loginUser,
  logOutSeller,
  logOutUser,
  refreshToken,
  registerSeller,
  resetUserPassword,
  updateUserPassword,
  userForgotPassword,
  userRegistration,
  varifyUser,
  verifySeller,
  verifyUserForgotPassword,
} from "../controllers/auth.controller";

const router: Router = express.Router();

router.post("/user-registration", userRegistration);
router.post("/varify-user", varifyUser);
router.post("/login-user", loginUser);
router.get("/logout-user", isAuthenticated, logOutUser);

router.post("/refresh-token", refreshToken);
router.get("/logged-in-user", isAuthenticated, isUser, getUser);
router.post("/forgot-password-user", userForgotPassword);
router.post("/verify-forgot-password-user", verifyUserForgotPassword);
router.post("/reset-password-user", resetUserPassword);
router.post("/change-password", isAuthenticated, updateUserPassword);
router.get("/shipping-addresses", isAuthenticated, getUserAddress);
router.post("/add-address", isAuthenticated, addUserAddress);
router.delete("/delete-address/:addressId", isAuthenticated, deleteUserAddress);

//seller routes

router.post("/seller-registration", registerSeller);
router.post("/verify-seller", verifySeller);
router.post("/create-shop", createShop);
router.post("/create-stripe-link", createStripeConnectLink);
router.post("/login-seller", loginSeller);
router.post("/logout-seller", isAuthenticated, isSeller, logOutSeller);
router.get("/logged-in-seller", isAuthenticated, isSeller, getSeller);

//admin routes

/*

router.post("/login-admin",loginAdmin);
router.post("/logout-admin", isAuthenticated,logOutAdmin);
router.get("/logged-in-admin",isAuthenticated,getAdmin,getAdmin)

*/

export default router;
