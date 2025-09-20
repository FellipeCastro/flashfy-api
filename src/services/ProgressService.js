import ProgressRepository from "../repositories/ProgressRepository.js";
import DeckService from "./DeckService.js";

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

            const decks = await DeckService.List(idUser);
            const decksToStudy = await this.GetDecksToStudy(decks);

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

    async GetDecksToStudy(decks) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const decksToStudy = decks.filter((deck) => {
                if (!deck.nextReview) return false; // Deck sem data não precisa ser estudado

                const reviewDate = new Date(deck.nextReview);
                reviewDate.setHours(0, 0, 0, 0);

                return reviewDate <= today;
            });

            return decksToStudy.length;
        } catch (error) {
            console.error("Erro ao contar decks para estudar: ", error.message);
            throw new Error("Erro ao contar decks para estudar.");
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

            const today = new Date();
            const lastStudyDate = new Date(progress.lastStudyDate);

            // Compara apenas dia, mês e ano
            return !this.IsSameDay(today, lastStudyDate);
        } catch (error) {
            console.error("Erro ao verificar se é novo dia: ", error.message);
            return true;
        }
    }

    async ShouldResetConsecutiveDays(idUser) {
        try {
            const progress = await ProgressRepository.FindByUserId(idUser);

            if (!progress || !progress.lastStudyDate) {
                return false; // Não resetar se nunca estudou
            }

            const today = new Date();
            const lastStudyDate = new Date(progress.lastStudyDate);

            // Calcula a diferença em dias
            const diffTime = Math.abs(today - lastStudyDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Se passou mais de 1 dia desde o último estudo, reseta
            return diffDays > 1;
        } catch (error) {
            console.error("Erro ao verificar reset de dias: ", error.message);
            return false;
        }
    }

    IsSameDay(date1, date2) {
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    }

    async IncrementStudiedDecks(idUser) {
        try {
            // Verifica se precisa resetar dias consecutivos (mais de 1 dia sem estudar)
            const shouldReset = await this.ShouldResetConsecutiveDays(idUser);

            if (shouldReset) {
                console.log(
                    "🔄 Resetando dias consecutivos (mais de 1 dia sem estudar)"
                );
                await ProgressRepository.UpdateConsecutiveDays(
                    idUser,
                    0,
                    new Date()
                );
            }

            // Verifica se é novo dia e reseta studiedDecks se necessário
            const isNewDay = await this.CheckAndResetForNewDay(idUser);

            // Incrementa os decks estudados
            await ProgressRepository.IncrementStudiedDecks(idUser);

            if (isNewDay) {
                // Se é um novo dia, incrementa os dias consecutivos
                const progress = await ProgressRepository.FindByUserId(idUser);

                // Se resetou acima, começa do 1, senão incrementa normalmente
                const newConsecutiveDays = shouldReset
                    ? 1
                    : (progress.consecutiveDays || 0) + 1;
                const today = new Date();

                await ProgressRepository.UpdateConsecutiveDays(
                    idUser,
                    newConsecutiveDays,
                    today
                );

                console.log(
                    `✅ Novo dia! Dias consecutivos: ${newConsecutiveDays}`
                );
            } else {
                // Se não é novo dia, apenas atualiza a data do último estudo
                const progress = await ProgressRepository.FindByUserId(idUser);
                const today = new Date();

                await ProgressRepository.UpdateConsecutiveDays(
                    idUser,
                    progress.consecutiveDays, // Mantém os dias consecutivos
                    today // Atualiza apenas a data
                );

                console.log(
                    `📚 Mesmo dia! Apenas atualizando data. Dias: ${progress.consecutiveDays}`
                );
            }

            return true;
        } catch (error) {
            console.error("Erro ao incrementar studiedDecks: ", error.message);
            throw new Error("Erro ao incrementar studiedDecks.");
        }
    }

    GetMotivationalMessage(days) {
        if (!days || days === 0)
            return "Estude seus decks para começar uma nova sequência!";
        if (days === 1) return "Bom começo! Primeiro dia de estudo!";
        if (days === 3) return "3 dias seguidos! Você está no caminho certo!";
        if (days === 7) return "Uma semana completa! Incrível!";
        if (days === 14) return "Duas semanas! Você é dedicado!";
        if (days === 30) return "Um mês inteiro! Você é inspirador!";
        if (days >= 100) return `${days} dias! Lenda viva!`;

        return `Continue a jornada! ${days} dias consecutivos!`;
    }
}

export default new ProgressService();
