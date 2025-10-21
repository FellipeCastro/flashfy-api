import { Router } from "express";
import token from "./middleware/token.js";
import UserController from "./controllers/UserController.js";
import SubjectController from "./controllers/SubjectController.js";
import DeckController from "./controllers/DeckController.js";
import CardController from "./controllers/CardController.js";
import ProgressController from "./controllers/ProgressController.js";
import AiQuestionsController from "./controllers/AiQuestionsController.js";

const router = Router();

router.get("/", (req, res) => {
    res.send("Servidor funcionando!");
});

// Users
router.post("/users/register", UserController.Register);
router.post("/users/login", UserController.Login);
router.get("/users/profile", token.Validate, UserController.Profile);
router.put("/users/profile", token.Validate, UserController.Edit);
router.delete("/users/profile", token.Validate, UserController.Delete);

// Subjects
router.post("/subjects", token.Validate, SubjectController.Create);
router.get("/subjects", token.Validate, SubjectController.List);
router.delete("/subjects/:idSubject", token.Validate, SubjectController.Delete);

// Decks
router.post("/decks", token.Validate, DeckController.Create);
router.get("/decks", token.Validate, DeckController.List);
router.delete("/decks/:idDeck", token.Validate, DeckController.Delete);
router.put("/decks/study", token.Validate, DeckController.Study);

// Cards
router.post("/cards", token.Validate, CardController.Create);
router.delete("/cards/:idCard", token.Validate, CardController.Delete);

// Progress
router.get("/progress", token.Validate, ProgressController.List);

// AI Questions
router.post("/ai/questions", token.Validate, AiQuestionsController.Generate);
router.post("/ai/create-deck", token.Validate, AiQuestionsController.CreateDeck);

export default router;
