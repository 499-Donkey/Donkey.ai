// routes/users.ts
import express from "express";
import * as UserController from "../controllers/users";
// import { requiresAuth } from "../middleware/auth";

const router = express.Router();

router.post("/signup", UserController.signUp);
router.post("/login", UserController.login);
router.post("/logout", UserController.logout);
router.post("/update-password", UserController.updatePassword);
router.post("/request-password-reset", UserController.requestPasswordReset);
router.get('/reset-password/:token', (req, res) => {
    console.log('Reset password route hit with token:', req.params.token);
    res.redirect(`http://localhost:3000/reset-password/${req.params.token}`);
});



export default router;