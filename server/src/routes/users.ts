import express from "express"
import * as UsersController from "../controllers/users"

const router = express.Router();

router.get("/", UsersController.getUsers);

router.get("/:userId", UsersController.getUser);

router.post("/", UsersController.createUser);

export default router;