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
}

export default new FlashcardRepository();
