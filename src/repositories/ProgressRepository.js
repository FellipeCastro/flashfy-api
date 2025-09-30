import { Progress, Deck } from "../models/associations.js";
import { Op } from "sequelize";

class ProgressRepository {
    async FindByUserId(idUser) {
        try {
            return await Progress.findOne({
                where: { idUser },
            });
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
            return await Progress.create({
                idUser,
                consecutiveDays: 0,
                studiedDecks: 0,
                decksToStudy: 0,
                lastStudyDate: null,
            });
        } catch (error) {
            console.error(
                "Erro ao criar registro de progresso: ",
                error.message
            );
            throw new Error("Erro ao criar registro de progresso.");
        }
    }

    async ResetStudiedDecksForNewDay(idUser, today) {
        try {
            const [affectedRows] = await Progress.update(
                {
                    studiedDecks: 0,
                    lastStudyDate: today,
                },
                {
                    where: { idUser },
                }
            );

            return { affectedRows };
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
            const [affectedRows] = await Progress.increment("studiedDecks", {
                by: 1,
                where: { idUser },
            });

            return { affectedRows };
        } catch (error) {
            console.error("Erro ao incrementar studiedDecks: ", error.message);
            throw new Error("Erro ao incrementar studiedDecks.");
        }
    }

    async UpdateConsecutiveDays(idUser, consecutiveDays, lastStudyDate) {
        try {
            // Se lastStudyDate for uma string, converte para Date
            const studyDate =
                typeof lastStudyDate === "string"
                    ? new Date(lastStudyDate)
                    : lastStudyDate;

            const [affectedRows] = await Progress.update(
                {
                    consecutiveDays: consecutiveDays,
                    lastStudyDate: studyDate,
                },
                {
                    where: { idUser: idUser },
                }
            );

            return { affectedRows };
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
