import SubjectRepository from "../repositories/SubjectRepository.js";

class SubjectService {
    async Create(idUser, name, color) {
        try {
            const result = await SubjectRepository.Create(idUser, name, color);
            return result;
        } catch (error) {
            console.error("Erro ao criar matéria: ", error.message);
            throw new Error("Erro ao criar matéria.");
        }
    }

    async List(idUser) {
        try {
            const result = await SubjectRepository.List(idUser);

            // Formata a resposta para incluir contagem de decks
            const formattedResult = result.map((subject) => {
                return {
                    ...subject.toJSON(),
                    decksCount: subject.decks ? subject.decks.length : 0,
                };
            });

            return formattedResult;
        } catch (error) {
            console.error("Erro ao listar matérias: ", error.message);
            throw new Error("Erro ao listar matérias.");
        }
    }

    async Delete(idSubject) {
        try {
            return await SubjectRepository.Delete(idSubject);
        } catch (error) {
            console.error("Erro ao deletar matéria: ", error.message);
            throw new Error("Erro ao deletar matéria.");
        }
    }

    async GetById(idSubject) {
        try {
            const subject = await SubjectRepository.FindById(idSubject);
            return subject;
        } catch (error) {
            console.error("Erro ao buscar matéria: ", error.message);
            throw new Error("Erro ao buscar matéria.");
        }
    }
}

export default new SubjectService();
