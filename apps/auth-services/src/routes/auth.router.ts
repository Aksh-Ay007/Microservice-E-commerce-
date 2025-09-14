
import express, { Router } from "express";
import { loginUser, resetUserPassword, userForgotPassword, userRegistration, varifyUser, verifyUserForgotPassword } from "../controllers/auth.controller";


const router:Router=express.Router();


router.post('/user-registration', userRegistration);
router.post('/varify-user', varifyUser);
router.post('/login-user', loginUser);
router.post('/forgot-password-user', userForgotPassword);
router.post('/verify-forgot-password-user', verifyUserForgotPassword);
router.post('/reset-password-user', resetUserPassword);

export default router;