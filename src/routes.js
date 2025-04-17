import { Router } from "express";
import UserController from "./controllers/UserController.js";

const router = Router();

// Users
router.post("/users/register", UserController.Register);
router.post("/users/login", UserController.Login);

export default router;
