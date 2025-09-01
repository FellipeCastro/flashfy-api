import ProgressRepository from "../repositories/ProgressRepository.js";

class ProgressService {
    async UpdateConsecutiveDays(idUser) {
        try {
            // Buscar o progresso do usuário
            let progress = await ProgressRepository.FindByUserId(idUser);

            // Se não existir, criar um registro
            if (!progress) {
                await ProgressRepository.Create(idUser);
                progress = { consecutiveDays: 0, lastStudyDate: null };
            }

            const today = new Date().toISOString().split("T")[0]; // Formato YYYY-MM-DD
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayFormatted = yesterday.toISOString().split("T")[0];

            let newConsecutiveDays = 1; // Valor padrão para primeiro dia

            if (progress.lastStudyDate) {
                const lastDate = new Date(progress.lastStudyDate);
                const lastDateFormatted = lastDate.toISOString().split("T")[0];

                // Verificar se estudou ontem (consecutivo)
                if (lastDateFormatted === yesterdayFormatted) {
                    newConsecutiveDays = progress.consecutiveDays + 1;
                }
                // Verificar se já estudou hoje (não incrementar)
                else if (lastDateFormatted === today) {
                    newConsecutiveDays = progress.consecutiveDays;
                }
                // Se não estudou ontem nem hoje, reiniciar contagem
                else {
                    newConsecutiveDays = 0;
                }
            }

            // Atualizar no banco de dados
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
            // Primeiro verificar se é um novo dia
            const isNewDay = await this.isNewDay(idUser);

            let studiedDecksValue;

            if (isNewDay) {
                // Se for novo dia, resetar para 1
                studiedDecksValue = 1;
                // Atualizar a data do último estudo para hoje
                const today = new Date().toISOString().split("T")[0];
                await ProgressRepository.UpdateLastStudyDate(today, idUser);
            } else {
                // Se não for novo dia, incrementar normalmente
                // Primeiro buscar o valor atual
                const progress = await ProgressRepository.FindByUserId(idUser);
                studiedDecksValue = progress.studiedDecks + 1;
            }

            // Atualizar no banco de dados
            const result = await ProgressRepository.SetStudiedDecks(
                studiedDecksValue,
                idUser
            );
            return result;
        } catch (error) {
            console.error("Erro ao atualizar decks estudados: ", error.message);
            throw new Error("Erro ao atualizar decks estudados.");
        }
    }

    async isNewDay(idUser) {
        try {
            // Buscar o progresso do usuário
            const progress = await ProgressRepository.FindByUserId(idUser);

            // Se não existir registro, é considerado novo dia
            if (!progress || !progress.lastStudyDate) {
                return true;
            }

            const today = new Date().toISOString().split("T")[0];
            const lastStudyDate = new Date(progress.lastStudyDate)
                .toISOString()
                .split("T")[0];

            // Se a última data de estudo for diferente de hoje, é novo dia
            return lastStudyDate !== today;
        } catch (error) {
            console.error("Erro ao verificar se é novo dia: ", error.message);
            throw new Error("Erro ao verificar se é novo dia.");
        }
    }

    getMotivationalMessage(days) {
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
