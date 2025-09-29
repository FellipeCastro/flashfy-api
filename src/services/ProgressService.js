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
            const decksToStudy = decks.filter((deck) => {
                if (!deck.nextReview) return false;

                const reviewDate = new Date(deck.nextReview);
                const diffTime = reviewDate - new Date();
                return diffTime < 0 || diffTime < 1000 * 60 * 60 * 24;
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

            const today = new Date().toISOString().split("T")[0];
            const lastStudyDate = new Date(progress.lastStudyDate)
                .toISOString()
                .split("T")[0];

            console.log(
                `🔍 IsNewDay - Último estudo: ${lastStudyDate}, Hoje: ${today}, É novo dia? ${
                    lastStudyDate !== today
                }`
            );

            return lastStudyDate !== today;
        } catch (error) {
            console.error("Erro ao verificar se é novo dia: ", error.message);
            return true;
        }
    }

    IsSameDay(date1, date2) {
        try {
            // Converte ambas as datas para o formato YYYY-MM-DD e compara
            const date1Formatted = new Date(date1).toISOString().split("T")[0];
            const date2Formatted = new Date(date2).toISOString().split("T")[0];

            console.log(
                `🔍 IsSameDay - Data1: ${date1Formatted}, Data2: ${date2Formatted}, São iguais? ${
                    date1Formatted === date2Formatted
                }`
            );

            return date1Formatted === date2Formatted;
        } catch (error) {
            console.error(
                "Erro ao verificar se é o mesmo dia: ",
                error.message
            );
            return false;
        }
    }

    async IncrementStudiedDecks(idUser) {
        try {
            const isNewDay = await this.IsNewDay(idUser);
            const today = new Date().toISOString().split("T")[0];

            console.log(`📅 Verificação - Novo dia: ${isNewDay}`);

            if (isNewDay) {
                // 🔄 APENAS SE FOR NOVO DIA: Atualizar dias consecutivos
                const progress = await ProgressRepository.FindByUserId(idUser);

                let newConsecutiveDays = 1;

                if (progress && progress.lastStudyDate) {
                    const lastDate = new Date(progress.lastStudyDate);
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);

                    // ✅ AGORA usando a mesma lógica de comparação
                    if (this.IsSameDay(lastDate, yesterday)) {
                        newConsecutiveDays =
                            (progress.consecutiveDays || 0) + 1;
                        console.log(
                            `🎯 Estudou ontem! Incrementando para: ${newConsecutiveDays}`
                        );
                    } else {
                        console.log(`🔄 Não estudou ontem. Resetando para: 1`);
                        newConsecutiveDays = 1;
                    }
                }

                // ✅ ATUALIZAR: dias consecutivos + data do último estudo
                await ProgressRepository.UpdateConsecutiveDays(
                    idUser,
                    newConsecutiveDays,
                    today
                );
                console.log(
                    `✅ Dias consecutivos atualizados: ${newConsecutiveDays}`
                );

                // ✅ RESETAR: studiedDecks para 0 (primeiro deck do dia)
                await ProgressRepository.ResetStudiedDecks(idUser);
            }

            // ✅ SEMPRE: Incrementar studiedDecks (se for novo dia: 0→1, se não: +1)
            await ProgressRepository.IncrementStudiedDecks(idUser);

            // Buscar valor atualizado para log
            const updatedProgress = await ProgressRepository.FindByUserId(
                idUser
            );
            console.log(
                `📊 Final - Estudados: ${updatedProgress.studiedDecks}, Dias: ${updatedProgress.consecutiveDays}, Último estudo: ${updatedProgress.lastStudyDate}`
            );

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
