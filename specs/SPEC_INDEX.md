# Specification Index — Marie

**Last Updated**: 2026-04-15  
**Total Specs**: 15 (3 Approved, 7 Implemented, 5 Draft)

Esta é a **single source of truth** para todas as especificações do projeto Marie. Cada spec abaixo tem status, versão e link para arquivo detalhado.

## Interfaces & Types

| Spec | Version | Status | Owner | Last Updated |
|------|---------|--------|-------|--------------|
| [Project](./interfaces/Project.spec.md) | 1.0 | Implemented | Engenharia | 2026-04-15 |
| [Message](./interfaces/Message.spec.md) | 1.0 | Implemented | Engenharia | 2026-04-15 |
| [AuthUser](./interfaces/AuthUser.spec.md) | 1.0 | Implemented | Segurança | 2026-04-15 |
| [ProcessingStep](./interfaces/ProcessingStep.spec.md) | 1.0 | Draft | Engenharia | 2026-04-15 |
| [AppState](./interfaces/AppState.spec.md) | 1.0 | Draft | Engenharia | 2026-04-15 |

## Services

| Spec | Version | Status | Owner | Last Updated |
|------|---------|--------|-------|--------------|
| [GeminiService](./services/GeminiService.spec.md) | 1.0 | Implemented | Engenharia | 2026-04-15 |
| [PythonScriptBuilder](./services/PythonScriptBuilder.spec.md) | 1.0 | Implemented | Engenharia | 2026-04-15 |
| [FirebaseClient](./services/FirebaseClient.spec.md) | 1.0 | Implemented | Segurança | 2026-04-15 |
| [OllamaService](./services/OllamaService.spec.md) | 1.0 | Draft | Engenharia | 2026-04-15 |
| [StorageService](./services/StorageService.spec.md) | 1.0 | Draft | Engenharia | 2026-04-15 |

## Components

| Spec | Version | Status | Owner | Last Updated |
|------|---------|--------|-------|--------------|
| [ProjectSlug](./components/ProjectSlug.spec.md) | 1.0 | Implemented | Frontend | 2026-04-15 |
| [Home](./components/Home.spec.md) | 1.0 | Implemented | Frontend | 2026-04-15 |
| [Projects](./components/Projects.spec.md) | 1.0 | Draft | Frontend | 2026-04-15 |

## Workflows

| Spec | Version | Status | Owner | Last Updated |
|------|---------|--------|-------|--------------|
| [QuestionToAnalysis.workflow](./workflows/QuestionToAnalysis.workflow.md) | 1.0 | Approved | Produto | 2026-04-15 |
| [Authentication.workflow](./workflows/Authentication.workflow.md) | 1.0 | Approved | Segurança | 2026-04-15 |
| [ProjectDataLoad.workflow](./workflows/ProjectDataLoad.workflow.md) | 1.0 | Implemented | Engenharia | 2026-04-15 |

## Domains

| Spec | Version | Status | Owner | Last Updated |
|------|---------|--------|-------|--------------|
| [Finance5](./domains/Finance5.spec.md) | 1.0 | Implemented | Produto | 2026-04-15 |
| [Retail](./domains/Retail.spec.md) | 1.0 | Draft | Produto | 2026-04-15 |

---

## Navegação por Status

### Approved (pronto para implementação)
- [QuestionToAnalysis.workflow](./workflows/QuestionToAnalysis.workflow.md)
- [Authentication.workflow](./workflows/Authentication.workflow.md)

### Implemented (código está em sincronia)
- [Project](./interfaces/Project.spec.md)
- [Message](./interfaces/Message.spec.md)
- [AuthUser](./interfaces/AuthUser.spec.md)
- [GeminiService](./services/GeminiService.spec.md)
- [PythonScriptBuilder](./services/PythonScriptBuilder.spec.md)
- [FirebaseClient](./services/FirebaseClient.spec.md)
- [ProjectSlug](./components/ProjectSlug.spec.md)
- [Home](./components/Home.spec.md)
- [ProjectDataLoad.workflow](./workflows/ProjectDataLoad.workflow.md)
- [Finance5](./domains/Finance5.spec.md)

### Draft (em discussão ou incompleto)
- [ProcessingStep](./interfaces/ProcessingStep.spec.md)
- [AppState](./interfaces/AppState.spec.md)
- [OllamaService](./services/OllamaService.spec.md)
- [StorageService](./services/StorageService.spec.md)
- [Projects](./components/Projects.spec.md)
- [Retail](./domains/Retail.spec.md)

---

## Quick Links

- **[SDD Guide](../docs/SDD.md)** — Como trabalhar com Spec-Driven Development
- **[CLAUDE.md](../CLAUDE.md)** — Guia de arquitetura (resumido)
- **[PRD.md](../PRD.md)** — Product Requirements Document (detalhado)
- **[Types (source)](../src/types.ts)** — Definições de tipo atual

---

## Mudanças Recentes

### 2026-04-15
- ✅ Criação de SPEC_INDEX.md como single source of truth
- ✅ Estrutura inicial de specs em 5 categorias
- 📋 Draft de Finance5.spec.md
- 📋 Draft de Retail.spec.md

---

## Como Adicionar uma Nova Spec

1. Criar arquivo em categoria apropriada: `specs/{categoria}/{Nome}.spec.md`
2. Seguir template de [SDD.md](../docs/SDD.md#3-anatomia-de-uma-especificação)
3. Atualizar tabela apropriada acima com:
   - Spec name (link para arquivo)
   - Version: `1.0`
   - Status: `Draft`
   - Owner: responsável
   - Last Updated: data atual
4. Se spec é approved, atualizar `Navegação por Status`

---

## Sincronismo Spec ↔ Código

Agentes IA e developers, antes de fazer mudanças:

1. **Consultar SPEC_INDEX.md** — entender spec status
2. **Ler spec completa** — garantir compreensão total de contracts
3. **Implementar por spec** — código segue interface definida
4. **Manter em sincronia** — se código diverge de spec, abrir issue "Spec Drift"

---

**Próximas Ações:**
- [ ] Escrever specs de todas as interfaces (ProcessingStep, AppState)
- [ ] Escrever specs de serviços não-implementados (Ollama, Storage)
- [ ] Escrever spec de fluxo de erro (ErrorHandling.workflow.md)
- [ ] Validar specs com testes (link testes ao SPEC_INDEX)
