import { Progress } from "../models/associations.js";

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

    async UpdateStudiedDecks(idUser, studiedDecks) {
        try {
            const [affectedRows] = await Progress.update(
                {
                    studiedDecks: studiedDecks,
                },
                {
                    where: { idUser },
                }
            );

            return { affectedRows };
        } catch (error) {
            console.error("Erro ao atualizar studiedDecks: ", error.message);
            throw new Error("Erro ao atualizar studiedDecks.");
        }
    }

    async UpdateConsecutiveDays(idUser, consecutiveDays, lastStudyDate = null) {
        try {
            const updateData = {
                consecutiveDays: consecutiveDays,
            };

            if (lastStudyDate !== null) {
                updateData.lastStudyDate =
                    typeof lastStudyDate === "string"
                        ? new Date(lastStudyDate)
                        : lastStudyDate;
            }

            const [affectedRows] = await Progress.update(updateData, {
                where: { idUser: idUser },
            });

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
