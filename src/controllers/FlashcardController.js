import FlashcardService from "../services/FlashcardService.js";

class FlashcardController {
    async Create(req, res) {
        try {
            const { theme, question, answer } = req.body;
            const { idSubject } = req.params;
            const idUser = req.idUser;
            
            const flashcard = await FlashcardService.Create(
                idUser, 
                idSubject, 
                theme, 
                question, 
                answer
            );
            
            return res.status(201).json(flashcard);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    async List(req, res) {
        try {
            const { idSubject } = req.params;
            const idUser = req.idUser;
            
            const result = await FlashcardService.List(idUser, idSubject);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}

export default new FlashcardController();
