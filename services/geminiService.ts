import { GoogleGenAI } from "@google/genai";
import {
    GET_INITIAL_SYSTEM_INSTRUCTION,
    RESPONSE_FORMATTER_PROMPT,
} from "../constants";
import { buildProjectPromptHint } from "../prompt/projects";
import { Project } from "../projects-data";
import { buildExecutablePythonScript } from "./pythonScriptBuilder";

const PYTHON_ONLY_INSTRUCTION = `
Regras críticas para gerar o script Python:
- O runtime já injeta automaticamente o boilerplate compartilhado antes do seu código.
- Responda APENAS com o corpo do script Python executável, sem markdown e sem texto extra.
- Nunca reescreva imports, carregamento de dados ou helpers compartilhados.
- Use somente bibliotecas padrão e os helpers já disponíveis no boilerplate.
`;

const DATASET_HINT = `
Dados já disponíveis no runtime:
- heuristicas.json e resultados.json já serão carregados pelo boilerplate.
- Para projects finance com registry canônico, o arquivo adicional do projeto também já será carregado pelo boilerplate.
`;

export class GeminiService {
    private client: GoogleGenAI;
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
        this.client = new GoogleGenAI({ apiKey });
    }

    async generatePythonScript(
        userPrompt: string,
        project?: Project | null,
    ): Promise<string> {
        try {
            const systemInstruction = `${GET_INITIAL_SYSTEM_INSTRUCTION(project || undefined)}\n\n${PYTHON_ONLY_INSTRUCTION}`;
            const projectHint = buildProjectPromptHint(
                project || undefined,
                userPrompt,
            );
            const userMessage = `${userPrompt}

${projectHint ? `${projectHint}\n\n` : ""}${DATASET_HINT}
Lembrete: responda somente com código Python executável, sem markdown ou texto extra.`;

            const response = await this.client.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [{ role: "user", parts: [{ text: userMessage }] }],
                config: {
                    systemInstruction,
                    temperature: 0.1, // Low temperature for precise code generation
                },
            });

            return buildExecutablePythonScript(
                response.text || "",
                project || undefined,
            );
        } catch (error) {
            console.error("Error generating script:", error);
            throw new Error(
                error instanceof Error
                    ? error.message
                    : "Falha ao gerar o script Python desta análise.",
            );
        }
    }

    async generateNaturalLanguageResponse(
        userPrompt: string,
        pythonOutput: string,
    ): Promise<string> {
        try {
            const prompt = `
      PERGUNTA ORIGINAL DO USUÁRIO: "${userPrompt}"
      
      DADOS BRUTOS CALCULADOS PELO PYTHON:
      ${pythonOutput}
      
      Gere a resposta final para o usuário.
      `;

            const response = await this.client.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                config: {
                    systemInstruction: RESPONSE_FORMATTER_PROMPT,
                },
            });

            return response.text || "Erro ao formatar resposta final.";
        } catch (error) {
            console.error("Error generating response:", error);
            throw new Error("Failed to format final response.");
        }
    }
}
