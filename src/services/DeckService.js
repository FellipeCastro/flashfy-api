import DeckRepository from "../repositories/DeckRepository.js";
import CardService from "./CardService.js";
import ProgressService from "./ProgressService.js";

class DeckService {
    async Create(idUser, idSubject, title) {
        try {
            const result = await DeckRepository.Create(
                idUser,
                idSubject,
                title
            );
            return result;
        } catch (error) {
            console.error("Erro ao criar deck: ", error.message);
            throw new Error("Erro ao criar deck.");
        }
    }

    async List(idUser) {
        try {
            const result = await DeckRepository.List(idUser);
            return result;
        } catch (error) {
            console.error("Erro ao listar decks: ", error.message);
            throw new Error("Erro ao listar decks.");
        }
    }

    async Delete(idDeck) {
        try {
            return await DeckRepository.Delete(idDeck);
        } catch (error) {
            console.error("Erro ao deletar deck: ", error.message);
            throw new Error("Erro ao deletar deck.");
        }
    }

    async UpdateNextReview(idDeck) {
        try {
            // Busca o deck com os cards para calcular a dificuldade
            const deck = await DeckRepository.FindById(idDeck);

            if (!deck || !deck.cards) {
                throw new Error("Deck não encontrado ou sem cards.");
            }

            const difficulties = deck.cards.map((card) => card.difficulty || 4);
            const average = Math.round(
                difficulties.reduce((sum, value) => sum + value, 0) /
                    difficulties.length
            );

            const daysToAdd =
                {
                    1: 7, // Muito fácil
                    2: 5, // Fácil
                    3: 3, // Difícil
                    4: 1, // Muito difícil
                }[average] || 0;

            const currentDate = new Date();
            const newReviewDate = new Date(currentDate);
            newReviewDate.setDate(currentDate.getDate() + daysToAdd);

            // Formata para YYYY-MM-DD, com as horas 
            const formattedDate = newReviewDate.toISOString();

            const result = await DeckRepository.UpdateNextReview(
                formattedDate,
                idDeck
            );
            return result;
        } catch (error) {
            console.error(
                "Erro ao calcular/atualizar data da próxima revisão: ",
                error.message
            );
            throw new Error("Erro ao calcular data da próxima revisão.");
        }
    }

    async Study(idUser, idDeck, difficulties) {
        try {
            // Primeiro acha o deck pelo id
            const deck = await DeckRepository.FindById(idDeck);

            // Validação do deck
            if (!deck) {
                throw new Error("Deck não encontrado.");
            }

            if (!deck.cards || deck.cards.length === 0) {
                throw new Error("Deck não possui cards para estudar.");
            }

            if (difficulties.length !== deck.cards.length) {
                throw new Error(
                    "Quantidade de dificuldades diferente da quantidade de cards."
                );
            }

            // Atualiza a dificuldade de cada card
            const updatePromises = deck.cards.map(async (card, index) => {
                return await CardService.UpdateDifficulty(
                    difficulties[index],
                    card.idCard
                );
            });

            // Aguarda todas as atualizações dos cards
            await Promise.all(updatePromises);

            // Atualiza a data da próxima revisão do deck
            await this.UpdateNextReview(idDeck);

            // Atualiza os dados de progresso
            await ProgressService.UpdateProgress(idUser);

            // Retorna mensagem de sucesso
            return {
                message: "Deck estudado com sucesso!"
            };
        } catch (error) {
            console.error("Erro ao estudar deck: ", error.message);
            throw new Error("Erro ao estudar deck.");
        }
    }
}

export default new DeckService();
