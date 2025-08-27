import { Router } from "express";
import token from "./token.js";

import UserController from "./controllers/UserController.js";
import SubjectController from "./controllers/SubjectController.js";
import DeckController from "./controllers/DeckController.js";
import CardController from "./controllers/CardController.js";

const router = Router();

// Users
router.post("/users/register", UserController.Register);
router.post("/users/login", UserController.Login);
router.get("/users/profile", token.Validate, UserController.Profile);

// Subjects
router.post("/subjects", token.Validate, SubjectController.Create);
router.get("/subjects", token.Validate, SubjectController.List);
router.delete("/subjects/:idSubject", token.Validate, SubjectController.Delete);

// Decks
router.post("/decks", token.Validate, DeckController.Create);
router.get("/decks", token.Validate, DeckController.List);
router.delete("/decks/:idDeck", token.Validate, DeckController.Delete);

// Cards
router.post("/cards", token.Validate, CardController.Create);
router.get("/cards/:idDeck", token.Validate, CardController.List);
router.delete("/cards/:idCard", token.Validate, CardController.Delete);
router.put("/cards/:idCard", token.Validate, CardController.UpdateDifficulty);

export default router;
