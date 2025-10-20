import AiQuestionsService from "../services/AiQuestionsService.js";

class AiQuestionsController {
    async Generate(req, res) {
        try {
            const { theme, difficulty, quantity } = req.body;

            const result = await AiQuestionsService.Generate(
                theme,
                difficulty,
                quantity
            );
            return res.status(201).json(result);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
    // Adicione este método dentro da classe AiQuestionsController
    async CreateDeck(req, res) {
        try {
            const idUser = req.idUser; // Pegamos o ID do usuário logado
            const { theme, idSubject, quantity } = req.body;

            // Validação básica
            if (!theme || !idSubject || !quantity) {
                return res
                    .status(400)
                    .json({
                        error: "Tema, matéria e quantidade são obrigatórios.",
                    });
            }

            const result = await AiQuestionsService.GenerateDeck(
                idUser,
                theme,
                idSubject,
                quantity
            );

            return res.status(201).json(result);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}

export default new AiQuestionsController();
