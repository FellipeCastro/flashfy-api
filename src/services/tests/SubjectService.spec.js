import { beforeEach, describe, test, expect, vi } from "vitest";

// mocks
vi.mock("../../repositories/SubjectRepository.js", () => ({
    default: {
        Create: vi.fn(),
        List: vi.fn(),
        Delete: vi.fn(),
        FindById: vi.fn(),
    },
}));

// imports
import SubjectRepository from "../../repositories/SubjectRepository.js";

// service
import SubjectService from "../SubjectService.js";

// tests
describe("SubjectService", () => {
    // Mock de dados para os testes
    const mockSubject = {
        idSubject: 1,
        idUser: 1,
        name: "Matemática",
        color: "#FF0000",
        toJSON: () => ({
            // Simula o .toJSON() do Sequelize/Prisma
            idSubject: 1,
            idUser: 1,
            name: "Matemática",
            color: "#FF0000",
        }),
    };

    beforeEach(() => {
        vi.clearAllMocks(); 
    });

    describe("Create", () => {
        test("Deve criar uma matéria com sucesso", async () => {
            // Arrange
            SubjectRepository.Create.mockResolvedValue(mockSubject);

            // Act
            const result = await SubjectService.Create(
                1,
                "Matemática",
                "#FF0000"
            );

            // Assert
            expect(SubjectRepository.Create).toHaveBeenCalledWith(
                1,
                "Matemática",
                "#FF0000"
            );
            expect(result).toEqual(mockSubject);
        });

        test("Deve lançar um erro se o repositório falhar", async () => {
            // Arrange
            SubjectRepository.Create.mockRejectedValue(new Error("Erro de DB"));

            // Act & Assert
            await expect(
                SubjectService.Create(1, "Matemática", "#FF0000")
            ).rejects.toThrow("Erro ao criar matéria.");
        });
    });

    describe("List", () => {
        test("Deve listar matérias e formatar a contagem de decks", async () => {
            // Arrange
            const mockList = [
                {
                    // Caso com decks
                    ...mockSubject,
                    decks: [{ id: 1 }, { id: 2 }],
                },
                {
                    // Caso com array de decks vazio
                    idSubject: 2,
                    name: "História",
                    color: "#00FF00",
                    decks: [],
                    toJSON: () => ({
                        idSubject: 2,
                        name: "História",
                        color: "#00FF00",
                    }),
                },
                {
                    // Caso com decks nulo (edge case)
                    idSubject: 3,
                    name: "Ciência",
                    color: "#0000FF",
                    decks: null,
                    toJSON: () => ({
                        idSubject: 3,
                        name: "Ciência",
                        color: "#0000FF",
                    }),
                },
            ];
            SubjectRepository.List.mockResolvedValue(mockList);

            // Act
            const result = await SubjectService.List(1);

            // Assert
            expect(SubjectRepository.List).toHaveBeenCalledWith(1);
            expect(result).toHaveLength(3);

            // Verifica a formatação
            expect(result[0].decksCount).toBe(2);
            expect(result[0].name).toBe("Matemática");
            expect(result[1].decksCount).toBe(0);
            expect(result[2].decksCount).toBe(0); // Testando o '... ? ... : 0'
        });

        test("Deve retornar um array vazio se nenhuma matéria for encontrada", async () => {
            // Arrange
            SubjectRepository.List.mockResolvedValue([]);

            // Act
            const result = await SubjectService.List(1);

            // Assert
            expect(result).toEqual([]);
        });

        test("Deve lançar um erro se o repositório falhar", async () => {
            // Arrange
            SubjectRepository.List.mockRejectedValue(new Error("Erro de DB"));

            // Act & Assert
            await expect(SubjectService.List(1)).rejects.toThrow(
                "Erro ao listar matérias."
            );
        });
    });

    describe("Delete", () => {
        test("Deve deletar uma matéria com sucesso", async () => {
            // Arrange
            SubjectRepository.Delete.mockResolvedValue(true); // Ex: 1 linha afetada

            // Act
            const result = await SubjectService.Delete(1);

            // Assert
            expect(SubjectRepository.Delete).toHaveBeenCalledWith(1);
            expect(result).toBe(true);
        });

        test("Deve lançar um erro se o repositório falhar", async () => {
            // Arrange
            SubjectRepository.Delete.mockRejectedValue(new Error("Erro de DB"));

            // Act & Assert
            await expect(SubjectService.Delete(1)).rejects.toThrow(
                "Erro ao deletar matéria."
            );
        });
    });

    describe("GetById", () => {
        // Corrigido de "FindById" para "GetById" (nome do método no service)
        test("Deve encontrar uma matéria pelo ID", async () => {
            // Arrange
            SubjectRepository.FindById.mockResolvedValue(mockSubject);

            // Act
            const result = await SubjectService.GetById(1);

            // Assert
            expect(SubjectRepository.FindById).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockSubject);
        });

        test("Deve retornar null se a matéria não for encontrada", async () => {
            // Arrange
            SubjectRepository.FindById.mockResolvedValue(null);

            // Act
            const result = await SubjectService.GetById(999);

            // Assert
            expect(result).toBeNull();
        });

        test("Deve lançar um erro se o repositório falhar", async () => {
            // Arrange
            SubjectRepository.FindById.mockRejectedValue(
                new Error("Erro de DB")
            );

            // Act & Assert
            await expect(SubjectService.GetById(1)).rejects.toThrow(
                "Erro ao buscar matéria."
            );
        });
    });
});
