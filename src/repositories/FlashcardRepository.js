import { consult } from "../database/connection.js";

class FlashcardRepository {
    async Create(idUser, idSubject, theme, question, answer) {
        try {
            const sql = "INSERT INTO flashcards (idSubject, idUser, theme, question, answer) VALUES (?, ?, ?, ?, ?)";
            const result = await consult(sql, [
                idSubject,
                idUser,
                theme,
                question,
                answer,
            ]);

            const [newFlashcard] = await consult(
                "SELECT * FROM flashcards WHERE idFlashcard = ?",
                [result.insertId]
            );
            return newFlashcard;
        } catch (error) {
            console.error("Erro ao criar flashcard: ", error.message);
            throw new Error("Erro ao criar flashcard.");
        }
    }
    
    async List(idUser, idSubject) {
        try {
            const sql = "SELECT * FROM flashcards WHERE idUser = ? AND idSubject = ?";
            const result = await consult(sql, [idUser, idSubject]);
            return result; 
        } catch (error) {
            console.error("Erro ao listar flashcards: ", error.message);
            throw new Error("Erro ao listar flashcards.");
        }
    }

    async Delete(idUser, idFlashcard) {
        try {
            const [flashcard] = await consult(
                "SELECT idFlashcard FROM flashcards WHERE idFlashcard = ? AND idUser = ?",
                [idFlashcard, idUser]
            );
            
            if (!flashcard) {
                throw new Error("Flashcard não encontrado.");
            }

            const sql = "DELETE FROM flashcards WHERE idFlashcard = ?";
            await consult(sql, [idFlashcard]);
        } catch (error) {
            console.error("Erro ao deletar flashcard: ", error.message);
            throw new Error("Erro ao deletar flashcard.");
        }
    }
}

export default new FlashcardRepository();
