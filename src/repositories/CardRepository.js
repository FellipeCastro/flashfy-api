import { Card, Deck } from "../models/associations.js";

class CardRepository {
    async Create(idDeck, question, answer) {
        try {
            const card = await Card.create({
                idDeck,
                question,
                answer,
                difficulty: null,
            });

            // Retorna o card criado com dados completos
            return await Card.findByPk(card.idCard, {
                include: [{ model: Deck, as: "deck" }],
            });
        } catch (error) {
            console.error("Erro ao criar card: ", error.message);
            throw new Error("Erro ao criar card.");
        }
    }

    async Delete(idCard) {
        try {
            const card = await Card.findByPk(idCard);
            if (!card) {
                throw new Error("Card não encontrado.");
            }

            await card.destroy();
            return { message: "Card deletado com sucesso." };
        } catch (error) {
            console.error("Erro ao deletar card: ", error.message);
            throw new Error("Erro ao deletar card.");
        }
    }

    async UpdateDifficulty(difficulty, idCard) {
        try {
            const card = await Card.findByPk(idCard);
            if (!card) {
                throw new Error("Card não encontrado.");
            }

            await card.update({ difficulty });
            return card;
        } catch (error) {
            console.error(
                "Erro ao atualizar dificuldade do card: ",
                error.message
            );
            throw new Error("Erro ao atualizar dificuldade do card.");
        }
    }

    async FindById(idCard) {
        try {
            return await Card.findByPk(idCard, {
                include: [{ model: Deck, as: "deck" }],
            });
        } catch (error) {
            console.error("Erro ao buscar card: ", error.message);
            throw new Error("Erro ao buscar card.");
        }
    }
}

export default new CardRepository();
