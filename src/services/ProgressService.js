import ProgressRepository from "../repositories/ProgressRepository.js";
import DeckService from "./DeckService.js";

class ProgressService {
    async List(idUser) {
        try {
            // Buscar ou criar progresso
            let progress = await ProgressRepository.FindByUserId(idUser);
            if (!progress) {
                await ProgressRepository.Create(idUser);
                progress = await ProgressRepository.FindByUserId(idUser);
            }

            // Verificar se é novo dia baseado na data atual vs lastStudyDate
            const isNewDay = await this.IsNewDay(idUser);

            // Se for novo dia, resetar studiedDecks para 0
            if (isNewDay) {
                console.log("🔄 Novo dia - resetando studiedDecks para 0");
                await ProgressRepository.UpdateStudiedDecks(idUser, 0);

                // Atualizar o objeto progress após reset
                progress = await ProgressRepository.FindByUserId(idUser);
            }

            // Verificar se precisa resetar dias consecutivos (mais de 1 dia sem estudar)
            const today = new Date();
            const lastStudyDate = progress.lastStudyDate
                ? new Date(progress.lastStudyDate)
                : null;

            let shouldReset = false;
            if (lastStudyDate) {
                // Calcula a diferença em dias, considerando o fuso horário
                const todayStart = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    today.getDate()
                );
                const lastStudyStart = new Date(
                    lastStudyDate.getFullYear(),
                    lastStudyDate.getMonth(),
                    lastStudyDate.getDate()
                );

                const diffTime = todayStart - lastStudyStart;
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                shouldReset = diffDays > 1;
            }

            if (shouldReset) {
                console.log(
                    "🔄 Resetando dias consecutivos (mais de 1 dia sem estudar)"
                );
                await ProgressRepository.UpdateConsecutiveDays(idUser, 0);

                // Atualizar o objeto progress após reset
                progress = await ProgressRepository.FindByUserId(idUser);
            }

            // Buscar decks para estudo
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

    async IsNewDay(idUser) {
        try {
            const progress = await ProgressRepository.FindByUserId(idUser);

            if (!progress || !progress.lastStudyDate) {
                return true;
            }

            const today = new Date();
            const lastStudyDate = new Date(progress.lastStudyDate);

            const todayDate = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate()
            );
            const lastStudyDay = new Date(
                lastStudyDate.getFullYear(),
                lastStudyDate.getMonth(),
                lastStudyDate.getDate()
            );

            return todayDate.getTime() !== lastStudyDay.getTime();
        } catch (error) {
            console.error("Erro ao verificar se é novo dia: ", error.message);
            return true;
        }
    }

    async UpdateProgress(idUser) {
        try {
            const progress = await ProgressRepository.FindByUserId(idUser);
            if (!progress) {
                throw new Error("Progresso não encontrado");
            }

            const today = new Date();

            // Incrementa studiedDecks
            const newStudiedDecks = progress.studiedDecks + 1;
            await ProgressRepository.UpdateStudiedDecks(
                idUser,
                newStudiedDecks
            );

            // Verifica se é novo dia para determinar se incrementa consecutiveDays
            const isNewDay = await this.IsNewDay(idUser);

            let newConsecutiveDays = progress.consecutiveDays;

            if (isNewDay) {
                // Se for novo dia, incrementa consecutiveDays
                newConsecutiveDays = progress.consecutiveDays + 1;
            }

            // Atualiza consecutiveDays e lastStudyDate
            await ProgressRepository.UpdateConsecutiveDays(
                idUser,
                newConsecutiveDays,
                today
            );
        } catch (error) {
            console.error("Erro ao atualizar progresso: ", error.message);
            throw new Error("Erro ao atualizar progresso.");
        }
    }

    GetMotivationalMessage(days) {
        if (!days || days === 0)
            return "Estude seus decks para começar uma nova sequência!";
        if (days === 1) return "Bom começo! 1 dia de estudo!";
        if (days === 7) return "Uma semana completa! Incrível!";
        if (days === 14) return "Duas semanas! Você é dedicado!";
        if (days === 30) return "Um mês inteiro! Você é inspirador!";
        if (days >= 100) return `${days} dias! Lenda viva!`;

        return `Foguinho ativo! ${days} dias consecutivos!`;
    }
}

export default new ProgressService();
