
import express, { Router } from "express";
import { createShop, getUser, loginUser, refreshToken, registerSeller, resetUserPassword, userForgotPassword, userRegistration, varifyUser, verifySeller, verifyUserForgotPassword } from "../controllers/auth.controller";
import isAuthenticated from '@packages/middleware/isAuthenticated';


const router:Router=express.Router();


router.post('/user-registration', userRegistration);
router.post('/varify-user', varifyUser);
router.post('/login-user', loginUser);
router.post('/refresh-token-user',refreshToken)
router.get('/logged-in-user',isAuthenticated,getUser)
router.post('/forgot-password-user', userForgotPassword);
router.post('/verify-forgot-password-user', verifyUserForgotPassword);
router.post('/reset-password-user', resetUserPassword);

//seller routes

router.post("/seller-registration", registerSeller);
router.post('/verify-seller',verifySeller)
router.post('/create-shop',createShop)


export default router;
