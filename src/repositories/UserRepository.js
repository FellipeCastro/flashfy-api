import { consult } from "../database/connection.js";

class UserRepository {
    async ListByEmail(email) {
        try {
            const sql = "SELECT * FROM users WHERE email = ?";
            const result = await consult(sql, [email]);

            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error("Erro ao buscar usuário por e-mail: ", error.message);
            throw new Error("Erro ao buscar usuário por email.");
        }
    }

    async Register(name, email, password) {
        try {
            const sql =
                "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
            const result = await consult(sql, [name, email, password]);
            const [user] = await consult(
                "SELECT * FROM users WHERE idUser = ?",
                [result.insertId]
            );
            return user;
        } catch (error) {
            console.error("Erro ao registrar usuário: ", error.message);
            throw new Error("Erro ao registrar usuário.");
        }
    }

    async Profile(idUser) {
        try {
            const sql =
                "SELECT idUser, name, email FROM users WHERE idUser = ?";
            const result = await consult(sql, [idUser]);

            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error("Erro ao buscar perfil: ", error.message);
            throw new Error("Erro ao buscar perfil.");
        }
    }
}

export default new UserRepository();
