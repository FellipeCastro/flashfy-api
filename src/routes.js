import { Router } from "express";
import UserController from "./controllers/UserController.js";

const router = Router();

// Users
router.post("/users/register", UserController.Register);

export default router;
