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

    getMotivationalMessage(days) {
        if (days === 1) return "Bom começo! Continue assim!";
        if (days === 3) return "3 dias seguidos! Você está no caminho certo!";
        if (days === 7) return "Uma semana completa! Incrível!";
        if (days === 14) return "Duas semanas! Você é dedicado!";
        if (days === 30) return "Um mês inteiro! Você é inspirador!";
        if (days >= 100) return `${days} dias! Lenda viva!`;

        return `Continue a jornada! ${days} dias consecutivos!`;
    }

    async IncrementStudiedDecks(idUser) {
        try {
            const result = await ProgressRepository.IncrementStudiedDecks(
                idUser
            );
            return result;
        } catch (error) {
            console.error("Erro ao atualizar decks estudados: ", error.message);
            throw new Error("Erro ao atualizar decks estudados.");
        }
    }
}

export default new ProgressService();
