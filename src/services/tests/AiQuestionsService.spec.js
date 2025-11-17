import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

// 1. MOCKANDO AS DEPENDÊNCIAS
vi.mock("../../repositories/DeckRepository.js", () => ({
    default: {
        Create: vi.fn(),
        FindById: vi.fn(),
    },
}));

vi.mock("../../repositories/CardRepository.js", () => ({
    default: {
        Create: vi.fn(),
    },
}));

vi.mock("@google/genai", () => ({
    GoogleGenAI: vi.fn().mockImplementation(() => ({
        models: {
            generateContent: vi.fn(),
        },
    })),
}));

// Importamos os mocks para poder controlá-los
import { GoogleGenAI } from "@google/genai";
import DeckRepository from "../../repositories/DeckRepository.js";
import CardRepository from "../../repositories/CardRepository.js";

// 2. IMPORTAR O SERVIÇO
import AiQuestionsService from "../AiQuestionsService.js";

// --- INÍCIO DOS TESTES ---

describe("AiQuestionsService", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.resetAllMocks();
        process.env.GEMINI_API_KEY = "test-api-key";

        // Mock do console.error para todos os testes
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        process.env = originalEnv;
        vi.restoreAllMocks();
    });

    // --- Testes para Generate ---
    describe("Generate", () => {
        test("Deve lançar erro quando a chave da API não está configurada", async () => {
            process.env.GEMINI_API_KEY = "";

            await expect(
                AiQuestionsService.Generate("Matemática", "Fácil", 5)
            ).rejects.toThrow("Erro ao gerar questões com IA.");
        });

        test("Deve gerar questões com sucesso", async () => {
            const mockResponse = {
                text: JSON.stringify({
                    questions: [
                        {
                            text: "Qual a capital da França?",
                            alternatives: [
                                { id: "a", text: "Londres", isCorrect: false },
                                { id: "b", text: "Paris", isCorrect: true },
                                { id: "c", text: "Roma", isCorrect: false },
                                { id: "d", text: "Berlim", isCorrect: false },
                            ],
                            explanation: "Paris é a capital da França",
                        },
                    ],
                }),
            };

            // Mock específico para este teste
            const mockGenerateContent = vi.fn().mockResolvedValue(mockResponse);
            GoogleGenAI.mockImplementation(() => ({
                models: {
                    generateContent: mockGenerateContent,
                },
            }));

            const result = await AiQuestionsService.Generate(
                "Geografia",
                "Fácil",
                1
            );

            expect(GoogleGenAI).toHaveBeenCalledWith({
                apiKey: "test-api-key",
            });
            expect(mockGenerateContent).toHaveBeenCalledWith({
                model: "gemini-2.5-flash",
                contents: expect.stringContaining("Geografia"),
            });
            expect(result).toEqual({
                theme: "Geografia",
                difficulty: "Fácil",
                quantity: 1,
                questions: [
                    {
                        id: 1,
                        text: "Qual a capital da França?",
                        alternatives: [
                            { id: "a", text: "Londres", isCorrect: false },
                            { id: "b", text: "Paris", isCorrect: true },
                            { id: "c", text: "Roma", isCorrect: false },
                            { id: "d", text: "Berlim", isCorrect: false },
                        ],
                        explanation: "Paris é a capital da França",
                    },
                ],
            });
        });

        test("Deve lidar com resposta da IA contendo code blocks", async () => {
            const mockResponse = {
                text:
                    "```json\n" +
                    JSON.stringify({
                        questions: [
                            {
                                text: "Teste com code block",
                                alternatives: [
                                    {
                                        id: "a",
                                        text: "Opção A",
                                        isCorrect: false,
                                    },
                                    {
                                        id: "b",
                                        text: "Opção B",
                                        isCorrect: true,
                                    },
                                    {
                                        id: "c",
                                        text: "Opção C",
                                        isCorrect: false,
                                    },
                                    {
                                        id: "d",
                                        text: "Opção D",
                                        isCorrect: false,
                                    },
                                ],
                                explanation: "Explicação teste",
                            },
                        ],
                    }) +
                    "\n```",
            };

            const mockGenerateContent = vi.fn().mockResolvedValue(mockResponse);
            GoogleGenAI.mockImplementation(() => ({
                models: {
                    generateContent: mockGenerateContent,
                },
            }));

            const result = await AiQuestionsService.Generate(
                "Teste",
                "Médio",
                1
            );

            expect(result.questions[0].text).toBe("Teste com code block");
        });

        test("Deve lançar erro quando a resposta da IA não contém JSON válido", async () => {
            const mockResponse = {
                text: "Resposta inválida sem JSON",
            };

            const mockGenerateContent = vi.fn().mockResolvedValue(mockResponse);
            GoogleGenAI.mockImplementation(() => ({
                models: {
                    generateContent: mockGenerateContent,
                },
            }));

            await expect(
                AiQuestionsService.Generate("Teste", "Difícil", 1)
            ).rejects.toThrow("Erro ao gerar questões com IA.");
        });

        test("Deve garantir IDs únicos para múltiplas questões", async () => {
            const mockResponse = {
                text: JSON.stringify({
                    questions: [
                        {
                            text: "Pergunta 1",
                            alternatives: [
                                { id: "a", text: "A", isCorrect: false },
                                { id: "b", text: "B", isCorrect: true },
                                { id: "c", text: "C", isCorrect: false },
                                { id: "d", text: "D", isCorrect: false },
                            ],
                            explanation: "Exp 1",
                        },
                        {
                            text: "Pergunta 2",
                            alternatives: [
                                { id: "a", text: "A", isCorrect: false },
                                { id: "b", text: "B", isCorrect: true },
                                { id: "c", text: "C", isCorrect: false },
                                { id: "d", text: "D", isCorrect: false },
                            ],
                            explanation: "Exp 2",
                        },
                    ],
                }),
            };

            const mockGenerateContent = vi.fn().mockResolvedValue(mockResponse);
            GoogleGenAI.mockImplementation(() => ({
                models: {
                    generateContent: mockGenerateContent,
                },
            }));

            const result = await AiQuestionsService.Generate(
                "Teste",
                "Médio",
                2
            );

            expect(result.questions[0].id).toBe(1);
            expect(result.questions[1].id).toBe(2);
            expect(result.quantity).toBe(2);
        });
    });

    // --- Testes para GenerateDeck ---
    describe("GenerateDeck", () => {
        test("Deve lançar erro quando a chave da API não está configurada", async () => {
            process.env.GEMINI_API_KEY = "";

            await expect(
                AiQuestionsService.GenerateDeck(1, "História", 1, 5)
            ).rejects.toThrow(
                "Não foi possível gerar o deck com a IA. Tente novamente."
            );
        });

        test("Deve criar deck e cards com sucesso", async () => {
            const mockDeck = { idDeck: 123 };
            const mockCardsResponse = {
                text: JSON.stringify({
                    cards: [
                        { question: "Pergunta 1", answer: "Resposta 1" },
                        { question: "Pergunta 2", answer: "Resposta 2" },
                    ],
                }),
            };

            const mockGenerateContent = vi
                .fn()
                .mockResolvedValue(mockCardsResponse);
            GoogleGenAI.mockImplementation(() => ({
                models: {
                    generateContent: mockGenerateContent,
                },
            }));

            DeckRepository.Create.mockResolvedValue(mockDeck);
            CardRepository.Create.mockResolvedValue({});
            DeckRepository.FindById.mockResolvedValue({
                ...mockDeck,
                cards: [],
            });

            const result = await AiQuestionsService.GenerateDeck(
                1,
                "Ciências",
                1,
                2
            );

            expect(DeckRepository.Create).toHaveBeenCalledWith(
                1,
                1,
                "Ciências"
            );
            expect(CardRepository.Create).toHaveBeenCalledTimes(2);
            expect(CardRepository.Create).toHaveBeenCalledWith(
                123,
                "Pergunta 1",
                "Resposta 1"
            );
            expect(CardRepository.Create).toHaveBeenCalledWith(
                123,
                "Pergunta 2",
                "Resposta 2"
            );
            expect(DeckRepository.FindById).toHaveBeenCalledWith(123);
            expect(result).toEqual({ ...mockDeck, cards: [] });
        });

        test("Deve lidar com resposta da IA contendo code blocks no GenerateDeck", async () => {
            const mockDeck = { idDeck: 123 };
            const mockCardsResponse = {
                text:
                    "```json\n" +
                    JSON.stringify({
                        cards: [
                            {
                                question: "Pergunta com block",
                                answer: "Resposta",
                            },
                        ],
                    }) +
                    "\n```",
            };

            const mockGenerateContent = vi
                .fn()
                .mockResolvedValue(mockCardsResponse);
            GoogleGenAI.mockImplementation(() => ({
                models: {
                    generateContent: mockGenerateContent,
                },
            }));

            DeckRepository.Create.mockResolvedValue(mockDeck);
            CardRepository.Create.mockResolvedValue({});
            DeckRepository.FindById.mockResolvedValue(mockDeck);

            await AiQuestionsService.GenerateDeck(1, "Teste", 1, 1);

            expect(CardRepository.Create).toHaveBeenCalledWith(
                123,
                "Pergunta com block",
                "Resposta"
            );
        });

        test("Deve filtrar cards inválidos da resposta da IA", async () => {
            const mockDeck = { idDeck: 123 };
            const mockCardsResponse = {
                text: JSON.stringify({
                    cards: [
                        {
                            question: "Pergunta válida",
                            answer: "Resposta válida",
                        },
                        { question: null, answer: "Resposta inválida" }, // Card inválido
                        {
                            question: "Pergunta válida 2",
                            answer: "Resposta válida 2",
                        },
                    ],
                }),
            };

            const mockGenerateContent = vi
                .fn()
                .mockResolvedValue(mockCardsResponse);
            GoogleGenAI.mockImplementation(() => ({
                models: {
                    generateContent: mockGenerateContent,
                },
            }));

            DeckRepository.Create.mockResolvedValue(mockDeck);
            CardRepository.Create.mockResolvedValue({});
            DeckRepository.FindById.mockResolvedValue(mockDeck);

            await AiQuestionsService.GenerateDeck(1, "Teste", 1, 3);

            expect(CardRepository.Create).toHaveBeenCalledTimes(2);
            // Verifica que apenas os cards válidos foram criados
            expect(CardRepository.Create).toHaveBeenCalledWith(
                123,
                "Pergunta válida",
                "Resposta válida"
            );
            expect(CardRepository.Create).toHaveBeenCalledWith(
                123,
                "Pergunta válida 2",
                "Resposta válida 2"
            );
        });

        test("Deve lançar erro quando a resposta da IA não contém array de cards válido", async () => {
            const mockCardsResponse = {
                text: JSON.stringify({ invalid: "structure" }),
            };

            const mockGenerateContent = vi
                .fn()
                .mockResolvedValue(mockCardsResponse);
            GoogleGenAI.mockImplementation(() => ({
                models: {
                    generateContent: mockGenerateContent,
                },
            }));

            await expect(
                AiQuestionsService.GenerateDeck(1, "Teste", 1, 1)
            ).rejects.toThrow(
                "Não foi possível gerar o deck com a IA. Tente novamente."
            );
        });

        test("Deve lançar erro quando falha ao criar o deck", async () => {
            const mockCardsResponse = {
                text: JSON.stringify({
                    cards: [{ question: "Pergunta", answer: "Resposta" }],
                }),
            };

            const mockGenerateContent = vi
                .fn()
                .mockResolvedValue(mockCardsResponse);
            GoogleGenAI.mockImplementation(() => ({
                models: {
                    generateContent: mockGenerateContent,
                },
            }));

            DeckRepository.Create.mockResolvedValue(null);

            await expect(
                AiQuestionsService.GenerateDeck(1, "Teste", 1, 1)
            ).rejects.toThrow(
                "Não foi possível gerar o deck com a IA. Tente novamente."
            );
        });
    });
});
