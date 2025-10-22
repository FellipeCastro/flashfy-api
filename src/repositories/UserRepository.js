import { User, Progress, Deck, Card, Subject } from "../models/associations.js";

class UserRepository {
    async ListByEmail(email) {
        try {
            return await User.findOne({
                where: { email }
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

    async RegisterWithGoogle(name, email, googleId) {
        try {
            // Criar usuário sem senha
            const user = await User.create({
                name,
                email,
                password: null, // Usuários do Google não têm senha
                googleId,
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
            console.error(
                "Erro ao registrar usuário com Google: ",
                error.message
            );
            throw new Error("Erro ao registrar usuário com Google.");
        }
    }

    async UpdateGoogleId(idUser, googleId) {
        try {
            await User.update({ googleId }, { where: { idUser } });

            return await User.findByPk(idUser, {
                attributes: { exclude: ["password"] },
                include: [
                    {
                        model: Progress,
                        as: "progress",
                    },
                ],
            });
        } catch (error) {
            console.error("Erro ao atualizar Google ID: ", error.message);
            throw new Error("Erro ao atualizar Google ID.");
        }
    }

    async Profile(idUser) {
        try {
            const user = await User.findByPk(idUser, {
                attributes: { exclude: ["password"] },
                include: [
                    {
                        model: Progress,
                        as: "progress",
                    },
                ],
            });

            if (!user) {
                throw new Error("Usuário não encontrado.");
            }

            // Buscar contagens separadamente
            const decksCount = await Deck.count({
                where: { idUser },
            });

            const subjectsCount = await Subject.count({
                where: { idUser },
            });

            const cardsCount = await Card.count({
                include: [
                    {
                        model: Deck,
                        as: "deck",
                        where: { idUser },
                    },
                ],
            });

            // Formatar resposta
            return {
                idUser: user.idUser,
                name: user.name,
                email: user.email,
                progress: user.progress,
                decks: decksCount,
                subjects: subjectsCount,
                cards: cardsCount,
            };
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

    async Edit(name, email, password, idUser) {
        try {
            // Preparar dados para atualização
            const updateData = {};

            if (name) updateData.name = name;
            if (email) updateData.email = email;
            if (password) updateData.password = password;

            // Verificar se há dados para atualizar
            if (Object.keys(updateData).length === 0) {
                throw new Error("Nenhum dado fornecido para atualização.");
            }

            // Atualizar usuário
            const [affectedRows] = await User.update(updateData, {
                where: { idUser },
            });

            if (affectedRows === 0) {
                throw new Error("Usuário não encontrado.");
            }

            // Retornar usuário atualizado (sem senha)
            return await User.findByPk(idUser, {
                attributes: { exclude: ["password"] },
                include: [
                    {
                        model: Progress,
                        as: "progress",
                    },
                ],
            });
        } catch (error) {
            console.error("Erro ao editar perfil do usuário: ", error.message);
            throw new Error("Erro ao editar perfil do usuário.");
        }
    }

    async Delete(idUser) {
        try {
            // Verificar se o usuário existe primeiro
            const user = await User.findByPk(idUser);
            if (!user) {
                throw new Error("Usuário não encontrado.");
            }

            // Deletar usuário (as associações CASCADE devem lidar com o resto)
            await User.destroy({
                where: { idUser },
            });

            return {
                success: true,
                message:
                    "Usuário e todos os dados associados foram excluídos com sucesso.",
            };
        } catch (error) {
            console.error("Erro ao excluir perfil do usuário: ", error.message);
            throw new Error("Erro ao excluir perfil do usuário.");
        }
    }
}

export default new UserRepository();
