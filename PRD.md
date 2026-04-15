# PRD — Marie

Versão: `1.0`  
Status: `Draft pronto para execução`  
Última atualização: `2026-04-15`  
Escopo temporal: `12 meses`

## 1. Resumo Executivo

Marie é um produto de análise de estudos heurísticos com IA, focado em transformar perguntas de pesquisadores em análises auditáveis via execução de scripts Python no navegador (Pyodide), sem enviar o dataset bruto para o modelo de linguagem.  
Este PRD define o estado atual do produto (`v0.1.2`), os contratos operacionais existentes e um plano de escala em 12 meses para suportar múltiplas equipes, novos projetos, maior governança e uso seguro por agentes de IA.

Objetivo desta entrega: consolidar uma fonte única de verdade para evolução de produto, engenharia, dados e operação.

## 2. Visão de Produto

### 2.1 Problema

- Pesquisadores precisam responder perguntas sobre estudos heurísticos com rapidez, rastreabilidade e consistência.
- Consultas complexas exigem cruzamento entre heurísticas, jornadas, notas qualitativas e comparação entre anos.
- Fluxos manuais são lentos, suscetíveis a erro e difíceis de padronizar entre equipes.

### 2.2 Proposta de Valor

- Converter perguntas em análises estruturadas com pipeline controlado:
  `Pergunta -> Script Python gerado -> Execução local -> Resposta em Markdown`.
- Reduzir risco de exposição de dados: dataset processado localmente no runtime Python em WebAssembly.
- Manter transparência operacional: script e logs de execução ficam visíveis na interface.

### 2.3 Público-Alvo

- Pesquisadores UX e time de Estratégia da R/GA.
- Líderes de projeto que precisam comparar resultados entre edições.
- Times de dados e engenharia que mantêm as regras de análise e qualidade.
- Agentes de IA internos usados para acelerar manutenção, documentação e evolução.

### 2.4 Metas de Produto (12 meses)

- Pesquisas / análises recentes serão salvas localmente, no IndexedDB do browser.
- Pesquisas / análises recentes serão salvas em servidor, para que o usuário consiga acessá-las, mesmo de outro computador. Havaliar se o Firebase é suficiente para esta funcionalidade, já que temos um volune de apenas 100 usuários.
- Tempo médio para responder uma pergunta analítica recorrente: reduzir em `>= 60%` vs. fluxo manual.
- Taxa de sessões com resposta útil sem intervenção manual: `>= 90%`.
- Taxa de falha por erro de script Python gerado: `<= 5%` no P95 mensal.
- Onboarding de novo projeto (config + validação): `<= 1 dia útil`.
- Adoção por múltiplos estudos simultâneos: `>= 10` projetos ativos com contratos claros.

### 2.5 Não-Objetivos (neste ciclo)

- Não transformar Marie em plataforma de BI genérica.
- Não substituir sistemas oficiais de coleta de dados.
- Não implementar treinamento de modelo próprio.
- Não introduzir backend novo nesta etapa apenas para armazenamento de sessão.

## 3. Estado Atual do Produto

### 3.1 Fluxo E2E Atual

1. Usuário acessa `/` e autentica com Google via Firebase.
2. Regra de autorização valida:
    - Domínio `@rga.com` com acesso total aos projetos.
    - Emails externos apenas se estiverem em `allowedUsers` do projeto.
3. Usuário seleciona projeto em `/projects`.
4. App busca `resultados` e `heurísticas` em APIs autenticadas por `api_key`.
5. Dados são carregados em memória React e sincronizados no filesystem do Pyodide.
6. Usuário envia pergunta no chat do projeto (`/projects/:slug`).
7. Serviço de IA gera corpo de script Python conforme prompt/router.
8. Runtime injeta boilerplate + script, executa via `pyodide.runPythonAsync`.
9. Output bruto vai para segundo passo de LLM para formatação em linguagem natural (Markdown).
10. UI mostra resposta e expande logs técnicos (script + stdout/stderr) para auditoria.

### 3.2 Fluxos de Negócio Atuais (implementados)

- **Autenticação**: `Firebase Auth` com `GoogleProvider`, persistência local do login.
- **Autorização**:
    - Interno: qualquer email `@rga.com`.
    - Externo: whitelist por projeto em `projects-data.ts`.
- **Seleção de projeto**: lista baseada no usuário logado.
- **Carga de dados**: duas chamadas HTTP por projeto (`resultsApi`, `heuristicsApi`).
- **Análise conversacional**:
    - Geração de script (`Gemini` ou `Ollama`).
    - Execução local em Python.
    - Formatação de resposta.
- **Reset de sessão**:
    - Limpa mensagens, input e etapa de processamento.
    - “Change project” exige confirmação dupla para evitar saída acidental. Esse comportamento será removido. Ou seja, quando o usuário quiser voltar para a home com todos os projetos, ele poderá fazê-lo sem restrições.

### 3.3 Capacidades Especiais do Estado Atual

- Suporte a comparação entre edições (`currentYear` vs `previousYear`).
- Router de prompts com 3 modos principais:
    - Template padrão.
    - Consulta customizada.
    - Consulta qualitativa por notas.
- Modo canônico para `finance5` para lidar com ambiguidades entre anos/jornadas.
- Registro de heurísticas canônicas (`finance5CanonicalRegistry.ts`) com relações:
  `equivalent`, `renumbered`, `split`, `merged`, `new_2026`, `retired_2025`.

### 3.4 Limitações Técnicas Relevantes

- Às vezes, o usuário não sabe o número da heurística. Apenas o seu "tema" e nem sempre a aplicação consegue encontrar a heuristica correta, ainda que o termo apareça no texto da descrição da heurística.
- Observabilidade ainda baseada em `console` e alertas locais.
- Sem suíte de testes automatizados no repositório.
- `storageService.ts` existe, mas não está integrado ao fluxo principal.
- Parte da UI para troca de provedor de modelo está oculta no layout.
- `Project` tipa `previous*` como obrigatório, mas há entradas com `null`.

## 4. Arquitetura Atual

### 4.1 Stack

- Frontend: `React 19`, `TypeScript`, `Vite`, `react-router-dom`.
- UI: CSS utilitário local + `lucide-react`.
- Auth: `Firebase Auth` (Google Sign-In).
- IA remota: `@google/genai` (Gemini).
- IA local/rede interna: `Ollama` (chat API).
- Execução analítica: `Pyodide 0.25.1` via script CDN.

### 4.2 Componentes Principais

- **App shell**: [App.tsx](/App.tsx)
    - Estado global da sessão.
    - Rotas e proteção de acesso.
    - Pipeline de análise.
- **Páginas**:
    - [pages/Home.tsx](/pages/Home.tsx)
    - [pages/Projects.tsx](/pages/Projects.tsx)
    - [pages/ProjectSlug.tsx](/pages/ProjectSlug.tsx)
- **Serviços**:
    - [services/geminiService.ts](/services/geminiService.ts)
    - [services/ollamaService.ts](/services/ollamaService.ts)
    - [services/pythonScriptBuilder.ts](/services/pythonScriptBuilder.ts)
    - [services/firebaseClient.ts](/services/firebaseClient.ts)
- **Prompt engine**:
    - [prompt/common.ts](/prompt/common.ts)
    - [prompt/finance.ts](/prompt/finance.ts)
    - [prompt/retail.ts](/prompt/retail.ts)
    - [prompt/projects/finance5.ts](/prompt/projects/finance5.ts)

### 4.3 Pipeline Técnico Atual

1. Prompt do usuário é enviado ao provedor IA selecionado.
2. Modelo retorna corpo de Python.
3. Sanitização e validação bloqueiam redefinição de helpers críticos.
4. Boilerplate compartilhado é injetado antes do corpo.
5. Script roda no Pyodide com dados locais em arquivos JSON.
6. Output bruto é repassado ao LLM para renderização final em Markdown.
7. UI exibe resposta + logs detalhados.

## 5. Contratos e Interfaces

### 5.1 Contrato de Projeto (`Project`)

Fonte: [projects-data.ts](/projects-data.ts)

Campos ativos:

- `slug`, `name`, `type`, `year`
- `previousSlug`, `previousName`, `previousYear`
- `resultsApi.url`, `resultsApi.api_key`
- `heuristicsApi.url`, `heuristicsApi.api_key`
- `allowedUsers` opcional

### 5.2 Contrato de Entrada de Dados (runtime Python)

`heuristicas.json` aceito em três formatos:

- `{ data: { heuristics: [...] } }`
- `{ heuristics: [...] }`
- `[...]`

`resultados.json` aceito em três formatos:

- `{ editions: { year_YYYY: { players: [...] } } }`
- `{ players: [...] }`
- `{ data: [...] }`

### 5.3 Contrato de Mensageria Interna

Fonte: [types.ts](/types.ts)

- `Message.role`: `user | assistant | system | error`
- `Message.content`: Markdown final ou erro.
- `Message.script`: código Python gerado (opcional).
- `Message.pythonOutput`: stdout/stderr da execução (opcional).

### 5.4 Variáveis de Ambiente Operacionais

- `VITE_GEMINI_API_KEY` ou `VITE_API_KEY`
- `GEMINI_API_KEY` ou `API_KEY` (fallback)
- `BASE_API_URL`
- `PROJECT_API_KEY`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_OLLAMA_BASE_URL` / `OLLAMA_BASE_URL` (opcional)
- `VITE_OLLAMA_MODEL` / `OLLAMA_MODEL` (opcional)

### 5.5 Endpoints por Projeto (modelo atual)

- `GET {BASE_API_URL}/api/result?project={slug}` com header `api_key`.
- `GET {BASE_API_URL}/api/heuristics?project={slug}` com header `api_key`.

Projetos atualmente configurados:

- `finance5`
- `retail6`
- `rspla2`
- `retail-emea-1`

### 5.6 Comportamento Especial `finance5` (canônico)

- Sempre operar em modo canônico quando projeto é `finance5`.
- Resolver heurística por conceito (`canonicalId`) e não por número bruto isolado.
- Em projetos cujo `type` é igual a `finance`, pode haver heurísticas distintas com o mesmo número, mas em jornadas diferentes. Por isso é importante o usuário informar a jornada e a heurística.
- Usar helpers canônicos para score, metadata e comparações históricas.
- Em ambiguidade real, sinalizar ambiguidade em vez de inferência forçada.

### 5.7 Contrato Prompt -> Python -> Runtime

- Resposta do modelo para script deve ser **somente corpo Python executável**.
- Boilerplate de imports/loaders/helpers é injetado pelo runtime.
- É proibido redefinir helpers e variáveis compartilhadas críticas.
- Apenas bibliotecas padrão Python no corpo gerado.

## 6. Segurança e Privacidade

### 6.1 Controles Existentes

- Chaves e endpoints sensíveis consumidos via ambiente.
- Acesso de usuário controlado por Firebase + whitelist por projeto.
- Dados de estudo carregados via APIs autenticadas por chave.
- Execução analítica local no navegador (Pyodide) reduzindo exposição do dataset bruto ao LLM.
- Logs técnicos de execução disponíveis para auditoria de resposta.

### 6.2 Lacunas Atuais

- Sem camada formal de auditoria centralizada (somente console/UI).
- Sem política explícita de retenção de logs/mensagens.
- Sem controle fino de autorização por ação (RBAC granular).
- Falta de validação de schema com contrato versionado para payloads.

### 6.3 Mitigações Prioritárias

- Definir política de logs e mascaramento de dados sensíveis.
- Introduzir validação de schema (ex.: JSON Schema + versionamento).
- Implementar trilha de auditoria de sessão e decisões de IA.
- Criar revisão de segurança semestral de prompts e guardrails.

## 7. Requisitos Não Funcionais (12 meses)

| Dimensão                | Meta                                               | Indicador                                 |
| ----------------------- | -------------------------------------------------- | ----------------------------------------- |
| Disponibilidade         | `99.5%` (horário comercial)                        | Sucesso de carregamento + chat por sessão |
| Latência de preparação  | Pyodide pronto em `<= 15s` P95                     | Tempo de inicialização runtime            |
| Latência de dados       | Carga inicial de projeto em `<= 8s` P95            | Tempo entre seleção e tela pronta         |
| Latência de resposta IA | Primeira resposta em `<= 20s` P95 (Gemini)         | Tempo envio -> resposta                   |
| Confiabilidade          | Falha de execução Python `<= 5%`                   | % de sessões com erro crítico             |
| Observabilidade         | 100% dos erros críticos com código + contexto      | Cobertura de eventos críticos             |
| Custo                   | Definir custo por sessão e teto mensal por projeto | Custo total IA / sessões                  |
| Operabilidade           | Onboarding de projeto em `<= 1 dia útil`           | Tempo de configuração e validação         |

## 8. Escalabilidade (0-3, 3-6, 6-12 meses)

### 8.1 Fase 0-3 meses (Estabilização e base de governança)

- `P0` Observabilidade mínima:
    - Eventos de sucesso/erro em auth, carga, geração de script e execução.
    - Impacto: alto.
    - Risco: baixo.
    - Dependências: padrão de logging e telemetria.
- `P0` Contratos de dados:
    - Schemas versionados de `heuristicas` e `resultados`.
    - Impacto: alto.
    - Risco: médio.
    - Dependências: alinhamento Produto + Dados.
- `P0` Hardening de prompt/runtime:
    - Expansão de validações no `pythonScriptBuilder`.
    - Impacto: alto.
    - Risco: médio.
    - Dependências: catálogo de erros reais.
- `P1` Correções de modelagem:
    - Ajuste de tipos `Project` para nulabilidade consistente.
    - Impacto: médio.
    - Risco: baixo.
    - Dependências: revisão de contratos legados.

### 8.2 Fase 3-6 meses (Escala de operação)

- `P0` Camada de testes automatizados:
    - Unitários para prompt builder, parser e validação.
    - Fluxo E2E mínimo de login -> projeto -> pergunta.
    - Impacto: alto.
    - Risco: médio.
- `P1` Catálogo de projetos operável:
    - Pipeline padronizado para cadastrar novo estudo sem alterar lógica central.
    - Impacto: alto.
    - Risco: médio.
- `P1` Estratégia multi-provedor:
    - Regras de fallback controladas (Gemini/Ollama) com SLO por projeto.
    - Impacto: médio.
    - Risco: médio.
- `P1` Melhorias de UX para erro recuperável:
    - Mensagens guiadas por causa e sugestão acionável.
    - Impacto: médio.
    - Risco: baixo.

### 8.3 Fase 6-12 meses (Plataforma e expansão de times)

- `P0` Governança avançada de IA:
    - Playbook formal para agentes, revisão humana obrigatória por criticidade.
    - Impacto: alto.
    - Risco: médio.
- `P1` Operação multi-time:
    - RACI estabilizado, cerimônias fixas e SLA de mudanças.
    - Impacto: alto.
    - Risco: baixo.
- `P1` Qualidade de resposta orientada por métricas:
    - Score de utilidade por sessão e ranking de prompts problemáticos.
    - Impacto: alto.
    - Risco: médio.
- `P2` Biblioteca de templates por domínio:
    - Perfis adicionais além de finance/retail com roteamento especializado.
    - Impacto: médio.
    - Risco: médio.

## 9. Governança para Agentes de IA (Completa)

### 9.1 Objetivo

Permitir que agentes de IA contribuam em manutenção e evolução sem comprometer segurança, confiabilidade analítica ou contratos de produto.

### 9.2 Contexto Mínimo Obrigatório (antes de atuar)

- Versão atual do PRD e changelog.
- Projeto ativo (`slug`, ano atual/anterior, tipo).
- Contrato de dados esperado.
- Estado das variáveis de ambiente necessárias.
- Critérios de sucesso da tarefa e limites de escopo.

### 9.3 Regras de Segurança (Guardrails)

- Nunca expor segredos ou tokens em código/documentação.
- Nunca alterar lógica de prompts críticos sem atualizar testes/validação.
- Nunca suprimir tratamento de erro crítico de Python.
- Nunca inferir equivalência de heurísticas canônicas sem evidência.
- Nunca executar ações destrutivas sem aprovação explícita humana.

### 9.4 Padrões de Prompt e Implementação

- Usar instruções de saída estrita para geração de script.
- Priorizar helpers compartilhados e evitar duplicação de lógica no corpo gerado.
- Em caso de ambiguidade, retornar decisão conservadora com explicação.
- Registrar no PR/commit quais contratos foram preservados ou alterados.

### 9.5 Limites de Atuação de Agentes

- Permitido: documentação, testes, refactor local, observabilidade, melhorias de UX não destrutivas.
- Condicional: mudanças em prompt core, auth e contratos de dados (exigem revisão humana obrigatória).
- Proibido sem aprovação: mudanças que afetem política de acesso, segurança e conformidade.

### 9.6 Checklist de Revisão Humana

- Contratos de entrada/saída preservados?
- Regras de autorização intactas?
- Mensagens de erro continuam auditáveis?
- Casos canônicos de `finance5` permanecem corretos?
- Métricas e logs continuam coletáveis?

### 9.7 Política de Fallback

- Falha no provedor primário IA:
    - Migrar para fallback configurado quando disponível.
    - Informar fallback aplicado em log/evento.
- Falha de execução Python:
    - Retornar erro amigável com resumo técnico.
    - Oferecer instrução de reconsulta com contexto mais específico.
- Falha de dados/API:
    - Bloquear análise e orientar nova tentativa após recarga do projeto.

## 10. Modelo Operacional Multi-time

### 10.1 Responsabilidades

| Função         | Responsabilidade principal                                              |
| -------------- | ----------------------------------------------------------------------- |
| Produto        | Priorização de roadmap, definição de sucesso, alinhamento de escopo     |
| Engenharia     | Arquitetura, qualidade de código, observabilidade, operação             |
| Dados/Pesquisa | Definição de heurísticas, qualidade de payload, validação de resultados |
| Segurança      | Política de acesso, revisão de risco, governança de segredos            |
| IA/Automação   | Evolução de prompts, guardrails, avaliação de qualidade de resposta     |

### 10.2 Cadência Operacional

- Semanal: triagem de bugs, revisão de erros críticos e incidentes.
- Quinzenal: planejamento de backlog e revisão de métricas de qualidade.
- Mensal: revisão de arquitetura leve, riscos e aderência ao PRD.
- Trimestral: revisão de roadmap 12 meses e replanejamento de capacidade.

### 10.3 Critérios de Aceite para Mudanças

- Sem regressão nos contratos principais.
- Testes/validações atualizados conforme impacto.
- Logs e observabilidade mantidos.
- Documentação sincronizada com mudança aprovada.

## 11. Riscos e Mitigações

| Risco                                          | Prob. | Impacto | Mitigação                                                    | Owner                |
| ---------------------------------------------- | ----- | ------- | ------------------------------------------------------------ | -------------------- |
| Script Python inválido gerado pelo LLM         | Média | Alto    | Expandir validações + testes de regressão por prompt         | Engenharia IA        |
| Indisponibilidade de provedor IA               | Média | Alto    | Fallback multi-provedor + monitoramento de erro por sessão   | Engenharia           |
| Ambiguidade de heurística em estudos canônicos | Alta  | Alto    | Resolver por `canonicalId` + política conservadora           | Dados + Engenharia   |
| Mudança de schema nas APIs de dados            | Média | Alto    | Versionamento de schema + validação automática               | Dados                |
| Acesso indevido por configuração de whitelist  | Baixa | Alto    | Auditoria periódica de `allowedUsers` + políticas de revisão | Segurança            |
| Falta de testes automatizados                  | Alta  | Médio   | Implantar base de testes em fases (unit + E2E crítico)       | Engenharia           |
| Custo IA não controlado                        | Média | Médio   | Métrica de custo por sessão + limite por projeto             | Produto + Engenharia |

## 12. Backlog Priorizado (Épicos e Entregas Incrementais)

### Épico 1 — Observabilidade de Ponta a Ponta (`P0`)

- Objetivo: tornar falhas e latências rastreáveis por sessão.
- Entregas:
    - Instrumentação de eventos críticos.
    - Painel mínimo de erros por etapa do pipeline.
    - Alertas para aumento de falha Python.
- Impacto esperado: queda de tempo de diagnóstico em `>= 50%`.
- Dependências: padrão de telemetry + convenção de IDs de sessão.
- Métrica: cobertura de eventos críticos `>= 95%`.

### Épico 2 — Contratos de Dados Versionados (`P0`)

- Objetivo: reduzir quebra silenciosa por mudança de payload.
- Entregas:
    - Schemas oficiais para `heurísticas` e `resultados`.
    - Validação em tempo de carga.
    - Mensagens de erro orientadas por schema.
- Impacto esperado: redução de incidentes de ingestão em `>= 70%`.
- Dependências: alinhamento de times de Dados e Engenharia.
- Métrica: taxa de erro de parse por release.

### Épico 3 — Confiabilidade do Pipeline IA/Python (`P0`)

- Objetivo: reduzir falhas de execução e respostas inconsistentes.
- Entregas:
    - Catálogo de prompts de regressão.
    - Testes unitários do builder/sanitizer.
    - Revisão de regras de bloqueio de redefinição indevida.
- Impacto esperado: falha crítica de execução `<= 5%`.
- Dependências: dataset de casos representativos.
- Métrica: erro crítico por 100 sessões.

### Épico 4 — Plataforma de Projetos Escalável (`P1`)

- Objetivo: aumentar velocidade de onboarding de novos estudos.
- Entregas:
    - Checklist padrão de cadastro de projeto.
    - Validação automática de configuração mínima.
    - Guia operacional para times não-core.
- Impacto esperado: onboarding em `<= 1 dia útil`.
- Dependências: contrato de projeto e schema versionado.
- Métrica: lead time de onboarding.

### Épico 5 — Governança Operacional de IA (`P1`)

- Objetivo: permitir contribuição segura de agentes e times distribuídos.
- Entregas:
    - Runbook oficial.
    - Checklist de revisão humana por criticidade.
    - Política de fallback e incident response de IA.
- Impacto esperado: menor risco de regressão silenciosa.
- Dependências: alinhamento Segurança + Engenharia + Produto.
- Métrica: % de mudanças críticas com revisão completa.

### Épico 6 — Testes E2E e Qualidade de UX (`P1`)

- Objetivo: garantir confiabilidade em fluxo real de usuário.
- Entregas:
    - Cenários E2E de login, carga, análise e erro.
    - Melhorias de UX para recuperação de falhas.
    - Validação de estados vazios e mensagens de acesso.
- Impacto esperado: queda de retrabalho operacional.
- Dependências: ambiente de teste e dados de homologação.
- Métrica: taxa de sucesso de cenários E2E críticos.

## 13. Plano de Teste do Documento

- Verificar completude: todas as seções obrigatórias presentes e sem placeholders.
- Verificar aderência ao código: fluxos e contratos descritos batem com implementação atual.
- Verificar segurança: nenhum segredo exposto; apenas nomes de variáveis e políticas.
- Verificar utilidade operacional: backlog, métricas e ownership definidos sem ambiguidade.
- Verificar governança de IA: runbook acionável por agentes e revisores humanos.
- Verificar legibilidade cross-funcional: produto, engenharia e dados conseguem usar o documento sem contexto adicional.

## 14. Premissas e Defaults

- Idioma principal: `PT-BR`.
- Horizonte estratégico: `12 meses`.
- Governança para IA: `completa`.
- Arquivo único: `PRD.md` (sem fragmentação nesta etapa).
- Esta entrega não altera código de runtime, apenas documentação de produto e operação.

## 15. Apêndices Técnicos

### 15.1 Glossário

- **Heurística**: critério avaliado no estudo (com número, regra de sucesso e metadados).
- **Journey**: etapa/contexto de avaliação dentro do produto analisado.
- **Canonical ID**: identificador estável de conceito em estudos com remapeamento entre anos.
- **Pyodide**: runtime Python em WebAssembly executado no navegador.
- **Boilerplate compartilhado**: bloco Python base injetado antes do script gerado.
- **Modo qualitativo**: análise baseada em `note` textual, não apenas score numérico.
- **Player**: entidade avaliada (instituição/produto) no dataset.

### 15.2 Mapa de Arquivos-Chave

| Arquivo                           | Função no sistema                                                  |
| --------------------------------- | ------------------------------------------------------------------ |
| `App.tsx`                         | Orquestra estado global, autenticação, rotas e pipeline de análise |
| `projects-data.ts`                | Catálogo de projetos, endpoints e regras de acesso por usuário     |
| `types.ts`                        | Contratos de estado e mensagens                                    |
| `services/geminiService.ts`       | Integração com Gemini e geração de script/resposta                 |
| `services/ollamaService.ts`       | Integração opcional com Ollama                                     |
| `services/pythonScriptBuilder.ts` | Sanitização/validação e montagem do script executável              |
| `prompt/common.ts`                | Contexto compartilhado, boilerplate e prompt formatter             |
| `prompt/finance.ts`               | Regras/prompt para projetos tipo finance                           |
| `prompt/retail.ts`                | Regras/prompt para projetos tipo retail                            |
| `prompt/projects/finance5.ts`     | Extensões canônicas e hint específico do `finance5`                |
| `finance5CanonicalRegistry.ts`    | Registro canônico de equivalência/transformação entre anos         |
| `pages/ProjectSlug.tsx`           | Tela de chat e visualização de logs técnicos                       |

### 15.3 Matriz de Rastreabilidade (Requisito -> Módulo Atual)

| Requisito                                      | Módulo(s) principal(is)                                                      |
| ---------------------------------------------- | ---------------------------------------------------------------------------- |
| Login Google com sessão persistente            | `services/firebaseClient.ts`, `App.tsx`                                      |
| Controle de acesso por domínio/whitelist       | `App.tsx`, `projects-data.ts`                                                |
| Carga de dados por projeto via API key         | `App.tsx`, `projects-data.ts`                                                |
| Geração de script Python por IA                | `services/geminiService.ts`, `services/ollamaService.ts`                     |
| Execução local de script e captura de logs     | `App.tsx`, `index.html` (Pyodide CDN)                                        |
| Formatação final em Markdown                   | `services/geminiService.ts`, `services/ollamaService.ts`, `prompt/common.ts` |
| Roteamento por perfil de análise               | `prompt/finance.ts`, `prompt/retail.ts`                                      |
| Tratamento canônico de ambiguidades `finance5` | `prompt/projects/finance5.ts`, `finance5CanonicalRegistry.ts`                |
| Exibição de script/output para auditoria       | `pages/ProjectSlug.tsx`, `types.ts`                                          |
| Troca e persistência de provedor IA            | `App.tsx`, `services/ollamaService.ts`                                       |

---

Este PRD passa a ser a referência canônica para evolução de Marie até nova revisão oficial.
