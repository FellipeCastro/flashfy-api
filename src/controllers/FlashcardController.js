import FlashcardService from "../services/FlashcardService.js";

class FlashcardController {
    async Create(req, res) {
        try {
            const { theme, question, answer } = req.body;
            const { idSubject } = req.params;
            const idUser = req.idUser;

            
            if (!theme || !question || !answer) {
                return res
                    .status(400)
                    .json({ error: "Todos os campos são obrigatórios." });
            }

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

        async ListByTheme(req, res) {
            try {
                const { theme } = req.query; 
                const { idSubject } = req.params;
                const idUser = req.idUser;
                
                if (!theme) {
                    return res.status(400).json({ error: "o tema é obrigatório." });
                }

                const result = await FlashcardService.ListByTheme(idUser, idSubject, theme);
                return res.status(200).json(result);
            } catch (error) {
                return res.status(500).json({ error: error.message });
            }
        }

    async Review(req, res) {
        try {
            const { idFlashcard } = req.params;
            const { difficulty } = req.body;
            const idUser = req.idUser;

            if (!difficulty) {
                return res.status(400).json({ error: "Todos os campos são obrogatórios." })
            }

            const result = await FlashcardService.Review(
                idUser,
                idFlashcard,
                difficulty
            );

            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async Delete(req, res) {
        try {
            const { idFlashcard } = req.params;
            const idUser = req.idUser;

            const result = await FlashcardService.Delete(idUser, idFlashcard);
            return res.status(204).json(result);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}

export default new FlashcardController();
