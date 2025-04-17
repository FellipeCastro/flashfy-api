import { consult } from "../database/connection.js";

class SubjectRepository{
    async Create(idUser, subject) {
        try {
            const sql = "INSERT INTO subjects (idUser, subject) VALUES (?, ?)";
            const result = await consult(sql, [idUser, subject]);
            const [insertSubject] = await consult("SELECT * FROM subjects WHERE idSubject = ?", [result.insertId]);
            return insertSubject;
        } catch (error) {
            console.error("Erro ao criar matéria: ", error.message);
            throw new Error("Erro ao criar matéria");
        }
    }

    async List(idUser) {
        try {
            const sql = "SELECT * FROM subjects WHERE idUser = ?";
            const result = consult(sql, [idUser]);
            return result;
        } catch (error) {
            console.error("Erro ao listas matérias: ", error.message);
            throw new Error("Erro ao listas matérias");
        }
    }
}

export default new SubjectRepository();
