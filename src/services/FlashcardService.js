import FlashcardRepository from "../repositories/FlashcardRepository.js";

class FlashcardService {
    async Create(idUser, idSubject, theme, question, answer) {
        try {
            const result = await FlashcardRepository.Create(idUser, idSubject, theme, question, answer);
            return result;
        } catch (error) {
            console.error("Erro ao criar flashcard: ", error.message);
            throw new Error("Erro ao criar flashcard.");
        }
    }

    async List(idUser, idSubject) {
        try {
            const result = await FlashcardRepository.List(idUser, idSubject);
            return result;
        } catch (error) {
            console.error("Erro ao listar flashcards: ", error.message);
            throw new Error("Erro ao listar flashcards.");
        }
    }
}

export default new FlashcardService();
