import DeckService from "../services/DeckService.js";

class DeckController {
    async Create(req, res) {
        try {
            const idUser = req.idUser;
            const { title, idSubject } = req.body;

            if (!title || !idSubject) {
                return res
                    .status(400)
                    .json({ error: "Todos os campos são obrigatórios." });
            }

            const result = await DeckService.Create(idUser, idSubject, title);
            return res.status(201).json(result);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    async List(req, res) {
        try {
            const idUser = req.idUser;

            const result = await DeckService.List(idUser);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    async Delete(req, res) {
        try {
            const { idDeck } = req.params;

            const result = await DeckService.Delete(idDeck);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
}

export default new DeckController();
