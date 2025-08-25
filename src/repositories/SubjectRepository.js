import { consult } from "../database/connection.js";

class SubjectRepository {
    async Create(idUser, name, color) {
        try {
            const sql = "INSERT INTO subjects (idUser, name, color) VALUES (?, ?, ?)";
            const result = await consult(sql, [idUser, name, color]);
            const [insertSubject] = await consult(
                "SELECT * FROM subjects WHERE idSubject = ?",
                [result.insertId]
            );
            return insertSubject;
        } catch (error) {
            console.error("Erro ao criar matéria: ", error.message);
            throw new Error("Erro ao criar matéria.");
        }
    }

    async List(idUser) {
        try {
            const sql = "SELECT * FROM subjects WHERE idUser = ?";
            const result = consult(sql, [idUser]);
            return result;
        } catch (error) {
            console.error("Erro ao listas matérias: ", error.message);
            throw new Error("Erro ao listas matérias.");
        }
    }

    async Delete(idSubject) {
        try {
            const checkSql =
                "SELECT idSubject FROM subjects WHERE idSubject = ?";
            const subject = await consult(checkSql, [idSubject]);

            if (subject.length === 0) {
                throw new Error("Matéria não encontrada.");
            }

            const sql = "DELETE FROM subjects WHERE idSubject = ?";
            await consult(sql, [idSubject]);
        } catch (error) {
            console.error("Erro ao deletar matéria: ", error.message);
            throw new Error("Erro ao deletar matéria.");
        }
    }
}

export default new SubjectRepository();
