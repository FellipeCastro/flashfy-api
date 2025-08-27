import CardRepository from "../repositories/CardRepository.js";

class CardService {
    async Create(idDeck, question, answer) {
        try {
            const result = await CardRepository.Create(
                idDeck,
                question,
                answer
            );
            return result;
        } catch (error) {
            console.error("Erro ao criar card: ", error.message);
            throw new Error("Erro ao criar card.");
        }
    }

    async List(idDeck) {
        try {
            const result = await CardRepository.List(idDeck);
            return result;
        } catch (error) {
            console.error("Erro ao listar cards: ", error.message);
            throw new Error("Erro ao listar cards.");
        }
    }

    async Delete(idCard) {
        try {
            return await CardRepository.Delete(idCard);
        } catch (error) {
            console.error("Erro ao deletar card: ", error.message);
            throw new Error("Erro ao deletar card.");
        }
    }

    async UpdateDifficulty(difficulty, idCard) {
        try {
            return await CardRepository.UpdateDifficulty(difficulty, idCard);
        } catch (error) {
            console.error("Erro ao atualizar dificuldade do card: ", error.message);
            throw new Error("Erro ao atualizar dificuldade do card.");
        }
    }
}

export default new CardService();
