import { consult } from "../database/connection.js";

class CardRepository {
    async Create(idDeck, question, answer) {
        try {
            const sql =
                "INSERT INTO cards (idDeck, question, answer) VALUES (?, ?, ?)";
            const result = await consult(sql, [idDeck, question, answer]);
            const [insertSubject] = await consult(
                "SELECT * FROM cards WHERE idCard = ?",
                [result.insertId]
            );
            return insertSubject;
        } catch (error) {
            console.error("Erro ao criar card: ", error.message);
            throw new Error("Erro ao criar card.");
        }
    }

    async List(idDeck) {
        try {
            const sql = "SELECT * FROM cards WHERE idDeck = ?";
            const result = consult(sql, [idDeck]);
            return result;
        } catch (error) {
            console.error("Erro ao listar cards: ", error.message);
            throw new Error("Erro ao listar cards.");
        }
    }

    async Delete(idCard) {
        try {
            const checkSql = "SELECT idCard FROM cards WHERE idCard = ?";
            const subject = await consult(checkSql, [idCard]);

            if (subject.length === 0) {
                throw new Error("Card não encontrado.");
            }

            const sql = "DELETE FROM cards WHERE idCard = ?";
            await consult(sql, [idCard]);
        } catch (error) {
            console.error("Erro ao deletar card: ", error.message);
            throw new Error("Erro ao deletar card.");
        }
    }

    async UpdateDifficulty(difficulty, idCard) {
        try {
            const checkSql = "SELECT idCard FROM cards WHERE idCard = ?";
            const subject = await consult(checkSql, [idCard]);

            if (subject.length === 0) {
                throw new Error("Card não encontrado.");
            }

            const sql = "UPDATE cards SET difficulty = ? WHERE idCard = ?";
            await consult(sql, [difficulty, idCard]);
        } catch (error) {
            console.error("Erro ao atualizar dificuldade do card: ", error.message);
            throw new Error("Erro ao atualizar dificuldade do card.");
        }
    }
}

export default new CardRepository();
