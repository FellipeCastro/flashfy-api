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

    async UpdateConsecutiveDays(consecutiveDays, lastStudyDate, idUser) {
        try {
            const sql =
                "UPDATE progress SET consecutiveDays = ?, lastStudyDate = ? WHERE idUser = ?";
            await consult(sql, [consecutiveDays, lastStudyDate, idUser]);
        } catch (error) {
            console.error(
                "Erro ao atualizar dias consecutivos: ",
                error.message
            );
            throw new Error("Erro ao atualizar dias consecutivos.");
        }
    }

    async UpdateLastStudyDate(lastStudyDate, idUser) {
        try {
            const sql =
                "UPDATE progress SET lastStudyDate = ? WHERE idUser = ?";
            await consult(sql, [lastStudyDate, idUser]);
        } catch (error) {
            console.error(
                "Erro ao atualizar data do último estudo: ",
                error.message
            );
            throw new Error("Erro ao atualizar data do último estudo.");
        }
    }

    async SetStudiedDecks(studiedDecks, idUser) {
        try {
            const sql =
                "UPDATE progress SET studiedDecks = ? WHERE idUser = ?";
            await consult(sql, [studiedDecks, idUser]);
        } catch (error) {
            console.error(
                "Erro ao atualizar decks estudados: ",
                error.message
            );
            throw new Error("Erro ao atualizar decks estudados.");
        }
    }
}

export default new ProgressRepository();
