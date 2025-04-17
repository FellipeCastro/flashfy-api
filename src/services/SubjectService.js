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
}

export default new SubjectService();
