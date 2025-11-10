import { describe, test, expect, vi, beforeEach } from "vitest";

// 1. MOCKANDO AS DEPENDÊNCIAS
vi.mock("../../repositories/UserRepository.js", () => ({
    default: {
        ListByEmail: vi.fn(),
        Register: vi.fn(),
        RegisterWithGoogle: vi.fn(),
        UpdateGoogleId: vi.fn(),
        Profile: vi.fn(),
        Edit: vi.fn(),
        Delete: vi.fn(),
    },
}));

vi.mock("../../middleware/token.js", () => ({
    default: {
        Create: vi.fn(),
    },
}));

vi.mock("../SubjectService.js", () => ({
    default: {
        Create: vi.fn(),
    },
}));

vi.mock("bcrypt", () => ({
    default: {
        hash: vi.fn(),
        compare: vi.fn(),
    },
}));

// Importamos os mocks para poder controlá-los
import bcrypt from "bcrypt";
import Token from "../../middleware/token.js";
import SubjectService from "../SubjectService.js";
import UserRepository from "../../repositories/UserRepository.js";
import { defaultSubjects } from "../../constants/defaultSubjects.js";

// 2. IMPORTAR O SERVIÇO
import UserService from "../UserService.js"; 

// --- INÍCIO DOS TESTES ---

describe("UserService", () => {
    const mockUser = {
        idUser: 1,
        name: "Teste User",
        email: "teste@example.com",
        password: "hashedPassword123",
        toJSON: () => ({
            idUser: 1,
            name: "Teste User",
            email: "teste@example.com",
        }),
    };
    const mockToken = "fake.jwt.token";

    beforeEach(() => {
        vi.resetAllMocks();
    });

    // --- Testes para Register ---
    describe("Register", () => {
        test("Deve registrar um novo usuário com sucesso", async () => {
            UserRepository.ListByEmail.mockResolvedValue(null);
            bcrypt.hash.mockResolvedValue("hashedPassword123");
            UserRepository.Register.mockResolvedValue(mockUser);
            Token.Create.mockReturnValue(mockToken);
            SubjectService.Create.mockResolvedValue(true);

            const result = await UserService.Register(
                "Teste User",
                "teste@example.com",
                "password123"
            );

            expect(UserRepository.ListByEmail).toHaveBeenCalledWith(
                "teste@example.com"
            );
            expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
            expect(UserRepository.Register).toHaveBeenCalledWith(
                "Teste User",
                "teste@example.com",
                "hashedPassword123"
            );
            expect(SubjectService.Create).toHaveBeenCalledTimes(
                defaultSubjects.length
            );
            expect(Token.Create).toHaveBeenCalledWith(mockUser.idUser);
            expect(result).toEqual({
                ...mockUser.toJSON(),
                token: mockToken,
            });
        });

        test("Deve falhar se o e-mail já estiver cadastrado", async () => {
            UserRepository.ListByEmail.mockResolvedValue(mockUser);

            await expect(
                UserService.Register(
                    "Outro User",
                    "teste@example.com",
                    "pass123"
                )
            ).rejects.toThrow("E-mail já cadastrado.");

            expect(bcrypt.hash).not.toHaveBeenCalled();
            expect(UserRepository.Register).not.toHaveBeenCalled();
        });
    });

    // --- Testes para Login ---
    describe("Login", () => {
        test("Deve logar um usuário com sucesso", async () => {
            UserRepository.ListByEmail.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            Token.Create.mockReturnValue(mockToken);

            const result = await UserService.Login(
                "teste@example.com",
                "password123"
            );

            expect(UserRepository.ListByEmail).toHaveBeenCalledWith(
                "teste@example.com"
            );
            expect(bcrypt.compare).toHaveBeenCalledWith(
                "password123",
                mockUser.password
            );
            expect(Token.Create).toHaveBeenCalledWith(mockUser.idUser);
            expect(result).toEqual({
                ...mockUser.toJSON(),
                token: mockToken,
            });
            expect(result.password).toBeUndefined();
        });

        test("Deve falhar se o e-mail não for encontrado", async () => {
            UserRepository.ListByEmail.mockResolvedValue(null);

            await expect(
                UserService.Login("naoexiste@example.com", "pass123")
            ).rejects.toThrow("E-mail não cadastrado.");
        });

        test("Deve falhar se a senha estiver incorreta", async () => {
            UserRepository.ListByEmail.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(false);

            await expect(
                UserService.Login("teste@example.com", "senhaErrada")
            ).rejects.toThrow("Senha incorreta.");

            expect(Token.Create).not.toHaveBeenCalled();
        });
    });

    // --- Testes para GoogleAuth ---
    describe("GoogleAuth", () => {
        test("Deve criar um novo usuário se não existir", async () => {
            UserRepository.ListByEmail.mockResolvedValue(null);
            UserRepository.RegisterWithGoogle.mockResolvedValue(mockUser);
            Token.Create.mockReturnValue(mockToken);
            SubjectService.Create.mockResolvedValue(true);

            const result = await UserService.GoogleAuth(
                "Google User",
                "google@example.com",
                "googleId123"
            );

            expect(UserRepository.ListByEmail).toHaveBeenCalledWith(
                "google@example.com"
            );
            expect(UserRepository.RegisterWithGoogle).toHaveBeenCalledWith(
                "Google User",
                "google@example.com",
                "googleId123"
            );
            expect(SubjectService.Create).toHaveBeenCalledTimes(
                defaultSubjects.length
            );
            expect(UserRepository.UpdateGoogleId).not.toHaveBeenCalled();
            expect(Token.Create).toHaveBeenCalledWith(mockUser.idUser);
            expect(result).toEqual({
                ...mockUser.toJSON(),
                token: mockToken,
            });
        });

        test("Deve logar usuário existente e atualizar googleId se nulo", async () => {
            const existingUserNoGoogleId = {
                ...mockUser,
                googleId: null,
                toJSON: () => ({ ...mockUser.toJSON(), googleId: null }),
            };
            UserRepository.ListByEmail.mockResolvedValue(
                existingUserNoGoogleId
            );
            Token.Create.mockReturnValue(mockToken);

            const result = await UserService.GoogleAuth(
                "Teste User",
                "teste@example.com",
                "googleId123"
            );

            expect(UserRepository.ListByEmail).toHaveBeenCalledWith(
                "teste@example.com"
            );
            expect(UserRepository.RegisterWithGoogle).not.toHaveBeenCalled();
            expect(SubjectService.Create).not.toHaveBeenCalled();
            expect(UserRepository.UpdateGoogleId).toHaveBeenCalledWith(
                mockUser.idUser,
                "googleId123"
            );
            expect(Token.Create).toHaveBeenCalledWith(mockUser.idUser);
            expect(result).toEqual({
                ...existingUserNoGoogleId.toJSON(),
                token: mockToken,
            });
        });
    });

    // --- Testes para Profile ---
    describe("Profile", () => {
        test("Deve retornar o perfil do usuário", async () => {
            UserRepository.Profile.mockResolvedValue(mockUser.toJSON());

            const result = await UserService.Profile(1);

            expect(UserRepository.Profile).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockUser.toJSON());
        });

        test("Deve falhar se o usuário não for encontrado", async () => {
            UserRepository.Profile.mockResolvedValue(null);

            await expect(UserService.Profile(999)).rejects.toThrow(
                "Usuário não encontrado."
            );
        });
    });
});
