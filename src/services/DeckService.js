import CardRepository from "../repositories/CardRepository.js";
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
            const decks = await DeckRepository.List(idUser);
            const result = await Promise.all(
                decks.map(async (deck) => {
                    try {
                        const cardsResult = await CardRepository.List(
                            deck.idDeck
                        );
                        return {
                            ...deck,
                            cards: cardsResult,
                        };
                    } catch (error) {
                        console.error(
                            `Erro ao contar cards do deck ${deck.idDeck}:`,
                            error
                        );
                        return {
                            ...deck,
                            cards: 0,
                        };
                    }
                })
            );

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
            const cards = await CardRepository.List(idDeck);
            const difficulties = await Promise.all(
                cards.map(async (card) => card.difficulty || 4)
            );
            const average = Math.round(
                difficulties.reduce((sum, value) => sum + value, 0) /
                    difficulties.length
            );
            const daysToAdd =
                {
                    1: 7,
                    2: 5,
                    3: 3,
                    4: 1,
                }[average] || 0;
            const currentDate = new Date();
            const newReviewDate = new Date(currentDate);
            newReviewDate.setDate(currentDate.getDate() + daysToAdd);
            const formattedDate = newReviewDate.toISOString().split("T")[0];

            try {
                const result = await DeckRepository.UpdateNextReview(
                    formattedDate,
                    idDeck
                );
                return result;
            } catch (error) {
                console.error(
                    "Erro ao atualizar data da próxima revisão: ",
                    error.message
                );
                throw new Error("Erro ao atualizar data da próxima revisão.");
            }
        } catch (error) {
            console.error(
                "Erro ao calcular data da próxima revisão: ",
                error.message
            );
            throw new Error("Erro ao calcular data da próxima revisão.");
        }
    }
}

export default new DeckService();
