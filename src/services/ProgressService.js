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

            // Verificar se é novo dia
            const isNewDay = await this.IsNewDay(idUser);

            // Se for novo dia, resetar studiedDecks para 0
            if (isNewDay) {
                await ProgressRepository.UpdateStudiedDecks(idUser, 0);
                console.log("🔄 Novo dia - resetando studiedDecks para 0");

                // Atualizar o objeto progress após reset
                progress = await ProgressRepository.FindByUserId(idUser);
            }

            // Verificar se precisa resetar dias consecutivos (mais de 1 dia sem estudar)
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

            return !this.IsSameDay(today, lastStudyDate);
        } catch (error) {
            console.error("Erro ao verificar se é novo dia: ", error.message);
            return true;
        }
    }

    IsSameDay(date1, date2) {
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    }

    async ShouldResetConsecutiveDays(idUser) {
        try {
            const progress = await ProgressRepository.FindByUserId(idUser);

            if (!progress || !progress.lastStudyDate) {
                return false;
            }

            const today = new Date();
            const lastStudyDate = new Date(progress.lastStudyDate);

            const diffTime = Math.abs(today - lastStudyDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return diffDays > 1;
        } catch (error) {
            console.error("Erro ao verificar reset de dias: ", error.message);
            return false;
        }
    }

    async UpdateProgress(idUser) {
        try {
            // Busca o progresso atual (já com os resets feitos no List)
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
            let newConsecutiveDays;

            if (isNewDay) {
                // Se for novo dia, começa do 1 (primeiro estudo do dia)
                newConsecutiveDays = 1;
                console.log("✅ Primeiro estudo do dia - consecutiveDays: 1");
            } else {
                // Se não for novo dia, mantém os dias consecutivos atuais
                newConsecutiveDays = progress.consecutiveDays;
                console.log(
                    `📚 Estudo no mesmo dia - mantendo consecutiveDays: ${newConsecutiveDays}`
                );
            }

            // Atualiza consecutiveDays e lastStudyDate
            await ProgressRepository.UpdateConsecutiveDays(
                idUser,
                newConsecutiveDays,
                today
            );

            return {
                studiedDecks: newStudiedDecks,
                consecutiveDays: newConsecutiveDays,
                lastStudyDate: today,
                isNewDay: isNewDay,
            };
        } catch (error) {
            console.error("Erro ao atualizar progresso: ", error.message);
            throw new Error("Erro ao atualizar progresso.");
        }
    }

    GetMotivationalMessage(days) {
        if (!days || days === 0)
            return "Estude seus decks para começar uma nova sequência!";
        if (days === 1) return "Bom começo! Primeiro dia de estudo!";
        if (days === 7) return "Uma semana completa! Incrível!";
        if (days === 14) return "Duas semanas! Você é dedicado!";
        if (days === 30) return "Um mês inteiro! Você é inspirador!";
        if (days >= 100) return `${days} dias! Lenda viva!`;

        return `Foguinho ativo! ${days} dias consecutivos!`;
    }
}

export default new ProgressService();
