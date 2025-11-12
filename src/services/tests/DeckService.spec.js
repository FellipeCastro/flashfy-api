import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

// 1. MOCKS
vi.mock("../../repositories/DeckRepository.js", () => ({
    default: {
        Create: vi.fn(),
        List: vi.fn(),
        Delete: vi.fn(),
        FindById: vi.fn(),
        UpdateNextReview: vi.fn(),
    },
}));

vi.mock("../CardService.js", () => ({
    default: {
        UpdateDifficulty: vi.fn(),
    },
}));

vi.mock("../ProgressService.js", () => ({
    default: {
        UpdateProgress: vi.fn(),
    },
}));

// 2. IMPORTS
import DeckRepository from "../../repositories/DeckRepository.js";
import CardService from "../CardService.js";
import ProgressService from "../ProgressService.js";
import DeckService from "../DeckService.js";

// --- INÍCIO DOS TESTES ---

describe("DeckService", () => {
    // Definimos uma data fixa para todos os testes
    // Usando a data da sua última mensagem: 12 de Novembro de 2025
    const MOCK_DATE_NOW = new Date("2025-11-12T10:00:00.000Z");

    beforeEach(() => {
        // Congela o tempo
        vi.useFakeTimers();
        vi.setSystemTime(MOCK_DATE_NOW);
        vi.resetAllMocks();
    });

    afterEach(() => {
        // Descongela o tempo
        vi.useRealTimers();
    });

    describe("Create", () => {
        test("Deve criar um deck com sucesso", async () => {
            const mockDeck = { id: 1, title: "Novo Deck" };
            DeckRepository.Create.mockResolvedValue(mockDeck);

            const result = await DeckService.Create(1, 1, "Novo Deck");

            expect(DeckRepository.Create).toHaveBeenCalledWith(
                1,
                1,
                "Novo Deck"
            );
            expect(result).toEqual(mockDeck);
        });

        test("Deve lançar um erro em caso de falha", async () => {
            DeckRepository.Create.mockRejectedValue(new Error("DB error"));
            await expect(DeckService.Create(1, 1, "Deck")).rejects.toThrow(
                "Erro ao criar deck."
            );
        });
    });

    describe("List (Lógica de Ordenação)", () => {
        test("Deve ordenar decks corretamente (passado primeiro, depois mais próximo, nulo por último)", async () => {
            // Arrange
            // Data de hoje: 2025-11-12
            const deckPassado = { id: 1, nextReview: "2025-11-10T00:00:00Z" }; // 1º
            const deckFuturoProximo = {
                id: 2,
                nextReview: "2025-11-15T00:00:00Z",
            }; // 2º
            const deckFuturoLonge = {
                id: 3,
                nextReview: "2025-11-20T00:00:00Z",
            }; // 3º
            const deckNulo = { id: 4, nextReview: null }; // 4º

            // Lista desordenada
            const mockList = [
                deckNulo,
                deckFuturoLonge,
                deckPassado,
                deckFuturoProximo,
            ];
            DeckRepository.List.mockResolvedValue(mockList);

            // Act
            const result = await DeckService.List(1);

            // Assert
            expect(result).toEqual([
                deckPassado,
                deckFuturoProximo,
                deckFuturoLonge,
                deckNulo,
            ]);
        });
    });

    describe("Delete", () => {
        test("Deve deletar um deck com sucesso", async () => {
            DeckRepository.Delete.mockResolvedValue(true);
            const result = await DeckService.Delete(1);
            expect(DeckRepository.Delete).toHaveBeenCalledWith(1);
            expect(result).toBe(true);
        });
    });

    describe("UpdateNextReview (Lógica de Cálculo)", () => {
        test("Deve calcular 5 dias para média 'Fácil' (2)", async () => {
            // Média (1 + 3) / 2 = 2. Mapeia para 5 dias.
            const mockDeck = {
                cards: [{ difficulty: 1 }, { difficulty: 3 }],
            };
            DeckRepository.FindById.mockResolvedValue(mockDeck);

            // Data de hoje: 2025-11-12. +5 dias = 2025-11-17
            const expectedDate = new Date(
                "2025-11-17T10:00:00.000Z"
            ).toISOString();

            await DeckService.UpdateNextReview(1);

            expect(DeckRepository.UpdateNextReview).toHaveBeenCalledWith(
                expectedDate,
                1
            );
        });

        test("Deve calcular 1 dia para média 'Muito Difícil' (4) ou nulo", async () => {
            // Média (4 + 4 + null=4) / 3 = 4. Mapeia para 1 dia.
            const mockDeck = {
                cards: [
                    { difficulty: 4 },
                    { difficulty: 4 },
                    { difficulty: null },
                ],
            };
            DeckRepository.FindById.mockResolvedValue(mockDeck);

            // Data de hoje: 2025-11-12. +1 dia = 2025-11-13
            const expectedDate = new Date(
                "2025-11-13T10:00:00.000Z"
            ).toISOString();

            await DeckService.UpdateNextReview(1);

            expect(DeckRepository.UpdateNextReview).toHaveBeenCalledWith(
                expectedDate,
                1
            );
        });

        test("Deve falhar se deck não tiver cards", async () => {
            DeckRepository.FindById.mockResolvedValue({ cards: [] });
            await expect(DeckService.UpdateNextReview(1)).rejects.toThrow(
                "Deck não encontrado ou sem cards."
            );
        });
    });

    describe("Study (Lógica de Orquestração)", () => {
        // Criamos um "espião" para o método UpdateNextReview
        // Isso é necessário porque `Study` chama `this.UpdateNextReview`
        const updateNextReviewSpy = vi
            .spyOn(DeckService, "UpdateNextReview")
            .mockResolvedValue(true); // Mockamos o retorno dele

        test("Deve orquestrar o estudo (atualizar cards, deck e progresso)", async () => {
            // Arrange
            const mockDeck = {
                cards: [{ idCard: 101 }, { idCard: 102 }],
            };
            const difficulties = [1, 3]; // Dificuldades enviadas pelo usuário
            const idUser = 1;
            const idDeck = 1;

            DeckRepository.FindById.mockResolvedValue(mockDeck);
            CardService.UpdateDifficulty.mockResolvedValue(true);
            ProgressService.UpdateProgress.mockResolvedValue(true);

            // Act
            const result = await DeckService.Study(
                idUser,
                idDeck,
                difficulties
            );

            // Assert
            // 1. Verificou o Deck
            expect(DeckRepository.FindById).toHaveBeenCalledWith(idDeck);

            // 2. Atualizou os cards em loop
            expect(CardService.UpdateDifficulty).toHaveBeenCalledTimes(2);
            expect(CardService.UpdateDifficulty).toHaveBeenCalledWith(1, 101); // Card 1, Dificuldade 1
            expect(CardService.UpdateDifficulty).toHaveBeenCalledWith(3, 102); // Card 2, Dificuldade 3

            // 3. Atualizou a próxima revisão (usando o espião)
            expect(updateNextReviewSpy).toHaveBeenCalledWith(idDeck);

            // 4. Atualizou o progresso
            expect(ProgressService.UpdateProgress).toHaveBeenCalledWith(idUser);

            // 5. Retornou sucesso
            expect(result.message).toBe("Deck estudado com sucesso!");
        });

        test("Deve falhar se a contagem de dificuldades for diferente", async () => {
            const mockDeck = { cards: [{ idCard: 101 }] }; // Só 1 card
            const difficulties = [1, 3]; // Mandou 2 dificuldades

            DeckRepository.FindById.mockResolvedValue(mockDeck);

            await expect(DeckService.Study(1, 1, difficulties)).rejects.toThrow(
                "Quantidade de dificuldades diferente da quantidade de cards."
            );

            // Garante que nenhuma atualização foi feita
            expect(CardService.UpdateDifficulty).not.toHaveBeenCalled();
            expect(updateNextReviewSpy).not.toHaveBeenCalled();
            expect(ProgressService.UpdateProgress).not.toHaveBeenCalled();
        });
    });
});
