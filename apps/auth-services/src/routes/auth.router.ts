import isAuthenticated from "@packages/middleware/isAuthenticated";
import express, { Router } from "express";
import {
  addUserAddress,
  deleteUserAddress,
  getUser,
  getUserAddress,
  loginUser,
  logOutUser,
  refreshToken,
  resetUserPassword,
  updateUserPassword,
  userForgotPassword,
  userRegistration,
  varifyUser,
  verifyUserForgotPassword,
} from "../controllers/auth.controller";
import { isUser } from '../../../../packages/middleware/authorizeRoles';

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



//admin routes

/*

router.post("/login-admin",loginAdmin);
router.post("/logout-admin", isAuthenticated,logOutAdmin);
router.get("/logged-in-admin",isAuthenticated,getAdmin,getAdmin)

*/

export default router;
