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
                        const countResult = await DeckRepository.CountCards(
                            deck.idDeck,
                            idUser
                        );
                        return {
                            ...deck,
                            cards: countResult[0]?.cards || 0,
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
            console.error("Erro ao listas matérias: ", error.message);
            throw new Error("Erro ao listas matérias.");
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
}

export default new DeckService();
