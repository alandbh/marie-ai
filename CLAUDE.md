# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # Install dependencies
npm run dev       # Dev server at http://localhost:3000
npm run build     # Production build
npm run preview   # Preview production build
```

No test or lint commands are configured.

## Spec-Driven Development (SDD)

This project uses **Spec-Driven Development**. Before implementing anything:

1. **Read specs first** — check [`specs/SPEC_INDEX.md`](specs/SPEC_INDEX.md)
2. **Find relevant spec** — e.g., [`specs/interfaces/Project.spec.md`](specs/interfaces/Project.spec.md)
3. **Implement by spec** — code follows contract defined in spec
4. **Update spec if needed** — if code changes contract, bump spec version

See [`docs/SDD.md`](docs/SDD.md) for principles and [`docs/CLAUDE_AND_SDD.md`](docs/CLAUDE_AND_SDD.md) for how Claude Code agents work with SDD.

## Architecture Overview

**Marie** is an AI-powered UX heuristic data analysis platform. The core innovation: user questions become Python scripts that run locally in a **WebAssembly (Pyodide)** runtime in the browser — raw research data never reaches any LLM.

### Data Analysis Pipeline

1. User authenticates (Firebase Google Sign-In)
2. Selects a project → app fetches heuristic scores and definitions from remote APIs
3. Fetched data is written to the Pyodide virtual filesystem as JSON files
4. User asks a natural language question
5. **LLM Step 1** (Gemini or Ollama): question → Python script
6. **Validation**: forbidden patterns checked, shared boilerplate injected
7. **Execution**: `pyodide.runPythonAsync(fullScript)` in-browser
8. **LLM Step 2**: Python stdout → natural language Markdown response
9. UI renders result + expandable technical logs (script, stdout, stderr)

### Key Source Files

- `App.tsx` — main shell: auth, routing, the full processing pipeline (state machine: IDLE → GENERATING_SCRIPT → EXECUTING_PYTHON → GENERATING_RESPONSE → DONE)
- `projects-data.ts` — project registry: each project has `resultsApi`, `heuristicsApi`, `allowedUsers`, `type` (finance | retail), and year info
- `constants.ts` — assembles system prompts per project type
- `prompt/common.ts` — shared prompt boilerplate builder (injected into every Python script)
- `prompt/finance.ts` / `prompt/retail.ts` — project-type-specific prompt sections (routing logic, mode selection, template)
- `prompt/projects/finance5.ts` — finance5 extensions including canonical heuristic registry rules
- `finance5CanonicalRegistry.ts` — 1,210-line registry tracking heuristic relationships across years (equivalent, renumbered, split, merged, new_2026, retired_2025)
- `services/geminiService.ts` — Gemini API calls: script generation + response formatting
- `services/pythonScriptBuilder.ts` — sanitizes LLM output, validates forbidden patterns, prepends boilerplate
- `types.ts` — all TypeScript interfaces (AuthUser, Message, AppState, Project, ProcessingStep)

### Prompt System (Three Modes)

The LLM chooses one of three modes based on user intent:

| Mode | When | Output |
|------|------|--------|
| 1 – Rigid Template | Simple heuristic lookup by ID or name | Fixed lists A/B/C/D/E (success, failure, improved, worsened, insight) |
| 2 – Custom Query | Filters, counts, cross-data joins | Custom Python script using shared helpers |
| 3 – Qualitative Notes | Reading `note` fields, evidence, examples | Script printing note text per player/journey |

### Python Execution Context

Every generated script runs with pre-injected boilerplate that provides:
- Standard imports (`json`, `unicodedata`, `math`, `re`)
- Helpers: `normalize_text`, `load_data`, `check_success`, `safe_get_name`, `find_heuristic_id_by_text`, `get_scores_for_heuristic`
- Data: `heuristics_data`, `players_current`, `players_previous`
- Runtime constants: `PROJECT_SLUG`, `CURRENT_YEAR`, `PREVIOUS_YEAR`, `context_map`
- Finance5 only: canonical registry helpers for cross-year heuristic analysis

Scripts must **not** redefine shared helpers — a forbidden-pattern check blocks this before execution.

### Authorization Model

- Internal: any `@rga.com` email has full access
- External: per-project `allowedUsers` whitelist in `projects-data.ts`
- Auth state managed in `App.tsx` via Firebase `onAuthStateChanged`

### Environment Variables (`.env`)

```
VITE_GEMINI_API_KEY
VITE_PROJECT_API_KEY        # Shared key for all project data endpoints
VITE_BASE_API_URL           # Base URL for heuristics/results APIs

VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_APP_ID

# Optional:
VITE_OLLAMA_BASE_URL        # defaults to http://localhost:11434
VITE_OLLAMA_MODEL           # defaults to gemma3:4b
```

### Adding a New Project

1. Add entry to `projects-data.ts` with `slug`, `name`, `year`, `type`, `resultsApi`, `heuristicsApi`
2. If it needs custom prompt logic, add a file under `prompt/projects/` and wire it in `prompt/projects/index.ts`
3. For finance-type projects, extend `finance5CanonicalRegistry.ts` if cross-year heuristic tracking is needed

### Localization Note

All user-facing strings and error messages are in **Portuguese (pt-BR)**. Keep new messages consistent with existing language.
