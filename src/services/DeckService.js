import DeckRepository from "../repositories/DeckRepository.js";

class DeckService {
    async Create(idUser, idSubject, title) {
        try {
            const result = await DeckRepository.Create(idUser, idSubject, title);
            return result;
        } catch (error) {
            console.error("Erro ao criar deck: ", error.message);
            throw new Error("Erro ao criar deck.");
        }
    }

    async List(idUser) {
        try {
            const result = await SubjectRepository.List(idUser);
            return result;
        } catch (error) {
            console.error("Erro ao listas matérias: ", error.message);
            throw new Error("Erro ao listas matérias.");
        }
    }

    async Delete(idSubject) {
        try {
            return await SubjectRepository.Delete(idSubject);
        } catch (error) {
            console.error("Erro ao deletar matéria: ", error.message);
            throw new Error("Erro ao deletar matéria.");
        }
    }
}

export default new DeckService();
