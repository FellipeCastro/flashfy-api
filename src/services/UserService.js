import bcrypt from "bcrypt";
import Token from "../middleware/token.js";
import { defaultSubjects } from "../constants/defaultSubjects.js";
import SubjectService from "./SubjectService.js";
import UserRepository from "../repositories/UserRepository.js";

class UserService {
    async Register(name, email, password) {
        try {
            const existingUser = await UserRepository.ListByEmail(email);
            if (existingUser) {
                throw new Error("E-mail já cadastrado.");
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const result = await UserRepository.Register(
                name,
                email,
                hashedPassword
            );

            // Criar matérias padrão de forma não-bloqueante
            defaultSubjects.forEach(async (subject) => {
                try {
                    await SubjectService.Create(
                        result.idUser,
                        subject.name,
                        subject.color
                    );
                } catch (error) {
                    console.error(
                        `Erro ao criar matéria padrão ${subject.name}:`,
                        error.message
                    );
                }
            });

            // Gerar token
            const token = Token.Create(result.idUser);

            return {
                ...result.toJSON(),
                token,
            };
        } catch (error) {
            console.error("Erro ao registrar usuário: ", error.message);
            throw new Error(error.message);
        }
    }

    async Login(email, password) {
        try {
            const user = await UserRepository.ListByEmail(email);

            if (!user) {
                throw new Error("E-mail não cadastrado.");
            }

            if (!(await bcrypt.compare(password, user.password))) {
                throw new Error("Senha incorreta.");
            }

            // Gerar token
            const token = Token.Create(user.idUser);

            // Remover senha e retornar
            const userWithoutPassword = { ...user.toJSON() };
            delete userWithoutPassword.password;

            return {
                ...userWithoutPassword,
                token,
            };
        } catch (error) {
            console.error("Erro ao fazer login: ", error.message);
            throw new Error(error.message);
        }
    }

    async Profile(idUser) {
        try {
            const user = await UserRepository.Profile(idUser);

            if (!user) {
                throw new Error("Usuário não encontrado.");
            }

            return user;
        } catch (error) {
            console.error("Erro ao buscar perfil: ", error.message);
            throw new Error(error.message);
        }
    }

    async Edit(name, email, password, idUser) {
        try {
            return await UserRepository.Edit(name, email, password, idUser);
        } catch (error) {
            console.error("Erro ao editar perfil: ", error.message);
            throw new Error(error.message);
        }
    }

    async Delete(idUser) {
        try {
            return await UserRepository.Delete(idUser);
        } catch (error) {
            console.error("Erro ao deletar perfil: ", error.message);
            throw new Error(error.message);
        }
    }
}

export default new UserService();
