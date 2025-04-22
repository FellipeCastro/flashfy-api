import { Router } from "express";
import Token from "./token.js";

import UserController from "./controllers/UserController.js";
import SubjectController from "./controllers/SubjectController.js";
import FlashcardController from "./controllers/FlashcardController.js";

const router = Router();

// Users
router.post("/users/register", UserController.Register);
router.post("/users/login", UserController.Login);
router.get("/users/profile", Token.Validate, UserController.Profile);

// Subjects
router.post("/subjects", Token.Validate, SubjectController.Create);
router.get("/subjects", Token.Validate, SubjectController.List);
router.delete("/subjects/:idSubject", Token.Validate, SubjectController.Delete);

// Flashcards
router.post("/flashcards/:idSubject", Token.Validate, FlashcardController.Create);
router.get("/flashcards/:idSubject", Token.Validate, FlashcardController.List);
router.get("/flashcards/:idSubject/filter", Token.Validate, FlashcardController.ListByTheme);
router.put("/flashcards/:idFlashcard", Token.Validate, FlashcardController.Review);
router.delete("/flashcards/:idFlashcard", Token.Validate, FlashcardController.Delete);

export default router;
