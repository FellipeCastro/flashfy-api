import { User, Progress, Deck, Subject } from "../models/associations.js";

class UserRepository {
    async ListByEmail(email) {
        try {
            return await User.findOne({
                where: { email },
                include: [
                    {
                        model: Progress,
                        as: "progress",
                    },
                ],
            });
        } catch (error) {
            console.error("Erro ao buscar usuário por e-mail: ", error.message);
            throw new Error("Erro ao buscar usuário por email.");
        }
    }

    async Register(name, email, password) {
        try {
            const user = await User.create({
                name,
                email,
                password,
            });

            // Cria progresso automaticamente para o novo usuário
            await Progress.create({
                idUser: user.idUser,
                consecutiveDays: 0,
                studiedDecks: 0,
                decksToStudy: 0,
                lastStudyDate: null,
            });

            // Retorna usuário sem a senha
            return await User.findByPk(user.idUser, {
                attributes: { exclude: ["password"] },
                include: [
                    {
                        model: Progress,
                        as: "progress",
                    },
                ],
            });
        } catch (error) {
            console.error("Erro ao registrar usuário: ", error.message);
            throw new Error("Erro ao registrar usuário.");
        }
    }

    async Profile(idUser) {
        try {
            return await User.findByPk(idUser, {
                attributes: { exclude: ["password"] },
                include: [
                    {
                        model: Progress,
                        as: "progress",
                    },
                    {
                        model: Deck,
                        as: "decks",
                        include: [
                            {
                                model: Subject,
                                as: "subject",
                            },
                        ],
                    },
                    {
                        model: Subject,
                        as: "subjects",
                    },
                ],
            });
        } catch (error) {
            console.error("Erro ao buscar perfil: ", error.message);
            throw new Error("Erro ao buscar perfil.");
        }
    }

    async FindById(idUser) {
        try {
            return await User.findByPk(idUser, {
                attributes: { exclude: ["password"] },
            });
        } catch (error) {
            console.error("Erro ao buscar usuário: ", error.message);
            throw new Error("Erro ao buscar usuário.");
        }
    }
}

export default new UserRepository();
