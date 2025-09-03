import ProgressService from "../services/ProgressService.js";

class ProgressController {
    async StudyDeck(req, res) {
        try {
            const idUser = req.idUser;
            
            // Esta única chamada faz tudo:
            // 1. Verifica se é novo dia
            // 2. Reseta studiedDecks se for novo dia
            // 3. Incrementa studiedDecks
            // 4. Atualiza dias consecutivos
            const result = await ProgressService.StudyDeck(idUser);
            
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ 
                success: false,
                error: error.message 
            });
        }
    }

    async List(req, res) {
        try {
            const idUser = req.idUser;
            const result = await ProgressService.List(idUser);
            
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ 
                success: false,
                error: error.message 
            });
        }
    }
}

export default new ProgressController();
