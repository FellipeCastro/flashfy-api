import SubjectService from "../services/SubjectService.js";

class SubjectController {
    async Create(req, res) {
        try {
            const idUser = req.idUser;
            const { name, color } = req.body;

            if (!name || !color) {
                return res
                    .status(400)
                    .json({ error: "Todos os campos são obrigatórios." });
            }

            const result = await SubjectService.Create(idUser, name, color);
            return res.status(201).json(result);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    async List(req, res) {
        try {
            const idUser = req.idUser;

            const result = await SubjectService.List(idUser);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    async Delete(req, res) {
        try {
            const { idSubject } = req.params;

            const result = await SubjectService.Delete(idSubject);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
}

export default new SubjectController();
