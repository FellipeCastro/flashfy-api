import { GoogleGenAI } from "@google/genai";
import DeckRepository from "../repositories/DeckRepository.js";
import CardRepository from "../repositories/CardRepository.js";

class AiQuestionsService {
    async Generate(theme, difficulty, quantity) {
        try {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error("Chave API não configurada");
            }

            const prompt = `Você é um gerador especializado de questões educacionais em formato JSON.
            Gere EXATAMENTE ${quantity} perguntas sobre "${theme}" com dificuldade ${difficulty}.
            
            FORMATO EXATO OBRIGATÓRIO (APENAS JSON PURO):
            {
                "questions": [
                    {
                        "text": "Texto completo da pergunta?",
                        "alternatives": [
                            {"id": "a", "text": "Alternativa A", "isCorrect": false},
                            {"id": "b", "text": "Alternativa B", "isCorrect": true},
                            {"id": "c", "text": "Alternativa C", "isCorrect": false},
                            {"id": "d", "text": "Alternativa D", "isCorrect": false}
                        ],
                        "explanation": "Explicação concisa da resposta correta"
                    }
                ]
            }
            
            REGRAS ESTRITAS DE FORMATAÇÃO:
            1. JSON VÁLIDO: Apenas o objeto JSON, sem texto adicional, comentários ou markdown
            2. ASPAS DUPLAS: Use exclusivamente aspas duplas (") para strings e propriedades
            3. SEM CARACTERES ESPECIAIS: 
               - Proibido: aspas simples ('), crases, barras invertidas, caracteres Unicode
               - Use apenas: letras A-Z, números 0-9, pontuação básica (. , ? !), espaços
            4. ESCAPE OBRIGATÓRIO: Se necessário, use \\" para aspas dentro de textos
            5. ESTRUTURA FIXA: 
               - Array "questions" com exatamente ${quantity} objetos
               - Cada questão deve ter "text", "alternatives" (array com 4 objetos) e "explanation"
               - Cada alternativa deve ter "id" (a-d), "text" e "isCorrect" (boolean)
            6. VALIDAÇÃO BOOLEANA: "isCorrect" deve ser true ou false (não 0/1, não strings)
            
            REGRAS DE CONTEÚDO:
            - Apenas UMA alternativa correta por questão (isCorrect: true)
            - Textos claros, objetivos e autocontidos
            - Dificuldade proporcional: 
              * "Fácil": fatos básicos, reconhecimento
              * "Médio": aplicação de conceitos, relações simples
              * "Difícil": análise, síntese, múltiplos conceitos
            
            EXEMPLO DE TEXTO VÁLIDO:
            "text": "Qual a capital da França?"
            "text": "Em que ano ocorreu a Revolução Francesa?"
            "text": "Explique o conceito de fotossíntese."
            
            EXEMPLO DE TEXTO INVÁLIDO:
            "text": "Qual a capital da França? (dica: começa com 'P')"
            "text": "Em que ano ocorreu a Revolução Francesa? - considere o século XVIII"
            "text": "Explique o conceito de fotossíntese usando os termos 'clorofila' e 'CO2'"
            
            RETORNE APENAS O JSON VÁLIDO, SEM QUALQUER TEXTO ADICIONAL, COMENTÁRIOS OU EXPLICAÇÕES.`;

            const ai = new GoogleGenAI({ apiKey });
            const result = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
            });
            const responseText = result.text;

            // Função robusta para limpar e validar JSON
            const cleanAndParseJSON = (jsonString) => {
                let cleaned = jsonString.trim();

                // Remove qualquer texto antes do primeiro { e depois do último }
                const firstBrace = cleaned.indexOf("{");
                const lastBrace = cleaned.lastIndexOf("}");

                if (firstBrace === -1 || lastBrace === -1) {
                    throw new Error("JSON não encontrado na resposta");
                }

                cleaned = cleaned.substring(firstBrace, lastBrace + 1);

                // Remove code blocks
                cleaned = cleaned.replace(/```(json)?/g, "");

                // Substitui aspas simples por duplas
                cleaned = cleaned.replace(/'/g, '"');

                // Corrige vírgulas trailing
                cleaned = cleaned.replace(/,\s*}/g, "}");
                cleaned = cleaned.replace(/,\s*]/g, "]");

                // Remove quebras de linha e tabs
                cleaned = cleaned.replace(/[\n\t]/g, " ");

                // Remove múltiplos espaços
                cleaned = cleaned.replace(/\s+/g, " ");

                // Corrige chaves sem aspas
                cleaned = cleaned.replace(
                    /([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$])(\s:)/g,
                    '$1"$2"$3'
                );

                // Corrige valores booleanos
                cleaned = cleaned.replace(/:(\s*)'(true|false)'/g, ":$1$2");
                cleaned = cleaned.replace(/:(\s*)"(true|false)"/g, ":$1$2");

                console.log(cleaned);

                return JSON.parse(cleaned);
            };

            const parsedData = cleanAndParseJSON(responseText);

            // Garantir que cada questão tenha um ID único baseado no índice
            const questionsWithId = parsedData.questions.map(
                (question, index) => ({
                    ...question,
                    id: index + 1, // ID único para cada questão
                    alternatives: question.alternatives || [], // Garantir que alternatives exista
                })
            );

            return {
                theme: theme,
                difficulty: difficulty,
                quantity: parseInt(quantity),
                questions: questionsWithId,
            };
        } catch (error) {
            console.error("Erro ao gerar questões com IA: ", error.message);
            throw new Error("Erro ao gerar questões com IA.");
        }
    }

    async GenerateDeck(idUser, theme, idSubject, quantity) {
        try {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error("Chave da API do Gemini não configurada.");
            }

            const prompt = `
            Aja como um especialista em criar flashcards de estudo.
            Sua tarefa é gerar ${quantity} flashcards sobre o tema "${theme}".
            As perguntas devem ser claras e as respostas devem ser diretas e informativas.
            Sua resposta DEVE ser um objeto JSON válido, contendo uma chave "cards", que é um array de objetos. Cada objeto no array deve ter duas chaves: "question" e "answer".
            Não adicione nenhum texto, comentário ou markdown antes ou depois do objeto JSON. A resposta deve ser apenas o JSON puro.
            Exemplo de formato de saída:
            {
              "cards": [
                {
                  "question": "Qual evento marcou o início da Revolução Francesa?",
                  "answer": "A Queda da Bastilha em 14 de julho de 1789."
                }
              ]
            }
        `;

            // ===== CORREÇÃO FINAL AQUI =====
            const ai = new GoogleGenAI({ apiKey });
            // Usando o nome do modelo que já funciona no seu outro método
            const result = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [{ parts: [{ text: prompt }] }],
            });
            // ===================================

            let responseText = result.text;

            responseText = responseText
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();

            const parsedData = JSON.parse(responseText);

            if (!parsedData.cards || !Array.isArray(parsedData.cards)) {
                throw new Error(
                    "A resposta da IA não continha um array de 'cards' válido."
                );
            }

            const newDeck = await DeckRepository.Create(
                idUser,
                idSubject,
                theme
            );
            if (!newDeck) {
                throw new Error("Falha ao criar o deck no banco de dados.");
            }
            const idDeck = newDeck.idDeck;

            const cardCreationPromises = parsedData.cards
                .map((card) => {
                    if (!card.question || !card.answer) {
                        console.warn("Card inválido da IA, pulando:", card);
                        return null;
                    }
                    return CardRepository.Create(
                        idDeck,
                        card.question,
                        card.answer
                    );
                })
                .filter((p) => p !== null);

            await Promise.all(cardCreationPromises);

            return DeckRepository.FindById(idDeck);
        } catch (error) {
            console.error("Erro detalhado ao gerar deck com IA: ", error);
            throw new Error(
                "Não foi possível gerar o deck com a IA. Tente novamente."
            );
        }
    }
}

export default new AiQuestionsService();
