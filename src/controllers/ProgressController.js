import ProgressService from "../services/ProgressService.js";

class ProgressController {
    async List(req, res) {
        try {
            const idUser = req.idUser;
            const result = await ProgressService.List(idUser);

            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({
                error: error.message,
            });
        }
    }

    async IncrementStudiedDecks(req, res) {
        try {
            const idUser = req.idUser;
            const result = await ProgressService.IncrementStudiedDecks(idUser);

            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({
                error: error.message,
            });
        }
    }

        async CheckNewDay(req, res) {
        try {
            const idUser = req.idUser;
            const result = await ProgressService.CheckAndResetForNewDay(idUser);

            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({
                error: error.message,
            });
        }
    }
}

export default new ProgressController();
