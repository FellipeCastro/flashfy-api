import { describe, test, expect, vi, beforeEach } from "vitest";

// 1. MOCK
vi.mock("../../repositories/CardRepository.js", () => ({
    default: {
        Create: vi.fn(),
        List: vi.fn(),
        Delete: vi.fn(),
        UpdateDifficulty: vi.fn(),
    },
}));

// 2. IMPORTS
import CardRepository from "../../repositories/CardRepository.js";
import CardService from "../CardService.js";

// --- INÍCIO DOS TESTES ---

describe("CardService", () => {
    // Dados mock para os testes
    const mockCard = {
        idCard: 1,
        idDeck: 1,
        question: "O que é Vitest?",
        answer: "Um framework de testes.",
    };

    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe("Create", () => {
        test("Deve criar um card com sucesso", async () => {
            // Arrange
            CardRepository.Create.mockResolvedValue(mockCard);

            // Act
            const result = await CardService.Create(
                1,
                "O que é Vitest?",
                "Um framework de testes."
            );

            // Assert
            expect(CardRepository.Create).toHaveBeenCalledWith(
                1,
                "O que é Vitest?",
                "Um framework de testes."
            );
            expect(result).toEqual(mockCard);
        });

        test("Deve lançar um erro se o repositório falhar", async () => {
            // Arrange
            CardRepository.Create.mockRejectedValue(new Error("DB Error"));

            // Act & Assert
            await expect(
                CardService.Create(1, "Q", "A")
            ).rejects.toThrow("Erro ao criar card.");
        });
    });

    describe("List", () => {
        test("Deve listar os cards de um deck com sucesso", async () => {
            // Arrange
            const mockList = [mockCard, { ...mockCard, idCard: 2 }];
            CardRepository.List.mockResolvedValue(mockList);

            // Act
            const result = await CardService.List(1);

            // Assert
            expect(CardRepository.List).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockList);
        });

        test("Deve lançar um erro se o repositório falhar", async () => {
            // Arrange
            CardRepository.List.mockRejectedValue(new Error("DB Error"));

            // Act & Assert
            await expect(CardService.List(1)).rejects.toThrow(
                "Erro ao listar cards."
            );
        });
    });

    describe("Delete", () => {
        test("Deve deletar um card com sucesso", async () => {
            // Arrange
            CardRepository.Delete.mockResolvedValue(true); // Ex: 1 linha afetada

            // Act
            const result = await CardService.Delete(1);

            // Assert
            expect(CardRepository.Delete).toHaveBeenCalledWith(1);
            expect(result).toBe(true);
        });

        test("Deve lançar um erro se o repositório falhar", async () => {
            // Arrange
            CardRepository.Delete.mockRejectedValue(new Error("DB Error"));

            // Act & Assert
            await expect(CardService.Delete(1)).rejects.toThrow(
                "Erro ao deletar card."
            );
        });
    });

    describe("UpdateDifficulty", () => {
        test("Deve atualizar a dificuldade de um card com sucesso", async () => {
            // Arrange
            CardRepository.UpdateDifficulty.mockResolvedValue(true);

            // Act
            const result = await CardService.UpdateDifficulty(3, 1); // Dificuldade 3, Card 1

            // Assert
            expect(CardRepository.UpdateDifficulty).toHaveBeenCalledWith(3, 1);
            expect(result).toBe(true);
        });

        test("Deve lançar um erro se o repositório falhar", async () => {
            // Arrange
            CardRepository.UpdateDifficulty.mockRejectedValue(new Error("DB Error"));

            // Act & Assert
            await expect(
                CardService.UpdateDifficulty(3, 1)
            ).rejects.toThrow("Erro ao atualizar dificuldade do card.");
        });
    });
});