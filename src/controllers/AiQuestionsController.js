import AiQuestionsService from "../services/AiQuestionsService.js";

class AiQuestionsController {
    async Generate(req, res) {
        // Configurar timeout longo (5 minutos)
        req.setTimeout(300000);
        res.setTimeout(300000);

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
}

export default new AiQuestionsController();
