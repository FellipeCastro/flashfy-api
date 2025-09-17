import DeckRepository from "../repositories/DeckRepository.js";

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
            // Agora o DeckRepository.List já retorna os cards incluídos
            const decks = await DeckRepository.List(idUser);

            // Formata a resposta para manter compatibilidade
            const result = decks.map((deck) => {
                return {
                    ...deck.toJSON(),
                    cards: deck.cards || [], // Já vem do include
                };
            });

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

            // Formata para YYYY-MM-DD
            const formattedDate = newReviewDate.toISOString().split("T")[0];

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

    async GetById(idDeck) {
        try {
            const deck = await DeckRepository.FindById(idDeck);
            return deck;
        } catch (error) {
            console.error("Erro ao buscar deck: ", error.message);
            throw new Error("Erro ao buscar deck.");
        }
    }
}

export default new DeckService();
