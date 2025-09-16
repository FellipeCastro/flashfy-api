import { consult } from "../database/connection.js";

class ProgressRepository {
    async FindByUserId(idUser) {
        try {
            const sql = "SELECT * FROM progress WHERE idUser = ?";
            const result = await consult(sql, [idUser]);
            return result[0];
        } catch (error) {
            console.error(
                "Erro ao buscar progresso do usuário: ",
                error.message
            );
            throw new Error("Erro ao buscar progresso do usuário.");
        }
    }

    async Create(idUser) {
        try {
            const sql =
                "INSERT INTO progress (idUser, consecutiveDays, lastStudyDate) VALUES (?, 0, NULL)";
            const result = await consult(sql, [idUser]);
            return result;
        } catch (error) {
            console.error(
                "Erro ao criar registro de progresso: ",
                error.message
            );
            throw new Error("Erro ao criar registro de progresso.");
        }
    }

    async getDecksToStudy(idUser) {
        try {
            const sql = `
                SELECT COUNT(*) as decksToStudy 
                FROM decks 
                WHERE nextReview <= CURDATE() 
                AND idUser = ?
            `;
            const result = await consult(sql, [idUser]);
            return result[0].decksToStudy;
        } catch (error) {
            console.error("Erro ao contar decks para estudar: ", error.message);
            throw new Error("Erro ao contar decks para estudar.");
        }
    }

    async ResetStudiedDecksForNewDay(idUser, today) {
        try {
            const sql =
                "UPDATE progress SET studiedDecks = 0, lastStudyDate = ? WHERE idUser = ?";
            const result = await consult(sql, [today, idUser]);
            return result;
        } catch (error) {
            console.error(
                "Erro ao resetar studiedDecks para novo dia: ",
                error.message
            );
            throw new Error("Erro ao resetar studiedDecks para novo dia.");
        }
    }

    async IncrementStudiedDecks(idUser) {
        try {
            const sql =
                "UPDATE progress SET studiedDecks = studiedDecks + 1 WHERE idUser = ?";
            const result = await consult(sql, [idUser]);
            return result;
        } catch (error) {
            console.error("Erro ao incrementar studiedDecks: ", error.message);
            throw new Error("Erro ao incrementar studiedDecks.");
        }
    }

    async UpdateConsecutiveDays(idUser, consecutiveDays, lastStudyDate) {
        try {
            const sql =
                "UPDATE progress SET consecutiveDays = ?, lastStudyDate = ? WHERE idUser = ?";
            const result = await consult(sql, [
                consecutiveDays,
                lastStudyDate,
                idUser,
            ]);
            return result;
        } catch (error) {
            console.error(
                "Erro ao atualizar dias consecutivos: ",
                error.message
            );
            throw new Error("Erro ao atualizar dias consecutivos.");
        }
    }
}

export default new ProgressRepository();
