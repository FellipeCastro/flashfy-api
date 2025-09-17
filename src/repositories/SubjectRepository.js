import { Subject, User, Deck } from "../models/associations.js";

class SubjectRepository {
    async Create(idUser, name, color) {
        try {
            const subject = await Subject.create({
                idUser,
                name,
                color,
            });

            // Retorna a matéria criada com dados completos
            return await Subject.findByPk(subject.idSubject, {
                include: [{ model: User, as: "user" }],
            });
        } catch (error) {
            console.error("Erro ao criar matéria: ", error.message);
            throw new Error("Erro ao criar matéria.");
        }
    }

    async List(idUser) {
        try {
            return await Subject.findAll({
                where: { idUser },
                include: [
                    {
                        model: Deck,
                        as: "decks",
                        attributes: ["idDeck"],
                    },
                ],
                order: [["name", "ASC"]],
            });
        } catch (error) {
            console.error("Erro ao listar matérias: ", error.message);
            throw new Error("Erro ao listar matérias.");
        }
    }

    async Delete(idSubject) {
        try {
            const subject = await Subject.findByPk(idSubject);
            if (!subject) {
                throw new Error("Matéria não encontrada.");
            }

            await subject.destroy();
            return { message: "Matéria deletada com sucesso." };
        } catch (error) {
            console.error("Erro ao deletar matéria: ", error.message);
            throw new Error("Erro ao deletar matéria.");
        }
    }

    async FindById(idSubject) {
        try {
            return await Subject.findByPk(idSubject, {
                include: [
                    { model: User, as: "user" },
                    { model: Deck, as: "decks" },
                ],
            });
        } catch (error) {
            console.error("Erro ao buscar matéria: ", error.message);
            throw new Error("Erro ao buscar matéria.");
        }
    }
}

export default new SubjectRepository();
