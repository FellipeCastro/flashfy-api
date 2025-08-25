import bcrypt from "bcrypt";
import Token from "../token.js";
import { defaultSubjects } from "../database/defaultSubjects.js";
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

            defaultSubjects.forEach(async (subject) => {
                return await SubjectService.Create(
                    result.idUser,
                    subject.name,
                    subject.color
                );
            });

            delete result.password;
            result.token = Token.Create(result.idUser);
            return result;
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

            delete user.password;
            user.token = Token.Create(user.idUser);
            return user;
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
}

export default new UserService();
