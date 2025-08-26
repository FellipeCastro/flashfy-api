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
                            d.idDeck,
                            d.title,
                            s.name as subject,
                            d.nextReview
                        FROM decks d
                        INNER JOIN subjects s ON d.idSubject = s.idSubject
                        WHERE d.idUser = ?`;
            const result = consult(sql, [idUser]);
            return result;
        } catch (error) {
            console.error("Erro ao listar decks: ", error.message);
            throw new Error("Erro ao listar decks.");
        }
    }

    async Delete(idDeck) {
        try {
            const checkSql =
                "SELECT idDeck FROM decks WHERE idDeck = ?";
            const deck = await consult(checkSql, [idDeck]);

            if (deck.length === 0) {
                throw new Error("Deck não encontrado.");
            }

            const sql = "DELETE FROM decks WHERE idDeck = ?";
            await consult(sql, [idDeck]);
        } catch (error) {
            console.error("Erro ao deletar deck: ", error.message);
            throw new Error("Erro ao deletar deck.");
        }
    }
}

export default new DeckRepository();
