import SubjectRepository from "../repositories/SubjectRepository.js";

class SubjectService {
    async Create(idUser, subject) {
        try {
            const result = await SubjectRepository.Create(idUser, subject);
            return result;
        } catch (error) {
            console.error("Erro ao criar matéria: ", error.message);
            throw new Error("Erro ao criar matéria.");
        }
    }

    async List(idUser) {
        try {
            const result = await SubjectRepository.List(idUser);
            return result;
        } catch (error) {
            console.error("Erro ao listas matérias: ", error.message);
            throw new Error("Erro ao listas matérias");
        }
    }
}

export default new SubjectService();
