# Spec-Driven Development (SDD) — Marie

Este documento estabelece a prática de **Spec-Driven Development** para o projeto Marie, alinhada com as melhores práticas Anthropic.

## 1. Princípios de SDD

SDD é uma metodologia onde:
- **Especificações são artefatos de primeira classe** — guiam design, implementação e testes
- **Contratos são explícitos** — cada módulo define inputs, outputs, comportamentos e invariantes
- **Testes nascem das specs** — casos de teste são derivados direto da especificação
- **Documentação é código** — specs são executáveis e mantem-se em sincronismo com implementação

## 2. Estrutura de Especificações (`/specs`)

```
/specs
├── SPEC_INDEX.md              # Índice de todas as specs (single source of truth)
├── interfaces/                # Contratos de dados e tipos
│   ├── Project.spec.md
│   ├── Message.spec.md
│   ├── AuthUser.spec.md
│   └── ...
├── services/                  # Especificações de serviços
│   ├── GeminiService.spec.md
│   ├── PythonScriptBuilder.spec.md
│   ├── FirebaseClient.spec.md
│   └── ...
├── components/                # Especificações de componentes React
│   ├── ProjectSlug.spec.md
│   ├── Home.spec.md
│   └── ...
├── workflows/                 # Fluxos e processos de negócio
│   ├── QuestionToAnalysis.workflow.md
│   ├── Authentication.workflow.md
│   ├── ProjectDataLoad.workflow.md
│   └── ...
└── domains/                   # Especificações por domínio (finance5, retail, etc)
    ├── Finance5.spec.md
    ├── Retail.spec.md
    └── ...
```

## 3. Anatomia de uma Especificação (Spec)

Cada arquivo de spec segue este padrão:

```markdown
# [Nome do Módulo] Specification

**Status**: Draft | Approved | Implemented | Deprecated
**Version**: 1.0
**Last Updated**: 2026-04-15
**Owner**: [Função responsável]

## 1. Overview
[O que é, por que existe, quem usa]

## 2. Interfaces & Contracts
### Input
[Estrutura de entrada, exemplos]

### Output
[Estrutura de saída, exemplos]

### Errors
[Erros possíveis e como tratá-los]

## 3. Behavior
[Regras, invariantes, casos especiais]

## 4. Examples
[Casos de uso reais, happy path e sad path]

## 5. Tests
[Casos de teste esperados (derivados desta spec)]

## 6. Notes & Constraints
[Limitações, decisões de design, dependências]
```

## 4. Workflow de SDD no Marie

### 4.1 Antes de Implementar
1. **Ler specs relacionadas** — entender contratos de entrada/saída de tudo que o módulo toca
2. **Validar spec** — abrir issue se spec está incompleta ou ambígua
3. **Sincronizar com CLAUDE.md** — confirmar que spec está alinhada com arquitetura documentada

### 4.2 Durante Implementação
1. **Implementação dirigida por spec** — código segue contratos definidos
2. **Manter testes próximos** — testes para cada spec section
3. **Não quebrar specs existentes** — se precisar mudar spec, abrir PR de spec first

### 4.3 Review & Merge
1. **Spec review** — reviewer verifica aderência do código à spec
2. **Test coverage** — cobertura de todos os casos descritos em spec
3. **Documentation sync** — CLAUDE.md, README, specs mantêm-se sincronizadas

## 5. Versionamento de Specs

Specs seguem semantic versioning:
- **MAJOR**: quebra de contrato (ex: mudança em formato de input)
- **MINOR**: adição de comportamento (ex: novo tipo de error handling)
- **PATCH**: clarificação ou correção de typo

Quando uma spec muda:
1. Bump version
2. Marcar "Breaking Change" se MAJOR
3. Atualizar `SPEC_INDEX.md`
4. Se código já existe, criar issue para migração

## 6. Checklist para Nova Spec

- [ ] Overview claro (problema, solução, usuários)
- [ ] Interfaces documentadas com exemplos
- [ ] Casos de erro explícitos
- [ ] Comportamento não-óbvio descrito
- [ ] Exemplos cobrem happy path e sad path
- [ ] Constraints e dependências listadas
- [ ] Owner definido
- [ ] Adicionada a `SPEC_INDEX.md`

## 7. Checklist para Implementação por Spec

- [ ] Spec lida e entendida
- [ ] Specs de dependências (inputs/outputs) conferidas
- [ ] Código segue interfaces definidas
- [ ] Todos os erros em spec.md estão tratados
- [ ] Testes cobrem todos os cases em spec.md
- [ ] Novos inputs/outputs respeitam tipo definido
- [ ] Nenhuma mudança quebra spec publicada
- [ ] Atualizar spec version se comportamento muda

## 8. Sincronismo: Spec ↔ Código ↔ CLAUDE.md

```
specs/*.md (fonte única de verdade)
    ↓ (implementado por)
src/**/*.ts (código)
    ↓ (resumido e referenciado por)
CLAUDE.md (guia para developer)
    ↓ (validado por)
testes (e2e, unit, integration)
```

Se spec muda:
1. Atualizar `specs/*.md`
2. Implementar mudança em `src/**/*.ts`
3. Atualizar `CLAUDE.md` se afeta design global
4. Atualizar testes

Se código muda:
1. Verificar se spec ainda é válida
2. Se não, abrir issue "Spec Drift" para atualizar spec
3. Nunca deixar código divergir de spec sem issue aberta

## 9. Padrões de Nomenclatura

- Specs de **interfaces/tipos**: `TypeName.spec.md`
- Specs de **serviços**: `ServiceName.spec.md` ou `ServiceName.interface.spec.md` + `ServiceName.implementation.spec.md`
- Specs de **componentes**: `ComponentName.spec.md`
- Specs de **workflows**: `WorkflowName.workflow.md`
- Specs de **domínio**: `DomainName.spec.md`

## 10. Comunicação com Agentes IA

Quando um agente IA está trabalhando no projeto:

1. **Ler spec primeiro** — `specs/SPEC_INDEX.md` e specs relevantes
2. **Respeitar contracts** — nunca quebrar spec sem abertura de issue
3. **Documentar mudanças de spec** — se precisar mudar spec, avisar owner
4. **Testar por spec** — testes devem cobrir casos em spec.md
5. **Atualizar spec antes de implementar** — se spec está desatualizada, corrigir spec first

---

SDD no Marie permite que múltiplos developers e agentes IA trabalhem em paralelo com confiança de que não quebram contratos críticos.
