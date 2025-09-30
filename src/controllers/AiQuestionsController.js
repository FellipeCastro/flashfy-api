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
}

export default new AiQuestionsController();
