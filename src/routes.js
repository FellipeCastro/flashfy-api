import { Router } from "express";
import token from "./token.js";
import UserController from "./controllers/UserController.js";
import SubjectController from "./controllers/SubjectController.js";
import DeckController from "./controllers/DeckController.js";
import CardController from "./controllers/CardController.js";
import ProgressController from "./controllers/ProgressController.js";

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
router.put(
    "/decks/next-review/:idDeck",
    token.Validate,
    DeckController.UpdateNextReview
);

// Cards
router.post("/cards", token.Validate, CardController.Create);
router.get("/cards/:idDeck", token.Validate, CardController.List);
router.delete("/cards/:idCard", token.Validate, CardController.Delete);
router.put(
    "/cards/difficulty/:idCard",
    token.Validate,
    CardController.UpdateDifficulty
);

// Progress
router.get("/progress", token.Validate, ProgressController.List);
router.post("/progress/increment", token.Validate, ProgressController.IncrementStudiedDecks);
router.get("/progress/check-new-day", token.Validate, ProgressController.CheckNewDay);

export default router;
