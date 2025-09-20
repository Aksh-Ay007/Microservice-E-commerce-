
import express, { Router } from "express";
import { createShop, createStripeConnectLink, getSeller, getUser, loginSeller, loginUser, refreshToken, registerSeller, resetUserPassword, userForgotPassword, userRegistration, varifyUser, verifySeller, verifyUserForgotPassword } from "../controllers/auth.controller";
import isAuthenticated from '@packages/middleware/isAuthenticated';
import { isSeller, isUser } from '@packages/middleware/authorizeRoles';


const router:Router=express.Router();


router.post('/user-registration', userRegistration);
router.post('/varify-user', varifyUser);
router.post('/login-user', loginUser);
router.post('/refresh-token',refreshToken)
router.get('/logged-in-user',isAuthenticated,isUser,getUser)
router.post('/forgot-password-user', userForgotPassword);
router.post('/verify-forgot-password-user', verifyUserForgotPassword);
router.post('/reset-password-user', resetUserPassword);

//seller routes

router.post("/seller-registration", registerSeller);
router.post('/verify-seller',verifySeller)
router.post('/create-shop',createShop)
router.post("/create-stripe-link",createStripeConnectLink)
router.post("/login-seller",loginSeller)
router.get("/logged-in-seller",isAuthenticated,isSeller,getSeller)


export default router;
