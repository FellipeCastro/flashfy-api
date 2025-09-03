import ProgressRepository from "../repositories/ProgressRepository.js";

class ProgressService {
    constructor() {
        this.setupDailyCheck();
    }

    setupDailyCheck() {
        // Verificação periódica (opcional - para logs)
        setInterval(() => {
            console.log(
                "⏰ Verificação diária ativa - " +
                    new Date().toLocaleTimeString()
            );
        }, 1000 * 60 * 60); // A cada hora
    }

    async List(idUser) {
        try {
            // Primeiro verificar e resetar se for novo dia
            await this.checkAndResetForNewDay(idUser);

            // Depois buscar os dados atualizados
            let progress = await ProgressRepository.FindByUserId(idUser);

            if (!progress) {
                await ProgressRepository.Create(idUser);
                progress = {
                    consecutiveDays: 0,
                    studiedDecks: 0,
                    lastStudyDate: null,
                };
            }

            let decksToStudy = 0;
            try {
                decksToStudy = await ProgressRepository.getDecksToStudy(idUser);
            } catch (error) {
                console.warn("Método getDecksToStudy não disponível");
            }

            return {
                consecutiveDays: progress.consecutiveDays || 0,
                studiedDecks: progress.studiedDecks || 0,
                decksToStudy: decksToStudy,
                lastStudyDate: progress.lastStudyDate,
                message: this.getMotivationalMessage(
                    progress.consecutiveDays || 0
                ),
            };
        } catch (error) {
            console.error("Erro ao listar progresso: ", error.message);
            throw new Error("Erro ao listar progresso.");
        }
    }

    async UpdateConsecutiveDays(idUser) {
        try {
            let progress = await ProgressRepository.FindByUserId(idUser);

            if (!progress) {
                await ProgressRepository.Create(idUser);
                progress = {
                    consecutiveDays: 0,
                    lastStudyDate: null,
                    studiedDecks: 0,
                };
            }

            const today = new Date().toISOString().split("T")[0];
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayFormatted = yesterday.toISOString().split("T")[0];

            let newConsecutiveDays = progress.consecutiveDays || 0;

            if (progress.lastStudyDate) {
                const lastDate = new Date(progress.lastStudyDate);
                const lastDateFormatted = lastDate.toISOString().split("T")[0];

                if (lastDateFormatted === yesterdayFormatted) {
                    newConsecutiveDays = (progress.consecutiveDays || 0) + 1;
                } else if (lastDateFormatted !== today) {
                    newConsecutiveDays = 1;
                }
            } else {
                newConsecutiveDays = 1;
            }

            await ProgressRepository.UpdateConsecutiveDays(
                newConsecutiveDays,
                today,
                idUser
            );

            return {
                consecutiveDays: newConsecutiveDays,
                lastStudyDate: today,
                message: this.getMotivationalMessage(newConsecutiveDays),
            };
        } catch (error) {
            console.error(
                "Erro ao atualizar dias consecutivos: ",
                error.message
            );
            throw new Error("Erro ao atualizar dias consecutivos.");
        }
    }

    async IncrementStudiedDecks(idUser) {
        try {
            const isNewDay = await this.checkAndResetForNewDay(idUser);

            let studiedDecksValue;

            if (isNewDay) {
                studiedDecksValue = 1;
            } else {
                const progress = await ProgressRepository.FindByUserId(idUser);
                studiedDecksValue = (progress.studiedDecks || 0) + 1;
            }

            await ProgressRepository.SetStudiedDecks(studiedDecksValue, idUser);

            return {
                studiedDecks: studiedDecksValue,
                isNewDay: isNewDay,
                message: isNewDay
                    ? "Novo dia! Primeiro deck estudado."
                    : `Deck estudado! Total hoje: ${studiedDecksValue}`,
            };
        } catch (error) {
            console.error("Erro ao atualizar decks estudados: ", error.message);
            throw new Error("Erro ao atualizar decks estudados.");
        }
    }

    async checkAndResetForNewDay(idUser) {
        try {
            const isNewDay = await this.isNewDay(idUser);

            if (isNewDay) {
                const today = new Date().toISOString().split("T")[0];
                await ProgressRepository.ResetStudiedDecksForNewDay(
                    idUser,
                    today
                );
                console.log(
                    `📅 Novo dia! studiedDecks resetado para 0 para usuário ${idUser}`
                );
            }

            return isNewDay;
        } catch (error) {
            console.error("Erro ao verificar novo dia: ", error.message);
            return false;
        }
    }

    async isNewDay(idUser) {
        try {
            const progress = await ProgressRepository.FindByUserId(idUser);

            if (!progress || !progress.lastStudyDate) {
                return true;
            }

            const today = new Date().toISOString().split("T")[0];
            const lastStudyDate = new Date(progress.lastStudyDate)
                .toISOString()
                .split("T")[0];

            return lastStudyDate !== today;
        } catch (error) {
            console.error("Erro ao verificar se é novo dia: ", error.message);
            return true;
        }
    }

    getMotivationalMessage(days) {
        if (!days || days === 0) return "Vamos começar! Hoje é um novo dia!";
        if (days === 1) return "Bom começo! Continue assim!";
        if (days === 3) return "3 dias seguidos! Você está no caminho certo!";
        if (days === 7) return "Uma semana completa! Incrível!";
        if (days === 14) return "Duas semanas! Você é dedicado!";
        if (days === 30) return "Um mês inteiro! Você é inspirador!";
        if (days >= 100) return `${days} dias! Lenda viva!`;

        return `Continue a jornada! ${days} dias consecutivos!`;
    }
}

export default new ProgressService();
