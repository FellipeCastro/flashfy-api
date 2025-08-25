import { Router } from "express";
import Token from "./token.js";

import UserController from "./controllers/UserController.js";
import SubjectController from "./controllers/SubjectController.js";

const router = Router();

// Users
router.post("/users/register", UserController.Register);
router.post("/users/login", UserController.Login);
router.get("/users/profile", Token.Validate, UserController.Profile);

// Subjects
router.post("/subjects", Token.Validate, SubjectController.Create);
router.get("/subjects", Token.Validate, SubjectController.List);
router.delete("/subjects/:idSubject", Token.Validate, SubjectController.Delete);

export default router;
