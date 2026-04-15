# SDD Quick Start — Marie

Seu projeto agora está organizado para **Spec-Driven Development**. Este guia acelera o onboarding.

## 📍 Você está aqui

```
Marie Project
├── CLAUDE.md (arquitetura, resumida)
├── PRD.md (requirements, detalhado)
├── docs/
│   ├── SDD.md ← Princípios de SDD
│   ├── SDD_QUICK_START.md ← Você está aqui
│   └── MAPPING_CODE_TO_SPECS.md ← Como criar specs
└── specs/ ← Suas especificações
    ├── SPEC_INDEX.md ← Índice (single source of truth)
    ├── interfaces/
    │   ├── Project.spec.md ✅
    │   ├── Message.spec.md
    │   └── ...
    ├── services/
    │   ├── GeminiService.spec.md
    │   └── ...
    ├── workflows/
    │   ├── QuestionToAnalysis.workflow.md ✅
    │   └── ...
    └── domains/
        └── Finance5.spec.md
```

## 🚀 Início Rápido (5 minutos)

### 1. Entenda SDD
```bash
# Leia os 3 princípios em:
cat docs/SDD.md | head -20
```

**Resumo**: Specs guiam design, código segue specs, testes validam specs.

### 2. Veja o índice
```bash
cat specs/SPEC_INDEX.md
```

Este é seu **mapa de todas as especificações**. Você sempre começa aqui.

### 3. Leia uma spec existente
```bash
cat specs/interfaces/Project.spec.md
cat specs/workflows/QuestionToAnalysis.workflow.md
```

Veja como specs são estruturadas. Copie o formato para novas specs.

### 4. Crie sua primeira spec

Você tem código mas sem spec? Siga:
```bash
# 1. Leia o guia
cat docs/MAPPING_CODE_TO_SPECS.md

# 2. Use o template
cp docs/MAPPING_CODE_TO_SPECS.md#2-template specs/services/MyService.spec.md

# 3. Preencha:
nano specs/services/MyService.spec.md

# 4. Atualize índice
nano specs/SPEC_INDEX.md
```

## 📋 Checklist: Spec-Driven Development

### Antes de Implementar
- [ ] Li a spec completa?
- [ ] Entendi contracts de entrada/saída?
- [ ] Spec lida e validada em SPEC_INDEX.md?

### Durante Implementação
- [ ] Código segue interface definida na spec?
- [ ] Todos os errors em spec.md estão tratados?
- [ ] Testes cobrem todos os cases em spec?

### Review & Merge
- [ ] Código passa em todos os testes?
- [ ] Nenhuma mudança quebra spec existente?
- [ ] Se spec muda, version foi bumpado?

## 🎯 Próximas Ações

### Curto Prazo (Esta semana)
- [ ] Ler docs/SDD.md completamente
- [ ] Mapear GeminiService.spec.md
- [ ] Mapear PythonScriptBuilder.spec.md
- [ ] Criar spec para novo trabalho antes de implementar

### Médio Prazo (Este mês)
- [ ] Todos os serviços com specs
- [ ] Todos os workflows com specs
- [ ] Testes refatorados para seguir specs

### Longo Prazo (Próximos 3 meses)
- [ ] CI validate que código respeita specs
- [ ] Analytics sobre spec coverage
- [ ] Template de spec para cada tipo (service, component, workflow)

## 📚 Documentação

| Arquivo | Propósito | Quando ler |
|---------|-----------|-----------|
| [CLAUDE.md](../CLAUDE.md) | Arquitetura (nível alto, resumida) | Onboarding inicial |
| [PRD.md](../PRD.md) | Requirements (detalhe completo, PRD) | Compreender vision |
| [docs/SDD.md](./SDD.md) | Princípios de SDD | Antes de fazer specs |
| [docs/MAPPING_CODE_TO_SPECS.md](./MAPPING_CODE_TO_SPECS.md) | Como mapear código → specs | Antes de criar spec |
| [specs/SPEC_INDEX.md](../specs/SPEC_INDEX.md) | Índice de todas specs | Sempre, como referência |

## 🔗 Relação entre Documentos

```
PRD (o quê, por quê, quando)
  ↓ (detalha através de)
CLAUDE.md (arquitetura, estrutura)
  ↓ (estrutura descrita em)
specs/ (contratos, interfaces, fluxos)
  ↓ (implementado por)
src/ (código)
  ↓ (validado por)
testes (unit, integration, e2e)
```

## 💡 Exemplo: Implementar Feature Nova

Você quer adicionar feature "Search heuristics by theme".

### 1. Design com Spec (antes de código)
```bash
# Criar spec
cat > specs/services/HeuristicSearch.spec.md << 'EOF'
# HeuristicSearch Service

## 1. Overview
Buscar heurísticas por tema/palavra-chave.

## 2. Interface
Input: theme: string
Output: heuristics: Heuristic[]

## 3. Examples
searchHeuristicsByTheme("login")
→ [heuristic5.1, heuristic5.14]
EOF

# Atualizar SPEC_INDEX
# (manual: adicionar linha na tabela)
```

### 2. Criar testes (do spec)
```typescript
// tests/HeuristicSearch.test.ts
describe("HeuristicSearch", () => {
  it("should find heuristics by keyword", () => {
    const results = searchHeuristicsByTheme("login");
    expect(results).toContainEqual(
      expect.objectContaining({ number: "5.1" })
    );
  });
});
```

### 3. Implementar (pelo spec)
```typescript
// src/services/HeuristicSearch.ts
export function searchHeuristicsByTheme(theme: string): Heuristic[] {
  // Spec diz input é string, output é Heuristic[]
  // Código cumpre isso
}
```

### 4. Validar (contra spec)
```bash
npm test -- HeuristicSearch
# ✅ Todos testes passam → spec implementado
```

---

## 🔍 Troubleshooting

**Q: Código mudou mas spec ficou desatualizada?**
A: Abra issue "Spec Drift" para atualizar spec. Não deixe divergência silenciosa.

**Q: Preciso quebrar um contrato?**
A: Bumpear spec version (MAJOR). Atualizar SPEC_INDEX. Avisar team.

**Q: Spec é muito longa / complicada?**
A: Quebra em specs menores. Uma spec = um módulo/responsabilidade.

---

## 📞 Perguntas?

Veja:
1. **SDD principles?** → `docs/SDD.md`
2. **Como mapear meu código?** → `docs/MAPPING_CODE_TO_SPECS.md`
3. **Qual é o status de cada spec?** → `specs/SPEC_INDEX.md`
4. **Exemplo de uma spec?** → `specs/interfaces/Project.spec.md`

---

**Bem-vindo a SDD em Marie!** 🎉

Agora você tem:
- ✅ Princípios claros (SDD.md)
- ✅ Índice de specs (SPEC_INDEX.md)
- ✅ Exemplos reais (Project.spec.md, QuestionToAnalysis.workflow.md)
- ✅ Guia de mapeamento (MAPPING_CODE_TO_SPECS.md)
- ✅ Este quick start

**Próximo passo:** Leia [docs/SDD.md](./SDD.md) e comece a criar specs para seu código existente.
