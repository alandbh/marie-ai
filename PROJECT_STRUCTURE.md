# Marie Project Structure — Complete Map

Visão geral de como o projeto está organizado com Spec-Driven Development.

## 📊 Hierarchy

```
MARIE PROJECT
│
├─ 📄 Documentation (Foundation)
│  ├─ CLAUDE.md                      ← Arquitetura (resumida para Claude Code)
│  ├─ PRD.md                         ← Requirements (completo)
│  └─ PROJECT_STRUCTURE.md           ← Você está aqui
│
├─ 📚 SDD Documentation (Design By Spec)
│  └─ docs/
│     ├─ SDD.md                      ← Princípios de Spec-Driven Development
│     ├─ SDD_QUICK_START.md          ← Começo rápido (5 min)
│     ├─ MAPPING_CODE_TO_SPECS.md    ← Como criar specs para código existente
│     └─ CLAUDE_AND_SDD.md           ← Como Claude Code trabalha com SDD
│
├─ 📋 Specifications (Single Source of Truth)
│  └─ specs/
│     ├─ SPEC_INDEX.md               ← Índice de TODAS as specs (sempre consulte)
│     │
│     ├─ interfaces/                 ← Tipos e contratos de dados
│     │  ├─ Project.spec.md          ✅ Implemented
│     │  ├─ Message.spec.md          
│     │  ├─ AuthUser.spec.md         
│     │  ├─ ProcessingStep.spec.md   
│     │  └─ AppState.spec.md         
│     │
│     ├─ services/                   ← Componentes lógicos reutilizáveis
│     │  ├─ GeminiService.spec.md    ✅ Implemented
│     │  ├─ PythonScriptBuilder.spec.md  ✅ Implemented
│     │  ├─ FirebaseClient.spec.md   ✅ Implemented
│     │  ├─ OllamaService.spec.md    
│     │  └─ StorageService.spec.md   
│     │
│     ├─ components/                 ← Componentes React
│     │  ├─ ProjectSlug.spec.md      ✅ Implemented
│     │  ├─ Home.spec.md             ✅ Implemented
│     │  └─ Projects.spec.md         
│     │
│     ├─ workflows/                  ← Fluxos de negócio
│     │  ├─ QuestionToAnalysis.workflow.md  ✅ Approved (v1.0)
│     │  ├─ Authentication.workflow.md
│     │  └─ ProjectDataLoad.workflow.md
│     │
│     └─ domains/                    ← Domínios específicos
│        ├─ Finance5.spec.md         ✅ Implemented
│        └─ Retail.spec.md
│
├─ 💻 Source Code (Implementação)
│  └─ src/
│     ├─ App.tsx                     → spec: QuestionToAnalysis.workflow.md
│     ├─ index.tsx
│     ├─ types.ts                    → specs: interfaces/*.spec.md
│     ├─ constants.ts
│     ├─ projects-data.ts            → spec: Project.spec.md
│     ├─ finance5CanonicalRegistry.ts → spec: Finance5.spec.md
│     │
│     ├─ pages/
│     │  ├─ Home.tsx                 → spec: Home.spec.md
│     │  ├─ Projects.tsx             → spec: Projects.spec.md
│     │  └─ ProjectSlug.tsx          → spec: ProjectSlug.spec.md
│     │
│     ├─ services/
│     │  ├─ geminiService.ts         → spec: GeminiService.spec.md
│     │  ├─ ollamaService.ts         → spec: OllamaService.spec.md
│     │  ├─ pythonScriptBuilder.ts   → spec: PythonScriptBuilder.spec.md
│     │  ├─ firebaseClient.ts        → spec: FirebaseClient.spec.md
│     │  └─ storageService.ts        → spec: StorageService.spec.md
│     │
│     └─ prompt/
│        ├─ common.ts
│        ├─ finance.ts
│        ├─ retail.ts
│        └─ projects/
│           ├─ finance5.ts
│           └─ index.ts
│
├─ ✅ Tests (Validação)
│  └─ tests/ (planejado)
│     ├─ unit/                       → Testes de spec sections
│     ├─ integration/                → Testes de workflows
│     └─ e2e/                        → Testes end-to-end
│
├─ ⚙️ Configuration
│  ├─ package.json
│  ├─ tsconfig.json
│  ├─ vite.config.ts
│  ├─ .env
│  └─ vercel.json
│
└─ 📦 Build Output
   └─ dist/ (após `npm run build`)
```

## 🎯 Where to Start

### 1️⃣ Your First 5 Minutes
```
1. Read CLAUDE.md (this file)
2. Read docs/SDD_QUICK_START.md
3. Check specs/SPEC_INDEX.md
```

### 2️⃣ Understanding the Project (30 minutes)
```
1. Read CLAUDE.md (10 min)
2. Skim specs/SPEC_INDEX.md (5 min)
3. Read one spec: specs/interfaces/Project.spec.md (10 min)
4. Read docs/SDD.md (5 min)
```

### 3️⃣ Ready to Implement (1 hour)
```
1. Read relevant spec completely (15 min)
   - Find it in specs/SPEC_INDEX.md
2. Read MAPPING_CODE_TO_SPECS.md (10 min)
3. Read code in src/ (20 min)
4. Plan implementation (15 min)
```

## 🔄 Key Workflows

### Workflow 1: Implementar Mudança em Módulo Existente

```
1. Find spec in specs/SPEC_INDEX.md
2. Read spec (understand contract)
3. Read code in src/
4. Implement following spec
5. Run tests
6. If contract changes: bump spec version
7. Open PR with "Spec: specs/[path]/[Module].spec.md"
```

### Workflow 2: Criar Novo Feature

```
1. Read PRD.md + CLAUDE.md (context)
2. Create spec in specs/ FIRST (not code)
3. Status: Draft
4. Add to specs/SPEC_INDEX.md
5. Get spec review (if needed)
6. Mark spec: Approved
7. Implement code following spec
8. Create tests from spec section 5
9. Mark spec: Implemented
10. Open PR with spec reference
```

### Workflow 3: Debug / Investigate

```
1. Read spec of module in question
2. Compare: code vs spec
3. If diverge → open "Spec Drift" issue
4. Decide: fix code or update spec?
5. Fix and open PR
```

## 📍 Document Navigation

| Need | Read |
|------|------|
| Quick overview | CLAUDE.md |
| Full requirements | PRD.md |
| SDD principles | docs/SDD.md |
| How to use SDD | docs/SDD_QUICK_START.md |
| Map code → specs | docs/MAPPING_CODE_TO_SPECS.md |
| Claude + SDD | docs/CLAUDE_AND_SDD.md |
| All specs status | specs/SPEC_INDEX.md |
| Specific module contract | specs/[category]/[Module].spec.md |

## 🎨 Design Philosophy

### Separation of Concerns

```
PRD.md              = "What and why?" (strategic)
  ↓
CLAUDE.md           = "Where and how?" (architecture)
  ↓
specs/              = "Contracts and rules" (detailed)
  ↓
src/                = "Implementation" (executable)
  ↓
tests/              = "Validation" (proof)
```

### Single Source of Truth

```
SPEC_INDEX.md = Master register of all specs
  ↓ points to
specs/*.md = Detailed contracts
  ↓ implemented by
src/*.ts = Code
  ↓ validated by
tests/*.ts = Tests
```

### SDD Loop

```
SPEC (write first)
  ↓
TEST (derive from spec)
  ↓
CODE (implement to spec)
  ↓
VERIFY (code passes tests derived from spec)
  ↓ (if code changes contract)
UPDATE SPEC → back to loop
```

## 🔗 Key Links

### Documentation
- [CLAUDE.md](CLAUDE.md) — Architecture guide
- [PRD.md](PRD.md) — Product requirements
- [docs/SDD.md](docs/SDD.md) — SDD principles
- [docs/SDD_QUICK_START.md](docs/SDD_QUICK_START.md) — 5-minute start
- [docs/CLAUDE_AND_SDD.md](docs/CLAUDE_AND_SDD.md) — Claude + SDD guide

### Specifications
- [specs/SPEC_INDEX.md](specs/SPEC_INDEX.md) — Master index (always here first)
- [specs/interfaces/Project.spec.md](specs/interfaces/Project.spec.md) — Example spec
- [specs/workflows/QuestionToAnalysis.workflow.md](specs/workflows/QuestionToAnalysis.workflow.md) — Example workflow

### Source Code
- [src/App.tsx](src/App.tsx) — Main app
- [src/types.ts](src/types.ts) — Type definitions
- [src/projects-data.ts](src/projects-data.ts) — Project catalog

## ✨ What's Different from Normal Projects

### Traditional
```
Code exists → Documentation catches up (maybe)
```

### Marie (SDD)
```
Spec exists → Tests derived from spec → Code implements spec
```

**Benefits:**
- ✅ Multiple developers/agents work in parallel with confidence
- ✅ Code is traceable to specification
- ✅ Breaking changes are intentional and versioned
- ✅ New contributors understand contracts immediately
- ✅ Refactoring is safe (spec tells you what's allowed)

## 🚀 Next Actions

- [ ] Read CLAUDE.md (5 min)
- [ ] Read docs/SDD_QUICK_START.md (10 min)
- [ ] Check specs/SPEC_INDEX.md (3 min)
- [ ] Read one spec example (10 min)
- [ ] Identify module to implement/fix
- [ ] Find its spec in specs/SPEC_INDEX.md
- [ ] Read the spec completely
- [ ] Plan implementation
- [ ] Code following spec
- [ ] Open PR referencing spec

---

**You're now ready to contribute to Marie using Spec-Driven Development!** 🎉

Questions? Check:
- SDD principles: [docs/SDD.md](docs/SDD.md)
- How to map code: [docs/MAPPING_CODE_TO_SPECS.md](docs/MAPPING_CODE_TO_SPECS.md)
- Claude + SDD: [docs/CLAUDE_AND_SDD.md](docs/CLAUDE_AND_SDD.md)
- All specs: [specs/SPEC_INDEX.md](specs/SPEC_INDEX.md)
