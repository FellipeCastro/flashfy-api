import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

// 1. Mock do SDK do Google GenAI
// Criamos uma fn "espiã" que podemos controlar
const mockGenerateContent = vi.fn();

vi.mock("@google/genai", () => {
    // Mockamos a classe 'GoogleGenAI'
    const GoogleGenAI = vi.fn(() => ({
        // Mockamos a propriedade 'models'
        models: {
            // Mockamos o método 'generateContent'
            generateContent: mockGenerateContent,
        },
    }));

    return { GoogleGenAI };
});

// 2. Mock dos Repositórios
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

// --- IMPORTS ---
import { GoogleGenAI } from "@google/genai";
import DeckRepository from "../../repositories/DeckRepository.js";
import CardRepository from "../../repositories/CardRepository.js";
import AiQuestionsService from "../AiQuestionsService.js";

// --- INÍCIO DOS TESTES ---

describe("AiQuestionsService", () => {
    // Definimos a API Key antes de cada teste
    beforeEach(() => {
        vi.resetAllMocks();
        // Simula a variável de ambiente
        vi.stubEnv("GEMINI_API_KEY", "fake-key");
    });

    // Limpamos a simulação depois de cada teste
    afterEach(() => {
        vi.unstubEnv("GEMINI_API_KEY");
    });

    describe("Generate (Quiz)", () => {
        const mockApiResponse = `
            \`\`\`json
            {
                "questions": [
                    {
                        "text": "Qual a capital da França?",
                        "alternatives": [
                            {"id": "a", "text": "Berlim", "isCorrect": false},
                            {"id": "b", "text": "Paris", "isCorrect": true}
                        ],
                        "explanation": "Paris é a capital."
                    }
                ]
            }
            \`\`\`
        `;

        test("Deve gerar questões, limpar o JSON e adicionar IDs", async () => {
            // Arrange
            mockGenerateContent.mockResolvedValue({ text: mockApiResponse });

            // Act
            const result = await AiQuestionsService.Generate(
                "História",
                "Fácil",
                1
            );

            // Assert
            // Verifica se a classe da IA foi instanciada
            expect(GoogleGenAI).toHaveBeenCalledWith({ apiKey: "fake-key" });
            // Verifica se o método da IA foi chamado
            expect(mockGenerateContent).toHaveBeenCalled();
            // Verifica o resultado formatado
            expect(result.theme).toBe("História");
            expect(result.questions).toHaveLength(1);
            expect(result.questions[0].text).toBe("Qual a capital da França?");
            // Verifica se o ID foi adicionado
            expect(result.questions[0].id).toBe(1);
        });

        test("Deve falhar se a API Key não estiver configurada", async () => {
            // Arrange
            vi.unstubEnv("GEMINI_API_KEY"); // Remove a key
            vi.stubEnv("GEMINI_API_KEY", undefined);

            // Act & Assert
            await expect(
                AiQuestionsService.Generate("Tema", "Fácil", 1)
            ).rejects.toThrow("Chave API não configurada");
        });

        test("Deve falhar se a IA retornar um JSON inválido", async () => {
            // Arrange
            mockGenerateContent.mockResolvedValue({
                text: "Ops, algo deu errado.",
            }); // Não é JSON

            // Act & Assert
            // A falha interna será "JSON não encontrado na resposta",
            // mas o service encapsula como "Erro ao gerar questões com IA."
            await expect(
                AiQuestionsService.Generate("Tema", "Fácil", 1)
            ).rejects.toThrow("Erro ao gerar questões com IA.");
        });
    });

    describe("GenerateDeck (Flashcards)", () => {
        const mockApiResponse = `
            \`\`\`json
            {
                "cards": [
                    { "question": "Q1", "answer": "A1" },
                    { "question": "Q2", "answer": "A2" }
                ]
            }
            \`\`\`
        `;
        const mockNewDeck = { idDeck: 99, title: "História" };
        const mockFullDeck = {
            ...mockNewDeck,
            cards: [{ idCard: 1, question: "Q1", answer: "A1" }],
        };

        test("Deve gerar um deck, salvar no banco e retornar o deck", async () => {
            // Arrange
            mockGenerateContent.mockResolvedValue({ text: mockApiResponse });
            DeckRepository.Create.mockResolvedValue(mockNewDeck);
            CardRepository.Create.mockResolvedValue(true);
            DeckRepository.FindById.mockResolvedValue(mockFullDeck); // Retorno final

            // Act
            const result = await AiQuestionsService.GenerateDeck(
                1, // idUser
                "História", // theme
                1, // idSubject
                2 // quantity
            );

            // Assert
            // 1. Chamou a IA
            expect(GoogleGenAI).toHaveBeenCalledWith({ apiKey: "fake-key" });
            expect(mockGenerateContent).toHaveBeenCalled();
            // 2. Criou o Deck
            expect(DeckRepository.Create).toHaveBeenCalledWith(
                1, // idUser
                1, // idSubject
                "História" // theme
            );
            // 3. Criou os Cards (em loop)
            expect(CardRepository.Create).toHaveBeenCalledTimes(2);
            expect(CardRepository.Create).toHaveBeenCalledWith(99, "Q1", "A1");
            expect(CardRepository.Create).toHaveBeenCalledWith(99, "Q2", "A2");
            // 4. Buscou o deck final
            expect(DeckRepository.FindById).toHaveBeenCalledWith(99);
            // 5. Retornou o deck completo
            expect(result).toEqual(mockFullDeck);
        });

        test("Deve pular cards inválidos retornados pela IA", async () => {
            // Arrange
            const dirtyApiResponse = `
            {
                "cards": [
                    { "question": "Q1", "answer": "A1" },
                    { "question": "Q2_SEM_RESPOSTA" } 
                ]
            }
            `;
            mockGenerateContent.mockResolvedValue({ text: dirtyApiResponse });
            DeckRepository.Create.mockResolvedValue(mockNewDeck);
            CardRepository.Create.mockResolvedValue(true);

            // Act
            await AiQuestionsService.GenerateDeck(1, "Tema", 1, 2);

            // Assert
            // Deve ter chamado a criação de card APENAS UMA VEZ
            expect(CardRepository.Create).toHaveBeenCalledTimes(1);
            expect(CardRepository.Create).toHaveBeenCalledWith(99, "Q1", "A1");
        });

        test("Deve falhar se a IA não retornar um array de 'cards'", async () => {
            // Arrange
            mockGenerateContent.mockResolvedValue({
                text: '{ "data": "formato_errado" }',
            });

            // Act & Assert
            await expect(
                AiQuestionsService.GenerateDeck(1, "Tema", 1, 2)
            ).rejects.toThrow("Não foi possível gerar o deck com a IA.");
            // Garante que não tentou salvar nada
            expect(DeckRepository.Create).not.toHaveBeenCalled();
        });
    });
});
