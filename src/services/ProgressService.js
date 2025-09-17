import ProgressRepository from "../repositories/ProgressRepository.js";

class ProgressService {
    async List(idUser) {
        try {
            // Primeiro verificar e resetar se for novo dia
            await this.CheckAndResetForNewDay(idUser);

            // Buscar os dados atualizados
            let progress = await ProgressRepository.FindByUserId(idUser);

            // Se não existir, criar um novo registro
            if (!progress) {
                await ProgressRepository.Create(idUser);
                progress = await ProgressRepository.FindByUserId(idUser);
            }

            // Buscar decks para estudar
            const decksToStudy = await ProgressRepository.GetDecksToStudy(
                idUser
            );

            return {
                consecutiveDays: progress.consecutiveDays || 0,
                studiedDecks: progress.studiedDecks || 0,
                decksToStudy: decksToStudy,
                lastStudyDate: progress.lastStudyDate,
                message: this.GetMotivationalMessage(
                    progress.consecutiveDays || 0
                ),
            };
        } catch (error) {
            console.error("Erro ao listar progresso: ", error.message);
            throw new Error("Erro ao listar progresso.");
        }
    }

    async CheckAndResetForNewDay(idUser) {
        try {
            const isNewDay = await this.IsNewDay(idUser);

            if (isNewDay) {
                const today = new Date().toISOString().split("T")[0];
                await ProgressRepository.ResetStudiedDecksForNewDay(
                    idUser,
                    today
                );
            }

            return isNewDay;
        } catch (error) {
            console.error("Erro ao verificar novo dia: ", error.message);
            return false;
        }
    }

    async IsNewDay(idUser) {
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

    async IncrementStudiedDecks(idUser) {
        try {
            await this.CheckAndResetForNewDay(idUser);
            await ProgressRepository.IncrementStudiedDecks(idUser);

            // Atualizar dias consecutivos se for um novo dia de estudo
            const today = new Date().toISOString().split("T")[0];
            const progress = await ProgressRepository.FindByUserId(idUser);

            if (!progress.lastStudyDate || progress.lastStudyDate !== today) {
                const newConsecutiveDays = (progress.consecutiveDays || 0) + 1;
                await ProgressRepository.UpdateConsecutiveDays(
                    idUser,
                    newConsecutiveDays,
                    today
                );
            }

            return true;
        } catch (error) {
            console.error("Erro ao incrementar studiedDecks: ", error.message);
            throw new Error("Erro ao incrementar studiedDecks.");
        }
    }

    GetMotivationalMessage(days) {
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
