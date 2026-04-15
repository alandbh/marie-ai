# Project Interface Specification

**Status**: Implemented  
**Version**: 1.0  
**Last Updated**: 2026-04-15  
**Owner**: Engenharia  
**Source Code**: [types.ts](../../src/types.ts), [projects-data.ts](../../src/projects-data.ts)

## 1. Overview

`Project` é a interface que define um estudo heurístico gerenciável dentro de Marie. Representa todos os metadados necessários para carregar dados, autorizar acesso, e rotear perguntas para o pipeline correto de análise.

**Usuários:**
- Roteador de autenticação (autorizar acesso por projeto)
- Loader de dados (buscar dados de APIs)
- Prompt builder (customizar comportamento por tipo)
- UI de seleção (listar projetos para usuário autenticado)

## 2. Interface & Contract

### 2.1 Shape

```typescript
interface Project {
  // Identificação
  slug: string;                    // URL key (ex: "finance5", "retail6")
  name: string;                    // Display name (ex: "Finance 5")
  
  // Temporal
  year: number;                    // Ano atual do estudo (ex: 2026)
  previousSlug?: string | null;    // slug do ano anterior (ex: "finance4")
  previousName?: string | null;    // name do ano anterior
  previousYear?: number | null;    // year do ano anterior (ex: 2025)
  
  // Tipo de Análise
  type: "finance" | "retail";      // Roteia para prompt/finance ou prompt/retail
  
  // Dados
  resultsApi: {
    url: string;                   // Base URL endpoint (ex: "https://gcis-hub.rgasp.com.br")
    api_key: string;               // API key para autenticação
  };
  heuristicsApi: {
    url: string;
    api_key: string;
  };
  
  // Controle de Acesso (opcional)
  allowedUsers?: string[];         // Email whitelist para acesso externo
}
```

### 2.2 Input (Construction)

Project é construído hardcoded em `projects-data.ts` e carregado em memória.

```typescript
// Exemplo válido
const project: Project = {
  slug: "finance5",
  name: "Finance 5 2026",
  year: 2026,
  previousSlug: "finance4",
  previousName: "Finance 4 2025",
  previousYear: 2025,
  type: "finance",
  resultsApi: {
    url: "https://gcis-hub.rgasp.com.br",
    api_key: "20rga25"
  },
  heuristicsApi: {
    url: "https://gcis-hub.rgasp.com.br",
    api_key: "20rga25"
  },
  allowedUsers: ["user@external.com"]
};
```

### 2.3 Output (Usage)

Project é usado em:
1. **Verificação de autorização**: `allowedUsers` + domínio
2. **Seleção de prompt**: `type` → `finance.ts` ou `retail.ts`
3. **Carregamento de dados**: `resultsApi.url`, `heuristicsApi.url`, `api_key`
4. **Comparação histórica**: `previousSlug`, `year`, `previousYear`

```typescript
// App.tsx usage
const selectedProject = projects.find(p => p.slug === projectSlug);
if (!selectedProject) throw Error("Project not found");

// Autorização
const isAllowed = user.email.endsWith("@rga.com") || 
                  selectedProject.allowedUsers?.includes(user.email);

// Carregamento
const results = await fetch(
  `${selectedProject.resultsApi.url}/api/result?project=${selectedProject.slug}`,
  { headers: { api_key: selectedProject.resultsApi.api_key } }
);

// Prompt routing
const promptBuilder = selectedProject.type === "finance" 
  ? buildFinancePrompt
  : buildRetailPrompt;
```

### 2.4 Errors

| Error | Cause | Handler |
|-------|-------|---------|
| `Project not found` | slug não existe em `projects-data.ts` | Redirecionar para `/projects` |
| `Unauthorized` | usuário não em `allowedUsers` + não @rga.com | Mostrar "Access Denied" |
| `Invalid API credentials` | `api_key` expirado ou wrong | Retry com exp backoff, logar erro |
| `Missing required field` | `slug`, `type`, `resultsApi` não definido | Erro build-time em `projects-data.ts` |

## 3. Behavior & Rules

### 3.1 Invariantes

- `slug` deve ser único globalmente em `projects-data.ts`
- `slug` deve ser URL-safe (lowercase, hyphens, alphanumeric)
- `year` deve ser número inteiro positivo
- `type` deve ser um dos: `"finance"`, `"retail"`
- Se `previousSlug` está definido, `previousYear` deve estar também (vice-versa)
- `resultsApi.url` e `heuristicsApi.url` devem ser URLs válidas

### 3.2 Comparação Temporal

Projects suportam análise year-over-year:
- `currentYear` = `year` (ex: 2026)
- `previousYear` = `previousYear` field (ex: 2025)
- Ambos carregam dados separados via API
- Prompt router ativa modo "comparison" se ambos existem

### 3.3 Autorização

Acesso é permitido se:
- Usuário tem email `@rga.com` (RGA interno), OU
- `allowedUsers` não está definido (projeto público), OU
- Email do usuário está em `allowedUsers` (whitelist externo)

Lógica em `App.tsx:isProjectAllowed(user, project)`

### 3.4 Roteamento de Prompt

- `type: "finance"` → usa `prompt/finance.ts` + extensões em `prompt/projects/finance5.ts` se `slug === "finance5"`
- `type: "retail"` → usa `prompt/retail.ts`

## 4. Examples

### 4.1 Happy Path — Project Load

```typescript
// User acessa /projects/finance5
const slug = "finance5";
const project = projects.find(p => p.slug === slug);
// Retorna:
{
  slug: "finance5",
  name: "Finance 5",
  year: 2026,
  previousSlug: "finance4",
  previousYear: 2025,
  type: "finance",
  resultsApi: { url: "https://...", api_key: "20rga25" },
  heuristicsApi: { url: "https://...", api_key: "20rga25" }
}

// App carrega dados
const results = await fetch(resultsApi.url + "?project=finance5", ...)
// ✅ Sucesso
```

### 4.2 Sad Path — Unauthorized

```typescript
const user = { email: "external@competitor.com" };
const project = {
  slug: "retail6",
  allowedUsers: ["partner@partner.com"]
};

const allowed = isProjectAllowed(user, project);
// ❌ false → erro "Acesso negado a este projeto"
```

### 4.3 Sad Path — Project Not Found

```typescript
const slug = "unknown-project";
const project = projects.find(p => p.slug === slug);
// ❌ undefined → erro "Projeto não encontrado"
```

## 5. Tests

### Unit Tests (esperados)

```typescript
describe("Project interface", () => {
  it("should find project by slug", () => {
    const project = projects.find(p => p.slug === "finance5");
    expect(project).toBeDefined();
    expect(project?.type).toBe("finance");
  });
  
  it("should deny access to external user not in allowedUsers", () => {
    const user = { email: "external@unknown.com" };
    const project = projects.find(p => p.slug === "retail6");
    expect(isProjectAllowed(user, project)).toBe(false);
  });
  
  it("should allow access to @rga.com user", () => {
    const user = { email: "user@rga.com" };
    const project = projects.find(p => p.slug === "finance5");
    expect(isProjectAllowed(user, project)).toBe(true);
  });
  
  it("should route finance type to finance prompt builder", () => {
    const project = projects.find(p => p.slug === "finance5");
    expect(project?.type).toBe("finance");
  });
});
```

### Integration Tests (esperados)

```typescript
describe("Project data load workflow", () => {
  it("should load results data from resultsApi", async () => {
    const project = projects.find(p => p.slug === "finance5");
    const data = await fetchProjectResults(project);
    expect(data.players).toBeDefined();
    expect(data.players.length).toBeGreaterThan(0);
  });
  
  it("should load heuristics data from heuristicsApi", async () => {
    const project = projects.find(p => p.slug === "finance5");
    const data = await fetchProjectHeuristics(project);
    expect(data.heuristics).toBeDefined();
  });
});
```

## 6. Notes & Constraints

### 6.1 Current Limitations

- `previousSlug` e `previousYear` são opcionais, mas se um está definido, ambos devem estar (validação não é automatizada atualmente)
- Não há versionamento de projeto — mudanças em `projects-data.ts` são globais
- `allowedUsers` é uma whitelist simples (email string matching) — sem grupos ou roles

### 6.2 Design Decisions

1. **Project é hardcoded em `projects-data.ts`**: decisão de segurança (sem DB dinâmica nesta etapa)
2. **Duas APIs separadas (`resultsApi`, `heuristicsApi`)**: permite evolução independente de dados e metadados
3. **Whitelist é array de strings**: simples, auditável, sem dependência de serviço externo

### 6.3 Future Evolution (não escopo atual)

- Carregar projects de banco de dados (com versioning)
- Suportar groups/roles em vez de whitelist de emails
- Adicionar `validationSchema` por projeto para validar payloads de API

---

## Cross-References

- **Used by**: [App.tsx](../../src/App.tsx), [pages/ProjectSlug.tsx](../../src/pages/ProjectSlug.tsx)
- **Defined in**: [types.ts](../../src/types.ts), [projects-data.ts](../../src/projects-data.ts)
- **Related specs**: 
  - [Message](./Message.spec.md)
  - [QuestionToAnalysis.workflow](../workflows/QuestionToAnalysis.workflow.md)
