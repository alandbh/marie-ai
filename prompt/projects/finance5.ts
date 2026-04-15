import {
    CanonicalHeuristicEntry,
    finance5CanonicalRegistry,
} from "../../finance5CanonicalRegistry";
import { PromptProjectExtension } from "../common";

export const getFinance5PromptExtension = (): PromptProjectExtension => ({
    routerSection: `
### MODO CANÔNICO ESPECIAL: FINFACTS 5
**Quando usar:**
- Sempre que o projeto atual for \`finance5\`.
**Ação obrigatória:**
- Não confie em \`journey + heuristicNumber\` nem em números brutos sozinhos.
- Use \`find_heuristic_id_by_text(...)\` para obter uma referência de heurística.
- Essa referência pode ser um \`canonicalId\`.
- Para score, metadata e comparação entre anos, use sempre os helpers do boilerplate:
  - \`get_scores_for_heuristic(player, heuristic_ref, target_year)\`
  - \`get_heuristic_metadata(heuristic_ref, target_year)\`
  - \`player_succeeds(player, heuristic_ref, target_year)\`
- Se o prompt do usuário trouxer um número ambíguo, prefira o título exato da heurística em vez do número isolado.
- Se continuar ambíguo, gere um script conservador que mostre a ambiguidade em vez de conflar conceitos diferentes.
`.trim(),
    runtimeConfig: `
USE_PROJECT_CANONICAL = True
PROJECT_CANONICAL_REGISTRY_FILE = "finance5_canonical_heuristics.json"
`.trim(),
    mode2Guidance: `
4. **FinFacts 5**
   - Se houver colisão entre números iguais, use o título exato ou o conceito canônico.
   - Não force comparação 1:1 quando a relação for \`split\`, \`merged\`, \`new_2026\` ou \`retired_2025\`.
`.trim(),
    mode3Guidance: `
4. **FinFacts 5**
   - Se o usuário mencionar um número ambíguo, procure a jornada e o título mais compatíveis antes de escolher a heurística.
   - Em caso de ambiguidade real, mostre a ambiguidade no output em vez de misturar notas de conceitos diferentes.
`.trim(),
});

interface CanonicalPromptResolution {
    resolvedEntry?: CanonicalHeuristicEntry;
    candidates: CanonicalHeuristicEntry[];
    ambiguous: boolean;
}

const normalizeText = (text: string) =>
    text
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

const tokenize = (text: string) =>
    normalizeText(text)
        .replace(/[^\w\s.]/g, " ")
        .split(/\s+/)
        .filter(Boolean);

const getEntrySearchCorpus = (entry: CanonicalHeuristicEntry) => {
    const parts = [entry.canonicalId, entry.label, entry.notes || ""];
    for (const year of ["2025", "2026"] as const) {
        for (const match of entry.matches[year]) {
            parts.push(match.title, match.heuristicNumber, match.journey);
        }
    }
    return normalizeText(parts.join(" "));
};

const extractHeuristicNumbers = (text: string) =>
    Array.from(text.matchAll(/\b\d+\.\d+\b/g), (match) => match[0]);

const resolveFinance5Prompt = (
    userPrompt: string,
): CanonicalPromptResolution => {
    const promptNorm = normalizeText(userPrompt);
    const promptTokens = tokenize(userPrompt);
    const explicitNumbers = extractHeuristicNumbers(userPrompt);

    const scored = finance5CanonicalRegistry.canonicalHeuristics
        .map((entry) => {
            const corpus = getEntrySearchCorpus(entry);
            let score = 0;

            for (const num of explicitNumbers) {
                const currentHasNumber = entry.matches["2026"].some(
                    (match) => match.heuristicNumber === num,
                );
                const previousHasNumber = entry.matches["2025"].some(
                    (match) => match.heuristicNumber === num,
                );
                if (currentHasNumber) score += 80;
                if (previousHasNumber) score += 40;
            }

            const exactLabel = normalizeText(entry.label);
            if (exactLabel && promptNorm.includes(exactLabel)) score += 60;
            if (promptNorm.includes(normalizeText(entry.canonicalId))) score += 40;

            for (const year of ["2025", "2026"] as const) {
                for (const match of entry.matches[year]) {
                    const normalizedTitle = normalizeText(match.title);
                    if (normalizedTitle && promptNorm.includes(normalizedTitle)) {
                        score += 100;
                        if (year === "2026" && entry.matches["2026"].length === 1) {
                            score += 15;
                        }
                    }
                }
            }

            for (const token of promptTokens) {
                if (corpus.includes(token)) score += 4;
            }

            return { entry, score };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score);

    if (scored.length === 0) {
        return { candidates: [], ambiguous: false };
    }

    const [first, second] = scored;
    const isAmbiguous = scored.length > 1 && first.score === second.score;

    return {
        resolvedEntry: isAmbiguous ? undefined : first.entry,
        candidates: isAmbiguous
            ? scored
                  .filter((item) => item.score === first.score)
                  .map((item) => item.entry)
            : [first.entry],
        ambiguous: isAmbiguous,
    };
};

const formatMatches = (entry: CanonicalHeuristicEntry, year: "2025" | "2026") =>
    entry.matches[year]
        .map(
            (match) =>
                `${year} / ${match.journey} / ${match.heuristicNumber} / ${match.title}`,
        )
        .join("\n  - ");

export const buildFinance5PromptHint = (userPrompt?: string) => {
    if (!userPrompt?.trim()) {
        return "";
    }

    const resolution = resolveFinance5Prompt(userPrompt);
    if (resolution.resolvedEntry) {
        const entry = resolution.resolvedEntry;
        return `
FINFACTS 5 CANONICAL CONTEXT:
- Use o conceito canônico \`${entry.canonicalId}\`.
- Label: ${entry.label}
- Relation: ${entry.relation}
- Matches 2025:
  - ${formatMatches(entry, "2025") || "Sem correspondente"}
- Matches 2026:
  - ${formatMatches(entry, "2026") || "Sem correspondente"}
${entry.notes ? `- Notes: ${entry.notes}` : ""}
- Para este projeto, não confunda heurísticas pelo número bruto nem pela jornada antiga.
`.trim();
    }

    if (resolution.ambiguous && resolution.candidates.length > 0) {
        const candidates = resolution.candidates
            .map(
                (entry) =>
                    `- ${entry.canonicalId} | ${entry.label}\n  2026: ${formatMatches(entry, "2026") || "Sem correspondente"}`,
            )
            .join("\n");

        return `
FINFACTS 5 CANONICAL WARNING:
- A referência do usuário está ambígua neste projeto.
- Não assuma equivalência usando apenas o número bruto da heurística.
- Se precisar escolher uma heurística no script, use o título exato mais compatível com a pergunta.
- Candidatas:
${candidates}
`.trim();
    }

    return `
FINFACTS 5 CANONICAL MODE:
- Este projeto possui colisões entre journey + heuristicNumber nas edições 2025 e 2026.
- Use sempre os helpers canônicos do boilerplate e evite comparar anos pelo mesmo \`h_x.y\` bruto.
`.trim();
};
