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

            const decks = await DeckService.List(idUser)

            // Buscar decks para estudar
            const decksToStudy = await this.GetDecksToStudy(
                decks
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

    async GetDecksToStudy(decks) {
        try {
            // Filtra os decks que precisam ser estudados
            const decksToStudy = decks.filter((deck) => {
                if (!deck.nextReview) {
                    return false; // Deck sem data de revisão não precisa ser estudado
                }

                const reviewDate = new Date(deck.nextReview);
                const today = new Date();

                // Remove as horas para comparar apenas a data
                reviewDate.setHours(0, 0, 0, 0);
                today.setHours(0, 0, 0, 0);

                // Deck precisa ser estudado se a data de revisão for hoje ou já passou
                return reviewDate <= today;
            });

            return decksToStudy.length; // Retorna a quantidade de decks para estudar
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

            // Verifica se é um novo dia de estudo
            const isNewDay = await this.IsNewDay(idUser);

            if (isNewDay) {
                const today = new Date();
                const progress = await ProgressRepository.FindByUserId(idUser);
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
