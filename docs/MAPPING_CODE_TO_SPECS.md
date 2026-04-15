# Mapping Existing Code to Specs — SDD in Marie

Este guia ajuda a mapear código existente para especificações, criando a "ponte" entre implementação e SDD.

## Workflow: Code → Spec

Quando você quer especificar um módulo já implementado:

### 1. Leia o código existente
```bash
# Exemplo: especificar GeminiService
cat src/services/geminiService.ts
```

### 2. Extraia os contracts
- **Input**: que tipos de dados entram?
- **Output**: que tipos retorna?
- **Errors**: que erros são possíveis?

### 3. Crie arquivo de spec
```bash
touch specs/services/GeminiService.spec.md
```

### 4. Use o template (seção 2 abaixo)

### 5. Preencha seções
1. Overview (o que é, por que existe)
2. Interfaces & Contracts (input/output/errors)
3. Behavior (regras, casos especiais)
4. Examples (uso real)
5. Tests (casos esperados)
6. Notes & Constraints

### 6. Link código → spec
- Em SPEC_INDEX.md, adicione link para "Source Code"
- Em arquivo .ts, adicione comentário no topo: `// Spec: specs/services/GeminiService.spec.md`

### 7. Atualizar SPEC_INDEX.md
```markdown
| [GeminiService](./services/GeminiService.spec.md) | 1.0 | Implemented | Engenharia | 2026-04-15 |
```

---

## 2. Template para Nova Spec

Copie este template e preencha:

```markdown
# [Module Name] Specification

**Status**: Draft | Approved | Implemented | Deprecated
**Version**: 1.0
**Last Updated**: YYYY-MM-DD
**Owner**: [Role]
**Source Code**: [link to file(s)]

## 1. Overview

[O que é este módulo?]
[Por que existe?]
[Quem o usa?]

## 2. Interface & Contract

### 2.1 Shape (Tipos)

[TypeScript interface ou type, com anotações]

### 2.2 Input

[Exemplos de entrada válida]

### 2.3 Output

[Exemplos de saída esperada]

### 2.4 Errors

| Error | Cause | Handler |
|-------|-------|---------|
| ErrorCode | O que causou | Como tratar |

## 3. Behavior & Rules

[Invariantes, regras não-óbvias, casos especiais]

## 4. Examples

### 4.1 Happy Path
[Caso de uso normal]

### 4.2 Sad Path
[Caso de erro ou limite]

## 5. Tests

[Casos de teste esperados]

## 6. Notes & Constraints

[Limitações, decisões de design, futuro]

---

## Cross-References

[Links para specs relacionadas]
```

---

## 3. Checklist: Quando um Spec está "Implementado"

Um spec marcado como **Implemented** significa que:

- [ ] Código atual passa em todos os tests derivados da spec
- [ ] Código respeita contrato de input/output
- [ ] Todos os casos de erro em spec.md estão tratados no código
- [ ] Nenhuma feature extra não-documentada
- [ ] Docs inline em código referem a spec

Se código diverge de spec:
1. **Opção A**: Código está errado → arreglar código
2. **Opção B**: Spec está desatualizada → atualizar spec + version bump

---

## 4. Exemplos de Mapeamento

### 4.1 GeminiService → Spec

**Código:**
```typescript
// src/services/geminiService.ts
export async function generateScript(question: string): Promise<string> {
  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent(question);
  return extractPythonCode(result.response.text());
}
```

**Spec Extraído:**

```markdown
## 2. Interface & Contract

### 2.2 Input
- `question: string` — pergunta em português do usuário
- Context: project, year, systemPrompt já inclusos em função wrapper

### 2.3 Output
- `Promise<string>` — corpo Python executável (sem imports, sem boilerplate)
- Format: blocos de código marcados com ```python ... ```

### 2.4 Errors
| Error | Cause | Handler |
|-------|-------|---------|
| `TIMEOUT` | Gemini não respondeu em 20s | retry com backoff |
| `INVALID_FORMAT` | Resposta não contém bloco ```python | erro "Modelo não gerou código válido" |
| `API_ERROR` | Google API retorna erro | logar + erro "Serviço indisponível" |
```

---

## 5. Padrão: Integração entre Spec e Código

Seu código deve referenciar sua spec:

```typescript
/**
 * Gera script Python a partir de pergunta do usuário.
 * 
 * Spec: specs/services/GeminiService.spec.md
 * 
 * @param question - pergunta em português (validado)
 * @returns Promise de corpo Python executável
 * @throws {TIMEOUT, INVALID_FORMAT, API_ERROR}
 */
export async function generateScript(question: string): Promise<string> {
  // ... implementação
}
```

---

## 6. Sincronismo: Código Muda → Spec Muda

Se você mexe no código e **muda o contrato**:

```typescript
// ANTES (spec diz: return Promise<string>)
export async function generateScript(q: string): Promise<string>

// DEPOIS (você quer retornar objeto com detalhes)
export async function generateScript(q: string): Promise<{ 
  script: string; 
  model: string; 
  inputTokens: number 
}>
```

**Ação obrigatória:**
1. Atualizar spec.md com novo output shape
2. Bump version: `1.0` → `1.1` (MINOR)
3. PR title: `feat(spec): GeminiService return type includes token count`
4. Atualizar SPEC_INDEX.md
5. Se código já implementa: atualizar testes

---

## 7. Validação: Spec Review Checklist

Ao revisar spec ou PR que mexe em spec:

### Completude
- [ ] Overview claro?
- [ ] Interfaces documentadas com tipos?
- [ ] Todos os errors listados?
- [ ] Exemplos cobrem happy + sad path?

### Correctness
- [ ] Spec bate com código atual?
- [ ] Nenhuma contradição interna?
- [ ] Constraints são realistas?

### Usabilidade
- [ ] Developer consegue implementar só lendo spec?
- [ ] QA consegue criar testes só lendo spec?

---

## 8. Próximos Passos

Para seu projeto:

1. **Semana 1**: Mapear serviços principais
   - [ ] GeminiService.spec.md
   - [ ] PythonScriptBuilder.spec.md
   - [ ] FirebaseClient.spec.md

2. **Semana 2**: Mapear workflows críticos
   - [ ] QuestionToAnalysis.workflow.md ✅ (já feito)
   - [ ] Authentication.workflow.md
   - [ ] ProjectDataLoad.workflow.md

3. **Semana 3**: Mapear tipos
   - [ ] Message.spec.md
   - [ ] ProcessingStep.spec.md
   - [ ] AppState.spec.md

4. **Semana 4**: Validar testes contra specs
   - [ ] Rodar testes existentes
   - [ ] Cobrir gaps de teste

---

## 9. Comandos Úteis

```bash
# Encontrar todos os arquivos de spec
find specs -name "*.spec.md" -o -name "*.workflow.md"

# Atualizar SPEC_INDEX.md com novo spec
# (manual, não há automação)

# Buscar specs pendentes
grep -r "Status.*Draft" specs/

# Validar que código referencia spec
grep -r "Spec:" src/
```

---

**Leitura Recomendada:**
- [docs/SDD.md](./SDD.md) — princípios de SDD
- [specs/SPEC_INDEX.md](../specs/SPEC_INDEX.md) — índice de specs
- [CLAUDE.md](../CLAUDE.md) — arquitetura (nível alto)
