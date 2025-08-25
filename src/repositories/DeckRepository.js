import { consult } from "../database/connection.js";

class DeckRepository {
    async Create(idUser, idSubject, title) {
        try {
            const sql =
                "INSERT INTO decks (idUser, idSubject, title) VALUES (?, ?, ?)";
            const result = await consult(sql, [idUser, idSubject, title]);
            const [insertSubject] = await consult(
                "SELECT * FROM decks WHERE idDeck = ?",
                [result.insertId]
            );
            return insertSubject;
        } catch (error) {
            console.error("Erro ao criar deck: ", error.message);
            throw new Error("Erro ao criar deck.");
        }
    }

    async List(idUser) {
        try {
            const sql = `SELECT 
                            d.title,
                            s.name as subject,
                            d.nextReview
                        FROM decks d
                        INNER JOIN subjects s ON d.idSubject = s.idSubject;`;
            const result = consult(sql, [idUser]);
            return result;
        } catch (error) {
            console.error("Erro ao listas matérias: ", error.message);
            throw new Error("Erro ao listas matérias.");
        }
    }

    async Delete(idSubject) {
        try {
            const checkSql =
                "SELECT idSubject FROM subjects WHERE idSubject = ?";
            const subject = await consult(checkSql, [idSubject]);

            if (subject.length === 0) {
                throw new Error("Matéria não encontrada.");
            }

            const sql = "DELETE FROM subjects WHERE idSubject = ?";
            await consult(sql, [idSubject]);
        } catch (error) {
            console.error("Erro ao deletar matéria: ", error.message);
            throw new Error("Erro ao deletar matéria.");
        }
    }
}

export default new DeckRepository();
