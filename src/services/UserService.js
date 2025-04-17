import bcrypt from "bcrypt";
import Token from "../token.js";
import UserRepository from "../repositories/UserRepository.js";

class UserService {
    async Register(name, email, password) {
        try {
            const existingUser = await UserRepository.ListByEmail(email);
            if (existingUser) {
                throw new Error("E-mail já cadastrado.");
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const result = await UserRepository.Register(name, email, hashedPassword);

            result.token = Token.Create(result.idUser);
            return result;
        } catch (error) {
            console.error("Erro ao registrar usuário: ", error.message);
            throw new Error(error.message);
        }
    }
}

export default new UserService();
