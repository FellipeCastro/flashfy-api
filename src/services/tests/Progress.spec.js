import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

// 1. MOCKS
vi.mock("../../repositories/ProgressRepository.js", () => ({
    default: {
        FindByUserId: vi.fn(),
        Create: vi.fn(),
        UpdateStudiedDecks: vi.fn(),
        UpdateConsecutiveDays: vi.fn(),
    },
}));

vi.mock("../DeckService.js", () => ({
    default: {
        List: vi.fn(),
    },
}));

// 2. IMPORTS
import ProgressRepository from "../../repositories/ProgressRepository.js";
import DeckService from "../DeckService.js";
import ProgressService from "../ProgressService.js";

// --- INÍCIO DOS TESTES ---

describe("ProgressService", () => {
    // Definimos datas fixas para controlar o tempo
    const MOCK_DATE_NOW = new Date("2025-10-20T10:00:00.000Z");
    const MOCK_DATE_YESTERDAY = new Date("2025-10-19T10:00:00.000Z");
    const MOCK_DATE_TWO_DAYS_AGO = new Date("2025-10-18T10:00:00.000Z");

    beforeEach(() => {
        // Congela o tempo!
        vi.useFakeTimers();
        vi.setSystemTime(MOCK_DATE_NOW);
        vi.resetAllMocks();
    });

    afterEach(() => {
        // Descongela o tempo
        vi.useRealTimers();
    });

    // Testando os métodos auxiliares primeiro
    describe("GetDecksToStudy", () => {
        test("Deve contar decks com revisão no passado ou hoje", async () => {
            const decks = [
                { nextReview: "2025-10-19T00:00:00.000Z" }, // 1. Ontem (conta)
                { nextReview: "2025-10-20T09:00:00.000Z" }, // 2. Hoje cedo (conta)
                { nextReview: "2025-10-20T11:00:00.000Z" }, // 3. Hoje mais tarde (conta)
                { nextReview: "2025-10-21T11:00:00.000Z" }, // 4. Amanhã (não conta)
                { nextReview: null }, // 5. Nulo (não conta)
            ];

            const count = await ProgressService.GetDecksToStudy(decks);
            expect(count).toBe(3);
        });
    });

    describe("IsNewDay", () => {
        test("Deve retornar true se não houver progresso (primeiro acesso)", async () => {
            ProgressRepository.FindByUserId.mockResolvedValue(null);
            expect(await ProgressService.IsNewDay(1)).toBe(true);
        });

        test("Deve retornar true se a última data de estudo foi ontem", async () => {
            ProgressRepository.FindByUserId.mockResolvedValue({
                lastStudyDate: MOCK_DATE_YESTERDAY,
            });
            expect(await ProgressService.IsNewDay(1)).toBe(true);
        });

        test("Deve retornar false se a última data de estudo foi hoje", async () => {
            ProgressRepository.FindByUserId.mockResolvedValue({
                lastStudyDate: MOCK_DATE_NOW, // Mesmo dia
            });
            expect(await ProgressService.IsNewDay(1)).toBe(false);
        });
    });

    describe("GetMotivationalMessage", () => {
        test("Deve retornar a mensagem correta para cada faixa de dias", () => {
            expect(ProgressService.GetMotivationalMessage(0)).toBe(
                "Estude seus decks para começar uma nova sequência!"
            );
            expect(ProgressService.GetMotivationalMessage(1)).toBe(
                "Bom começo! 1 dia de estudo!"
            );
            expect(ProgressService.GetMotivationalMessage(5)).toBe(
                "Foguinho ativo! 5 dias consecutivos!"
            );
            expect(ProgressService.GetMotivationalMessage(7)).toBe(
                "Uma semana completa! Incrível!"
            );
            expect(ProgressService.GetMotivationalMessage(100)).toBe(
                "100 dias! Lenda viva!"
            );
        });
    });

    // Testando os métodos principais
    describe("UpdateProgress", () => {
        // Espionamos o método 'IsNewDay' para forçar os cenários
        const isNewDaySpy = vi.spyOn(ProgressService, "IsNewDay");

        test("Deve incrementar dias consecutivos se for um novo dia", async () => {
            // Arrange
            const mockProgress = { studiedDecks: 2, consecutiveDays: 5 };
            ProgressRepository.FindByUserId.mockResolvedValue(mockProgress);
            isNewDaySpy.mockResolvedValue(true); // Força "novo dia"

            // Act
            const result = await ProgressService.UpdateProgress(1);

            // Assert
            expect(ProgressRepository.UpdateStudiedDecks).toHaveBeenCalledWith(
                1,
                3
            ); // 2 + 1
            expect(
                ProgressRepository.UpdateConsecutiveDays
            ).toHaveBeenCalledWith(
                1,
                6, // 5 + 1
                MOCK_DATE_NOW // new Date()
            );
            expect(result.studiedDecks).toBe(3);
            expect(result.consecutiveDays).toBe(6);
            expect(result.isNewDay).toBe(true);
        });

        test("NÃO deve incrementar dias consecutivos se for o mesmo dia", async () => {
            // Arrange
            const mockProgress = { studiedDecks: 2, consecutiveDays: 5 };
            ProgressRepository.FindByUserId.mockResolvedValue(mockProgress);
            isNewDaySpy.mockResolvedValue(false); // Força "mesmo dia"

            // Act
            const result = await ProgressService.UpdateProgress(1);

            // Assert
            expect(ProgressRepository.UpdateStudiedDecks).toHaveBeenCalledWith(
                1,
                3
            ); // 2 + 1
            expect(
                ProgressRepository.UpdateConsecutiveDays
            ).toHaveBeenCalledWith(
                1,
                5, // Manteve 5
                MOCK_DATE_NOW // new Date()
            );
            expect(result.studiedDecks).toBe(3);
            expect(result.consecutiveDays).toBe(5);
            expect(result.isNewDay).toBe(false);
        });
    });

    describe("List (Orquestração)", () => {
        // Espionamos os helpers para isolar a lógica do 'List'
        const isNewDaySpy = vi.spyOn(ProgressService, "IsNewDay");
        const getDecksSpy = vi.spyOn(ProgressService, "GetDecksToStudy");

        const mockDecks = [{ id: 1 }, { id: 2 }];
        const mockProgress = {
            idUser: 1,
            consecutiveDays: 3,
            studiedDecks: 5,
            lastStudyDate: MOCK_DATE_YESTERDAY,
        };

        test("Cenário 1: Usuário de primeira vez (cria progresso)", async () => {
            // Arrange
            const newProgress = { consecutiveDays: 0, studiedDecks: 0 };
            ProgressRepository.FindByUserId.mockResolvedValueOnce(null) // 1ª chamada (não acha)
                .mockResolvedValueOnce(newProgress); // 2ª chamada (depois de criar)
            ProgressRepository.Create.mockResolvedValue(true);
            isNewDaySpy.mockResolvedValue(true); // Sempre é "novo dia"
            DeckService.List.mockResolvedValue(mockDecks);
            getDecksSpy.mockResolvedValue(2); // Retorna 2 decks para estudar

            // Act
            const result = await ProgressService.List(1);

            // Assert
            expect(ProgressRepository.Create).toHaveBeenCalledWith(1);
            expect(
                ProgressRepository.UpdateStudiedDecks
            ).not.toHaveBeenCalled(); // Não reseta
            expect(
                ProgressRepository.UpdateConsecutiveDays
            ).not.toHaveBeenCalled(); // Não reseta
            expect(result.consecutiveDays).toBe(0);
            expect(result.studiedDecks).toBe(0);
            expect(result.decksToStudy).toBe(2);
        });

        test("Cenário 2: Novo dia (reseta studiedDecks)", async () => {
            // Arrange
            const progressAfterReset = { ...mockProgress, studiedDecks: 0 };
            ProgressRepository.FindByUserId.mockResolvedValueOnce(mockProgress) // 1ª chamada
                .mockResolvedValueOnce(progressAfterReset); // 2ª chamada (após reset)
            isNewDaySpy.mockResolvedValue(true); // É NOVO DIA
            DeckService.List.mockResolvedValue(mockDecks);
            getDecksSpy.mockResolvedValue(2);

            // Act
            const result = await ProgressService.List(1);

            // Assert
            expect(ProgressRepository.Create).not.toHaveBeenCalled();
            expect(ProgressRepository.UpdateStudiedDecks).toHaveBeenCalledWith(
                1,
                0
            ); // RESETOU
            expect(
                ProgressRepository.UpdateConsecutiveDays
            ).not.toHaveBeenCalled(); // Não resetou (só 1 dia)
            expect(result.studiedDecks).toBe(0); // Veio do progresso resetado
            expect(result.consecutiveDays).toBe(3);
        });

        test("Cenário 3: Mais de 1 dia (reseta consecutiveDays)", async () => {
            // Arrange
            const oldProgress = {
                ...mockProgress,
                lastStudyDate: MOCK_DATE_TWO_DAYS_AGO, // 2 dias atrás
            };
            const progressAfterReset = { ...oldProgress, consecutiveDays: 0 };

            ProgressRepository.FindByUserId.mockResolvedValueOnce(oldProgress) // 1ª chamada
                .mockResolvedValueOnce(oldProgress) // 2ª chamada (após new day check)
                .mockResolvedValueOnce(progressAfterReset); // 3ª chamada (após reset dias)

            isNewDaySpy.mockResolvedValue(true); // É novo dia
            DeckService.List.mockResolvedValue(mockDecks);
            getDecksSpy.mockResolvedValue(2);

            // Act
            const result = await ProgressService.List(1);

            // Assert
            expect(ProgressRepository.Create).not.toHaveBeenCalled();
            expect(ProgressRepository.UpdateStudiedDecks).toHaveBeenCalledWith(
                1,
                0
            ); // Resetou decks
            expect(
                ProgressRepository.UpdateConsecutiveDays
            ).toHaveBeenCalledWith(1, 0); // RESETOU DIAS
            expect(result.consecutiveDays).toBe(0); // Veio do progresso resetado
        });
    });
});
