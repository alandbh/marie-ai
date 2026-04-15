import { GET_PYTHON_PRELUDE } from "../constants";
import { Project } from "../projects-data";

const FORBIDDEN_HELPER_DEFINITIONS = [
    "normalize_text",
    "load_data",
    "check_success",
    "safe_get_name",
    "find_heuristic_id_by_text",
    "get_scores_for_heuristic",
    "get_heuristic_metadata",
    "player_succeeds",
    "resolve_heuristic_ref",
    "get_resolved_matches_for_year",
    "get_registry_entry_by_id",
    "get_registry_matches",
    "get_registry_search_blob",
    "load_project_registry",
];

const FORBIDDEN_ASSIGNMENTS = [
    "PROJECT_SLUG",
    "CURRENT_YEAR",
    "PREVIOUS_YEAR",
    "USE_PROJECT_CANONICAL",
    "PROJECT_CANONICAL_REGISTRY_FILE",
    "context_map",
    "project_registry",
    "canonical_heuristics",
];

export const sanitizePythonResponse = (raw: string): string => {
    if (!raw) return "";
    const fenceMatch = raw.match(/```(?:python)?\s*([\s\S]*?)```/i);
    const code = fenceMatch ? fenceMatch[1] : raw;
    return code.replace(/```python/gi, "").replace(/```/g, "").trim();
};

const looksLikePythonBody = (script: string): boolean => {
    if (!script) return false;
    const nonCommentLine = script
        .split("\n")
        .some((line) => line.trim() && !line.trim().startsWith("#"));
    if (!nonCommentLine) return false;

    const pythonSignals = [
        /^def\s+\w+\s*\(/m,
        /^for\s+\w+\s+in\s+/m,
        /^if\s+.+:/m,
        /\btarget_ids\s*=/,
        /\bheuristic_ref\s*=/,
        /\bplayers_current\b/,
        /\bprint\s*\(/,
    ];

    return pythonSignals.some((regex) => regex.test(script));
};

const validatePythonBody = (body: string) => {
    if (!looksLikePythonBody(body)) {
        throw new Error(
            "O modelo não retornou um corpo de script Python válido para esta análise.",
        );
    }

    for (const fnName of FORBIDDEN_HELPER_DEFINITIONS) {
        const regex = new RegExp(`^\\s*def\\s+${fnName}\\s*\\(`, "m");
        if (regex.test(body)) {
            throw new Error(
                `O modelo tentou redefinir o helper compartilhado "${fnName}".`,
            );
        }
    }

    for (const variableName of FORBIDDEN_ASSIGNMENTS) {
        const regex = new RegExp(`^\\s*${variableName}\\s*=`, "m");
        if (regex.test(body)) {
            throw new Error(
                `O modelo tentou sobrescrever a variável compartilhada "${variableName}".`,
            );
        }
    }
};

export const buildExecutablePythonScript = (
    rawResponse: string,
    project?: Project | null,
): string => {
    const pythonBody = sanitizePythonResponse(rawResponse);
    validatePythonBody(pythonBody);

    return `${GET_PYTHON_PRELUDE(project || undefined)}\n\n${pythonBody.trim()}\n`;
};
