import FlashcardRepository from "../repositories/FlashcardRepository.js";

class FlashcardService {
    async Create(idUser, idSubject, theme, question, answer) {
        try {
            const result = await FlashcardRepository.Create(
                idUser,
                idSubject,
                theme,
                question,
                answer
            );
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

        async ListByTheme(idUser, idSubject, theme) {
            try {
                const result = await FlashcardRepository.ListByTheme(idUser, idSubject, theme);
                return result;
            } catch (error) {
                console.error(
                    "Erro ao filtrar flashcards por tema: ",
                    error.message
                );
                throw new Error("Erro ao filtrar flashcards por tema.");
            }
        }

    async Review(idUser, idFlashcard, difficulty) {
        try {
            const daysToAdd = {
                Fácil: 7,
                Médio: 4,
                Difícil: 1,
            }[difficulty];

            const nextReviewDate = new Date();
            nextReviewDate.setDate(nextReviewDate.getDate() + daysToAdd);

            const result = await FlashcardRepository.Review(
                idUser,
                idFlashcard,
                difficulty,
                nextReviewDate
            );
            return result;
        } catch (error) {
            console.error("Erro ao atualizar revisão: ", error.message);
            throw new Error("Erro ao atualizar revisão.");
        }
    }

    async Delete(idUser, idFlashcard) {
        try {
            const result = await FlashcardRepository.Delete(
                idUser,
                idFlashcard
            );
            return result;
        } catch (error) {
            console.error("Erro ao deletar flashcard: ", error.message);
            throw new Error("Erro ao deletar flashcard.");
        }
    }
}

export default new FlashcardService();
