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
}

export default new FlashcardService();
