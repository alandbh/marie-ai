# Claude & SDD — Best Practices for AI Agents in Marie

Este documento estabelece como **Claude Code** (agentes IA) trabalham com Spec-Driven Development no projeto Marie.

Baseado em [PRD.md — Seção 9: Governança para Agentes de IA](../PRD.md#9-governança-para-agentes-de-ia-completa).

## 1. Contexto Mínimo Obrigatório

Antes de Claude Code agir, ele deve ter acesso a:

```markdown
## Mandatory Context (sempre ler)

1. [CLAUDE.md](../CLAUDE.md)
   - O quê: projeto, stack, arquitetura
   - Quando: primeiro encontro
   - Tempo: 5 minutos

2. [specs/SPEC_INDEX.md](../specs/SPEC_INDEX.md)
   - O quê: índice de todas as specs
   - Quando: antes de implementar
   - Tempo: 3 minutos

3. Spec relevante (e.g., [services/GeminiService.spec.md](../specs/services/GeminiService.spec.md))
   - O quê: contrato do módulo que você vai tocar
   - Quando: antes de escrever código
   - Tempo: 10 minutos

4. [docs/SDD.md](./SDD.md)
   - O quê: como SDD funciona neste projeto
   - Quando: antes de criar nova spec
   - Tempo: 10 minutos
```

**Checklist (Claude sempre deve fazer):**
- [ ] Li CLAUDE.md?
- [ ] Consulto SPEC_INDEX.md para status?
- [ ] Li specs relevantes?
- [ ] Se crio nova spec, li SDD.md?

## 2. Workflow: Claude + Specs

### Cenário A: "Implementar mudança em módulo existente"

```
1. Claude lê SPEC_INDEX.md
   ↓ Encontra spec relevante (e.g., GeminiService.spec.md)
   ↓ Status = "Implemented" ou "Draft"
   
2. Claude lê a spec completa
   ↓ Entende: input, output, errors, constraints
   
3. Claude lê código atual em src/
   ↓ Valida que código bate com spec
   
4. Claude implementa mudança
   ↓ Código segue spec, não quebra contracts
   
5. Claude roda testes
   ↓ Tudo passa
   
6. Claude atualiza spec (se necessário)
   ↓ Version bump, SPEC_INDEX.md update
   
7. Claude cria PR
   ↓ Título: "feat: [tipo] módulo com [mudança]"
   ↓ Body referencia spec: "Implements specs/services/GeminiService.spec.md v1.0"
```

### Cenário B: "Criar nova funcionalidade"

```
1. Claude lê PRD.md + CLAUDE.md + SPEC_INDEX.md
   ↓ Entende contexto, gaps atuais
   
2. Claude **cria spec PRIMEIRO**
   ↓ ANTES de código, não depois
   ↓ Spec em Draft status
   ↓ Adiciona em SPEC_INDEX.md
   
3. Humano revisa spec
   ↓ Aprova ou sugere mudanças
   
4. Claude implementa conforme spec aprovada
   ↓ Código segue contrato
   ↓ Testes cobrem casos da spec
   
5. Claude marca spec como "Implemented"
   ↓ SPEC_INDEX.md status muda
   
6. Claude cria PR
   ↓ Título: "feat: [feature name]"
   ↓ Body: "Spec: specs/[path]/[Module].spec.md (v1.0)"
```

### Cenário C: "Debugar ou investigar"

```
1. Claude lê SPEC_INDEX.md
   ↓ Encontra spec de módulo em questão
   
2. Claude lê spec (não código ainda)
   ↓ Entende contrato esperado
   
3. Claude compara: código atual vs spec
   ↓ Se divergem → "Spec Drift" issue
   
4. Claude investiga causa
   ↓ Código tem bug? Spec desatualizada? Ambos?
   
5. Claude propõe solução
   ↓ Consertar código E atualizar spec?
   ↓ Apenas um dos dois?
```

## 3. Guardrails (Proibições)

Claude **NUNCA** faz (sem aprovação explícita):

| Proibição | Razão | Consequência |
|-----------|-------|-------------|
| Mudar spec aprovada sem issue | Quebra sincronia com código | Spec drift |
| Implementar sem spec | Código "fantasma" sem contrato | Retrabalho |
| Quebrar contrato de spec | Quebra dependências | Cascata de erros |
| Suprimir erro crítico Python | Perde auditoria | Falha silenciosa |
| Inferir equivalência de heurística sem evidência | Análise errada | Resultado inválido |
| Executar comando destrutivo (rm -rf, force push, etc) | Perda de trabalho | Incidente |

## 4. Padrão: PR com Spec

Quando Claude abre PR, deve incluir:

```markdown
## PR Title
feat(spec): [módulo] [mudança breve]
feat(services): PythonScriptBuilder aceita validação customizada

## Body
### Summary
[O quê mudou]

### Spec Reference
Implements/Updates: `specs/services/PythonScriptBuilder.spec.md`
Version: `1.0` → `1.1` (se mudança)
Status: `Implemented`

### Testing
- [ ] Testes passam conforme spec section 5
- [ ] Nenhuma mudança quebra spec publicada
- [ ] Novos cases em spec têm testes

### Checklist
- [ ] Especificação lida e entendida?
- [ ] Specs de dependências conferidas?
- [ ] Código segue interfaces definidas?
- [ ] Todos errors de spec estão tratados?
- [ ] SPEC_INDEX.md atualizado?
```

## 5. Decisão: Código Divergiu de Spec

Se Claude descobre que **código não bate com spec**:

### Opção A: Código está errado
```
→ Consertar código para bater com spec
→ Testes garantem aderência
→ PR title: "fix: [module] [issue]"
→ Body: "Spec: specs/[path]/[Module].spec.md v1.0"
```

### Opção B: Spec está desatualizada
```
→ Abrir issue "Spec Drift: [Module]"
→ Comentar: "Código implementa X mas spec diz Y"
→ Atualizar spec
→ Version bump de spec
→ Avisar team: "Spec [Module] updated v1.0→1.1"
```

### Opção C: Ambos estão errados
```
→ Nunca inferir — abrir issue para discussão
→ Propor solução (código + spec) em comment
→ Aguardar aprovação humana
```

## 6. Checklist: Antes de Claude Implementar

```
PRE-IMPLEMENTATION CHECKLIST

Project Understanding:
  [ ] Projeto é Marie (UX heuristic analysis)
  [ ] Stack: React, Gemini, Pyodide, Firebase
  [ ] Arquitetura: Pergunta → Script Python → Análise local

Spec Understanding:
  [ ] Li SPEC_INDEX.md
  [ ] Spec existe em `specs/`?
    - SIM: li spec completa, entendi contracts
    - NÃO: vou criar spec antes de código
  
Code Understanding:
  [ ] Encontrei código em `src/`?
  [ ] Código bate com spec?
    - SIM: posso implementar
    - NÃO: abrir "Spec Drift" issue
  
Dependency Understanding:
  [ ] Meu módulo depende de quais outros?
  [ ] Li specs dos dependentes?
  [ ] Meus contracts batem com expectations deles?

Testing Understanding:
  [ ] Testes existem para este módulo?
  [ ] Testes cobrem casos de spec?
  [ ] Vou escrever novos testes para nova funcionalidade?

Approval Understanding:
  [ ] Sou o owner? (vejo em SPEC_INDEX.md?)
  [ ] Se não, aviso owner antes?
  [ ] Se mudança quebra spec, issue aberto?
```

## 7. Common Patterns

### Pattern 1: Implementar Novo Serviço

```typescript
// ANTES: Criar spec
// specs/services/NewService.spec.md
// Status: Draft
// Adicionar em SPEC_INDEX.md

// DEPOIS: Implementar
// src/services/NewService.ts
/**
 * [Descrição]
 * Spec: specs/services/NewService.spec.md
 */
export async function newFunction(): Promise<Type> {
  // Código segue spec contracts
}

// DEPOIS: Testar
// tests/NewService.test.ts
// Casos de teste baseados em spec.md section 5
```

### Pattern 2: Consertar Bug

```
1. Ler spec do módulo
2. Entender contrato esperado
3. Debugar: código não bate com spec?
4. Consertar código para bater
5. Rodar testes
6. Se spec muda → atualizar + version bump
```

### Pattern 3: Adicionar Campo a Tipo

```
1. Encontrar spec de tipo (e.g., Message.spec.md)
2. Ler spec, entender invariantes
3. Decidir: novo campo quebra contrato?
   - SIM: MAJOR version bump, avisar
   - NÃO: MINOR version bump
4. Atualizar spec com novo campo
5. Atualizar SPEC_INDEX.md version
6. Implementar em types.ts
7. Atualizar testes
```

## 8. Communication: Claude → Human

Quando Claude precisa de decisão:

```markdown
### ❓ Decision Needed

**Issue**: [O problema]

**Spec Status**: 
- Current spec: `specs/[path]/[Module].spec.md` v1.0
- Status: Implemented | Draft | Deprecated

**Options**:
1. [Opção A + trade-offs]
2. [Opção B + trade-offs]
3. [Opção C + trade-offs]

**Recommendation**: [Claude acha qual é melhor + por quê]

**Action Items** (após decisão):
- [ ] Atualizar spec se contrato muda
- [ ] Implementar mudança
- [ ] Rodar testes
- [ ] Abrir PR
```

## 9. Anti-Patterns (O que NÃO fazer)

❌ **Anti-Pattern 1**: "Implementar sem spec"
```
Claude vê código, gera mais código, sem spec
→ Ninguém sabe contrato esperado
→ Futuros developers ficam perdidos
```
✅ **Padrão**: Spec first, código after

❌ **Anti-Pattern 2**: "Spec nunca muda, código diverge"
```
Claude percebe divergência, ignora, segue adiante
→ Spec drift se acumula
→ Docs viram inúteis
```
✅ **Padrão**: Se código muda, spec muda. Sempre sincro.

❌ **Anti-Pattern 3**: "PR sem referência a spec"
```
Claude abre PR: "feat: added thing"
→ Reviewer não sabe qual spec valida mudança
→ Impossível rastrear
```
✅ **Padrão**: Body sempre tem "Spec: specs/[path]/[Module].spec.md v1.0"

❌ **Anti-Pattern 4**: "Criar spec muito genérica"
```
Claude cria spec que cabe tudo
→ Não guia desenvolvimento
→ Inútil
```
✅ **Padrão**: Spec é específica, contém invariantes, limites

## 10. Success Metrics

Claude está trabalhando bem se:

- ✅ Todos PRs referenciam specs
- ✅ Nenhuma mudança quebra contrato publicado
- ✅ SPEC_INDEX.md sempre atualizado
- ✅ Specs marcadas "Implemented" batidas com código
- ✅ Nenhuma "Spec Drift" issue aberta

Claude está fora dos trilhos se:

- ❌ PRs sem referência de spec
- ❌ Mudança quebra contrato sem version bump
- ❌ SPEC_INDEX.md desatualizado
- ❌ Código diverge de spec silenciosamente
- ❌ Spec fica Draft por meses

---

## Quick Reference

| Situação | Ação |
|----------|------|
| "Vou implementar módulo existente" | Ler spec, código segue spec, rodar testes |
| "Vou criar novo feature" | Criar spec first, spec review, implementar |
| "Encontrei bug" | Ler spec, debugar vs spec, consertar código ou spec |
| "Preciso quebrar contrato" | Abrir issue, spec version bump, avisar |
| "Spec está desatualizada" | Abrir "Spec Drift" issue, atualizar spec + version |
| "Não tenho spec para módulo" | Criar spec baseado em código atual, adicionar SPEC_INDEX |

---

**Lembre-se**: SDD funciona porque **especificações são a ponte** entre intenção (PRD, CLAUDE.md) e implementação (código, testes).

Claude respeitando SDD = múltiplos developers/agents podem trabalhar em paralelo com confiança. ✨
