import express,{Router} from 'express';
import { createPaymentIntent, createPaymentSession, verifyPaymentSession } from '../controllers/order.controller';
import isAuthenticated from '../../../../packages/middleware/isAuthenticated';


const router:Router=express.Router();

router.post("/create-payment-intent",isAuthenticated,createPaymentIntent);
router.post("/create-payment-session",isAuthenticated,createPaymentSession);
router.get("/verifying-payment-session",isAuthenticated,verifyPaymentSession);




export default router
