# Question to Analysis Workflow Specification

**Status**: Approved  
**Version**: 1.0  
**Last Updated**: 2026-04-15  
**Owner**: Produto  
**Epic**: Core Marie Value  
**Source Code**: [App.tsx](../../src/App.tsx), [pages/ProjectSlug.tsx](../../src/pages/ProjectSlug.tsx)

## 1. Overview

Este é o **workflow crítico** do projeto Marie: transformar uma pergunta em linguagem natural em uma análise auditável.

**Fluxo simplificado:**
```
User Question → LLM generates Python script → Validation → Execution in Pyodide → Format Response → Display
```

**Participantes:**
- Usuário (pesquisador)
- LLM (Gemini ou Ollama)
- Pyodide runtime (Python em WASM)
- UI (React)

**Duração esperada:** P95 < 30s (script gen 20s + exec 5s + format 5s)

## 2. Workflow Steps

### Step 1: User Submits Question

**Preconditions:**
- Usuário está autenticado
- Projeto está carregado (dados em memória)
- Input field não vazio
- Processamento anterior completado (state = DONE ou IDLE)

**Action:**
```typescript
// pages/ProjectSlug.tsx
const handleSubmit = (question: string) => {
  if (!question.trim()) return;
  
  // Criar mensagem do usuário
  const userMessage: Message = {
    id: uuid(),
    role: "user",
    content: question,
    timestamp: new Date()
  };
  
  // Atualizar estado
  setMessages([...messages, userMessage]);
  setProcessingStep("GENERATING_SCRIPT");
};
```

**Output:**
- Message adicionada ao histórico
- UI mostra "Gerando script..." + spinner
- Input field limpo

### Step 2: Generate Python Script via LLM

**Preconditions:**
- Question não vazia
- Project carregado
- LLM provider disponível

**Action:**
```typescript
// services/geminiService.ts
async function generateScript(
  question: string,
  project: Project,
  systemPrompt: string
): Promise<string> {
  const model = getSelectedLLM(); // Gemini ou Ollama
  
  const response = await model.generateContent({
    systemInstructions: systemPrompt,
    userMessage: question
  });
  
  // Extrair apenas corpo Python (sem markdown)
  const scriptBody = extractPythonCode(response.text);
  return scriptBody;
}
```

**System Prompt Components:**
1. **Shared boilerplate**: imports, helpers, data loading
2. **Project-specific context**: `prompt/finance.ts` ou `prompt/retail.ts`
3. **Router rules**: 3 modos (template, custom, qualitative)
4. **Canonical rules** (finance5 only): heuristic mapping

**Output:**
- Python script body (sem imports, sem boilerplate)
- Script é armazenado em `message.script`
- UI mostra "Validando script..."

**Error Cases:**
- LLM timeout → retry com fallback
- LLM returns invalid format → error message "Resposta do modelo inválida"

### Step 3: Validate & Inject Boilerplate

**Preconditions:**
- Script gerado por LLM
- Validador disponível

**Action:**
```typescript
// services/pythonScriptBuilder.ts
function buildFullScript(
  scriptBody: string,
  project: Project
): { fullScript: string; errors: ValidationError[] } {
  // 1. Validar padrões proibidos
  const forbiddenPatterns = [
    /^\s*def\s+normalize_text/m,      // redefine helper
    /^\s*def\s+find_heuristic_id/m,
    /^\s*heuristics_data\s*=/m        // redefine variável
  ];
  
  const errors = [];
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(scriptBody)) {
      errors.push({
        code: "FORBIDDEN_REDEFINITION",
        message: `Script tenta redefinir helper compartilhado (${pattern})`
      });
    }
  }
  
  if (errors.length > 0) {
    return { fullScript: "", errors };
  }
  
  // 2. Construir boilerplate
  const boilerplate = buildSharedBoilerplate(project);
  
  // 3. Combinar
  const fullScript = `${boilerplate}\n\n# User script\n${scriptBody}`;
  
  return { fullScript, errors: [] };
}
```

**Output:**
- Full script pronto para execução
- Se validação falhar: erro `FORBIDDEN_REDEFINITION` é mostrado ao usuário
- UI mostra "Executando análise..."

### Step 4: Execute Python in Pyodide

**Preconditions:**
- Full script validado
- Pyodide runtime carregado
- Dados (heuristics.json, resultados.json) em filesystem

**Action:**
```typescript
// App.tsx (in message handler)
async function executePythonScript(
  fullScript: string,
  project: Project
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  
  // Pyodide está disponível globalmente
  const pyodide = (window as any).pyodide;
  
  try {
    const output = await pyodide.runPythonAsync(fullScript);
    // Capturar stdout/stderr
    const stdout = output || "";
    return { stdout, stderr: "", exitCode: 0 };
  } catch (error: any) {
    // Erro de execução Python
    return {
      stdout: "",
      stderr: error.message,
      exitCode: 1
    };
  }
}
```

**Output:**
- stdout (análise bruta em Markdown)
- stderr (se erro)
- exitCode (0 = sucesso, 1 = erro)
- Stored em `message.pythonOutput`
- UI mostra "Formatando resposta..."

### Step 5: Format Response via LLM

**Preconditions:**
- Python script executado
- Output capturado

**Action:**
```typescript
// services/geminiService.ts
async function formatResponse(
  pythonOutput: string,
  question: string
): Promise<string> {
  const formattingPrompt = `
    Usuário perguntou: "${question}"
    
    Python script produziu este output:
    \`\`\`
    ${pythonOutput}
    \`\`\`
    
    Reescreva como resposta amigável em Markdown:
    - Use headers (#, ##, ###)
    - Use tabelas para dados estruturados
    - Destaque números importantes
    - Mantenha contexto da pergunta original
  `;
  
  const response = await llm.generateContent({
    userMessage: formattingPrompt
  });
  
  return response.text;
}
```

**Output:**
- Resposta formatada em Markdown
- Stored em `message.content`
- UI mostra resposta completa + logs técnicos

### Step 6: Display Result

**Preconditions:**
- Resposta formatada disponível
- Logs técnicos capturados

**Action:**
```typescript
// pages/ProjectSlug.tsx
<div className="message assistant">
  <div className="content markdown">
    {/* Rendered markdown response */}
  </div>
  
  <details className="technical-logs">
    <summary>🔍 Logs Técnicos</summary>
    <div className="script-block">
      <h4>Script Python Gerado</h4>
      <pre>{message.script}</pre>
    </div>
    <div className="output-block">
      <h4>Output</h4>
      <pre>{message.pythonOutput}</pre>
    </div>
  </details>
</div>
```

**Output:**
- Mensagem renderizada com resposta
- Logs acessíveis (não expandidos por padrão)
- State volta para `DONE`

## 3. State Machine

```
IDLE
  ↓
GENERATING_SCRIPT
  ├─ error → show error, back to IDLE
  └─ success → EXECUTING_PYTHON
  
EXECUTING_PYTHON
  ├─ error → show error, back to IDLE
  └─ success → GENERATING_RESPONSE
  
GENERATING_RESPONSE
  ├─ error → show error, back to IDLE
  └─ success → DONE
  
DONE
  → user can submit new question, back to GENERATING_SCRIPT
```

## 4. Error Handling

| Step | Error | Message | Recovery |
|------|-------|---------|----------|
| LLM Gen | Timeout | "LLM não respondeu em tempo. Tente novamente." | Retry |
| LLM Gen | Invalid format | "Modelo não gerou script válido. Tente pergunta mais específica." | Manual retry |
| Validation | Forbidden pattern | "Script tenta redefinir helpers compartilhados. Contacte suporte." | Manual |
| Python exec | Syntax error | "Erro Python: {error line}" + hint português | Manual |
| Python exec | Index error | "Não encontrado: {context}. Reformule pergunta." | Manual |
| Format | LLM timeout | "Erro ao formatar resposta. Veja logs técnicos." | Manual |

## 5. Examples

### 5.1 Happy Path — Template Mode

```
User: "quantos players tiveram sucesso na heurística 5.1?"

→ LLM gera script usando TEMPLATE MODE (listas A, B, C, D, E)
→ Valida ok (sem forbidden patterns)
→ Executa em Pyodide
→ Output:
   ## 5.1 - Permitem login social [3/5]
   ### A. Players com Êxito [3]
   - Banco A
   - Banco B
   - Banco C
   
   ### B. Players que Falharam [2]
   - Banco D
   - Banco E
→ Formata para resposta amigável
→ Mostra: "3 de 5 instituições permitem login social"
```

### 5.2 Sad Path — Python Error

```
User: "quantos players têm a feature XYZ?"

→ LLM gera script tentando buscar feature XYZ
→ Valida ok
→ Executa em Pyodide
→ Python error: KeyError: 'XYZ'
→ stderr capturado: "KeyError: 'XYZ'"
→ Mostra erro: "Feature 'XYZ' não encontrada. Confira o nome e tente novamente."
→ Logs técnicos mostram stack trace completo
```

### 5.3 Sad Path — Forbidden Pattern

```
User: "gere um script que busque data e redefina os helpers"

→ LLM gera script (LLM não sabe da regra)
→ Script contém: "def find_heuristic_id_by_text(): ..."
→ Validação detecta padrão proibido
→ Erro: "Script tenta redefinir helper 'find_heuristic_id_by_text'. Contacte suporte."
→ Não executa Python
```

## 6. Performance Targets

| Phase | Target P95 | Current P95 | Status |
|-------|-----------|------------|--------|
| LLM script generation | 20s | ~15s | ✅ Ok |
| Python execution | 5s | ~3s | ✅ Ok |
| LLM response format | 5s | ~4s | ✅ Ok |
| **Total E2E** | **30s** | ~22s | ✅ Ok |

## 7. Tests (Expected)

### Unit Tests
- `generateScript()` extrai corpo Python corretamente
- `buildFullScript()` rejeita padrões proibidos
- State machine transições válidas

### Integration Tests
- Fluxo completo com projeto finance5
- Fluxo completo com projeto retail6
- Tratamento de erro Python
- Timeout handling

### E2E Tests (Planned)
- Login → projeto → pergunta → resposta
- Histórico de mensagens persiste
- "Clear conversation" reseta state

## 8. Notes & Constraints

### 8.1 Current Limitations

1. Sem retry automático no LLM (manual apenas)
2. Sem caching de respostas para perguntas duplicadas
3. Sem timeout global (cada etapa tem seu próprio timeout)
4. Pyodide carregamento inicial é ~2s (bloqueante)

### 8.2 Future Enhancements

1. **Streaming de resposta**: LLM formatação incrementada
2. **Smart retry**: detectar tipo de erro e sugerir reformulação
3. **Caching**: IndexedDB para perguntas recentes
4. **Analytics**: track sessão (script gen time, exec time, user satisfaction)

---

## Cross-References

- **Triggering interface**: [Message](../interfaces/Message.spec.md)
- **Project selection**: [Project](../interfaces/Project.spec.md)
- **Script building**: [PythonScriptBuilder.spec.md](../services/PythonScriptBuilder.spec.md)
- **LLM integration**: [GeminiService.spec.md](../services/GeminiService.spec.md)
