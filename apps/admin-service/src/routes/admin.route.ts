import express, { Router } from "express";


const router: Router = express.Router();

import { loginAdmin } from "../controllers/admin.controller";


router.post("/login-admin", loginAdmin);


export default router;
