import { Deck, Subject, Card } from "../models/associations.js";
import { Op } from "sequelize";

class DeckRepository {
    async Create(idUser, idSubject, title) {
        try {
            const deck = await Deck.create({
                idUser,
                idSubject,
                title,
                nextReview: null,
            });

            // Retorna o deck criado com dados completos
            return await Deck.findByPk(deck.idDeck, {
                include: [
                    { model: Subject, as: "subject" },
                    { model: Card, as: "cards" },
                ],
            });
        } catch (error) {
            console.error("Erro ao criar deck: ", error.message);
            throw new Error("Erro ao criar deck.");
        }
    }

    async List(idUser) {
        try {
            return await Deck.findAll({
                where: { idUser },
                include: [
                    {
                        model: Subject,
                        as: "subject",
                        attributes: ["idSubject", "name", "color"],
                    },
                    {
                        model: Card,
                        as: "cards",
                        attributes: [
                            "idCard",
                            "question",
                            "answer",
                            "difficulty",
                        ],
                    },
                ],
                order: [["title", "ASC"]],
            });
        } catch (error) {
            console.error("Erro ao listar decks: ", error.message);
            throw new Error("Erro ao listar decks.");
        }
    }

    async Delete(idDeck) {
        try {
            const deck = await Deck.findByPk(idDeck);
            if (!deck) {
                throw new Error("Deck não encontrado.");
            }

            await deck.destroy();
            return { message: "Deck deletado com sucesso." };
        } catch (error) {
            console.error("Erro ao deletar deck: ", error.message);
            throw new Error("Erro ao deletar deck.");
        }
    }

    async CountCards(idDeck, idUser) {
        try {
            const deck = await Deck.findOne({
                where: {
                    idDeck,
                    idUser,
                },
                include: [
                    {
                        model: Card,
                        as: "cards",
                        attributes: [],
                    },
                ],
            });

            if (!deck) {
                throw new Error("Deck não encontrado.");
            }

            const count = await Card.count({
                where: { idDeck },
            });

            return [{ cards: count }];
        } catch (error) {
            console.error("Erro ao contar cards: ", error.message);
            throw new Error("Erro ao contar cards.");
        }
    }

    async UpdateNextReview(nextReview, idDeck) {
        try {
            const deck = await Deck.findByPk(idDeck);
            if (!deck) {
                throw new Error("Deck não encontrado.");
            }

            await deck.update({ nextReview });
            return deck;
        } catch (error) {
            console.error(
                "Erro ao atualizar data da próxima revisão do deck: ",
                error.message
            );
            throw new Error(
                "Erro ao atualizar data da próxima revisão do deck."
            );
        }
    }

    async FindById(idDeck) {
        try {
            return await Deck.findByPk(idDeck, {
                include: [
                    { model: Subject, as: "subject" },
                    { model: Card, as: "cards" },
                ],
            });
        } catch (error) {
            console.error("Erro ao buscar deck: ", error.message);
            throw new Error("Erro ao buscar deck.");
        }
    }
}

export default new DeckRepository();
