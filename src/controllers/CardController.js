import CardService from "../services/CardService.js";

class CardController {
    async Create(req, res) {
        try {
            const { idDeck, question, answer } = req.body;

            if (!idDeck || !question || !answer) {
                return res
                    .status(400)
                    .json({ error: "Todos os campos são obrigatórios." });
            }

            const result = await CardService.Create(idDeck, question, answer);
            return res.status(201).json(result);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    async Delete(req, res) {
        try {
            const { idCard } = req.params;

            const result = await CardService.Delete(idCard);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
}

export default new CardController();
