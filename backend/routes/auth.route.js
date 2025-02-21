import express from "express";
import {
    registerController,
    loginController,
    logoutController,
    verifyEmail,
    forgotPassword, resetPassword, checkAuth
} from "../controllers/auth.controller.js"
import {verifyToken} from "../middleware/verifyToken.js";


const router = express.Router()

router.post("/signup",registerController);

router.post("/login",loginController);

router.post("/logout",logoutController);

router.post("/verify-email",verifyEmail);

router.post("/forgot-password",forgotPassword);

router.post("/reset-password/:token",resetPassword);

router.get("/check-auth",verifyToken,checkAuth)

export default router;