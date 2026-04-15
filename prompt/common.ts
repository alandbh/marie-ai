import { Project } from "../projects-data";

export interface PromptBuildContext {
    project?: Project;
    currentYear: number;
    previousYear: number | null;
    yearKeyCurrent: string;
    yearKeyPrevious: string;
    projectSlug: string;
    projectType: string;
}

export interface PromptProjectExtension {
    routerSection?: string;
    runtimeConfig?: string;
    mode2Guidance?: string;
    mode3Guidance?: string;
    templateNotes?: string;
}

export interface SharedBoilerplateOptions {
    contextMap: Record<string, string>;
    additionalImports?: string;
    runtimeConfig?: string;
    additionalLoaders?: string;
    postLoadSetup?: string;
    playerFilterBlock: string;
    helperFunctions?: string;
}

export const buildPromptContext = (project?: Project): PromptBuildContext => {
    const currentYear = project ? project.year : 2025;
    const previousYear = project?.previousYear ?? 2024;

    return {
        project,
        currentYear,
        previousYear,
        yearKeyCurrent: `year_${currentYear}`,
        yearKeyPrevious: `year_${previousYear}`,
        projectSlug: project?.slug ?? "",
        projectType: project?.type ?? "retail",
    };
};

export const joinSections = (...sections: Array<string | undefined>) =>
    sections.filter(Boolean).join("\n\n");

export const buildCommonInstructionIntro = () => `
Você é Marie, uma Cientista de Dados, com ênfase em UX e Avaliações Heurísticas.
Você está aqui ajudar os pesquisadores da R/GA a fazer descobertas incríveis sobre seus estudos Google.
Seu nome foi inspirado na brilhante cientista Marie Curie (1867-1934), que foi uma física e química polonesa naturalizada francesa, pioneira nos estudos da radioatividade, sendo a primeira mulher a ganhar um Prêmio Nobel, a primeira pessoa a ganhar dois Prêmios Nobel (em áreas científicas diferentes: Física e Química), e a única pessoa a ganhar o Nobel em duas áreas distintas (Física em 1903, Química em 1911). Ela descobriu os elementos Polônio e Rádio, cunhou o termo "radioatividade" e desenvolveu técnicas para isolar isótopos radioativos, cujas aplicações revolucionaram a medicina, especialmente na radioterapia para o tratamento do câncer, e fundou institutos de pesquisa em Paris e Varsóvia.

Seu objetivo é EXCLUSIVAMENTE escrever um script Python que extraia dados para responder a pergunta.

Contrato de saída obrigatório:
- O runtime da aplicação injeta automaticamente o SHARED BOILERPLATE antes do seu código.
- Responda apenas com o CORPO do script, pronto para ser anexado após esse boilerplate.
- Nunca reescreva imports base nem helpers compartilhados como \`normalize_text\`, \`load_data\`, \`check_success\`, \`safe_get_name\`, \`find_heuristic_id_by_text\`, \`get_scores_for_heuristic\`, \`get_heuristic_metadata\` ou \`player_succeeds\`.

---
`.trim();

const toPythonDict = (value: Record<string, string>) =>
    JSON.stringify(value, null, 4);

export const buildSharedBoilerplateCode = (
    ctx: PromptBuildContext,
    options: SharedBoilerplateOptions,
) => `
import json
import unicodedata
${options.additionalImports || ""}

context_map = ${toPythonDict(options.contextMap)}

PROJECT_SLUG = "${ctx.projectSlug}"
CURRENT_YEAR = ${ctx.currentYear}
PREVIOUS_YEAR = ${ctx.previousYear ?? "None"}
${options.runtimeConfig || ""}

def normalize_text(text):
    if not text:
        return ""
    return unicodedata.normalize('NFKD', str(text)).encode('ASCII', 'ignore').decode('utf-8').lower().strip()

def load_data():
    h_list = []
    try:
        with open('heuristicas.json', 'r') as f:
            h_data = json.load(f)
            if isinstance(h_data, dict) and 'data' in h_data and 'heuristics' in h_data['data']:
                h_list = h_data['data']['heuristics']
            elif isinstance(h_data, dict) and 'heuristics' in h_data:
                h_list = h_data['heuristics']
            elif isinstance(h_data, list):
                h_list = h_data
    except Exception as e:
        print(f"DEBUG: Erro ao ler heuristicas.json: {e}")

    players_current = []
    players_previous = []
    try:
        with open('resultados.json', 'r') as f:
            r_data = json.load(f)
            if 'editions' in r_data:
                if '${ctx.yearKeyCurrent}' in r_data['editions']:
                    players_current = r_data['editions']['${ctx.yearKeyCurrent}'].get('players', [])
                if '${ctx.yearKeyPrevious}' in r_data['editions']:
                    players_previous = r_data['editions']['${ctx.yearKeyPrevious}'].get('players', [])
            elif 'players' in r_data:
                players_current = r_data['players']
            elif 'data' in r_data and isinstance(r_data['data'], list):
                players_current = r_data['data']
    except Exception as e:
        print(f"DEBUG: Erro ao ler resultados.json: {e}")

    return h_list, players_current, players_previous
${options.additionalLoaders || ""}

heuristics_data, players_current, players_previous = load_data()
${options.postLoadSetup || ""}

${options.playerFilterBlock}

def check_success(score_val, rule_str):
    if score_val is None:
        return False
    try:
        s = float(score_val)
        rule = str(rule_str).lower().strip()
        if ' and ' in rule:
            parts = rule.split(' and ')
            valid_targets = []
            for p in parts:
                try:
                    valid_targets.append(float(p.replace('=', '').strip()))
                except:
                    pass
            return s in valid_targets
        if rule.startswith('>='):
            return s >= float(rule[2:])
        if rule.startswith('>'):
            return s > float(rule[1:])
        if rule.startswith('<='):
            return s <= float(rule[2:])
        if rule.startswith('<'):
            return s < float(rule[1:])
        if rule.startswith('='):
            return s == float(rule[1:])
        return s == float(rule)
    except:
        return False

def safe_get_name(player):
    return str(player.get('name') or "Unknown").strip()

${options.helperFunctions || ""}
`.trim();

export const buildSharedBoilerplate = (
    ctx: PromptBuildContext,
    options: SharedBoilerplateOptions,
) => `
## 🛠️ SHARED BOILERPLATE (INJETADO AUTOMATICAMENTE PELO RUNTIME)

\`\`\`python
${buildSharedBoilerplateCode(ctx, options)}
\`\`\`
`.trim();

export const buildResponseFormatterPrompt = () => `
Você é o assistente final da R/GA.
Abaixo está o output da execução do código Python.

**SUA TAREFA:**
1. Formatar a resposta utilizando **MARKDOWN**.
2. **SE O OUTPUT FOR DO MODO PADRÃO (Listas A, B, C, D, E):**
   - Mantenha a estrutura rigorosa.
   - Destaque o Título da Heurística e Critério.
   - Formate as listas com bullet points e contagem no título. Ex: "**B. Players que Falharam (2025) [23]**"
   - Destaque os Insights (Positiva/Negativa).

3. **SE O OUTPUT CONTIVER ERRO DE EXECUÇÃO PYTHON:**
   - Se houver \`CRITICAL PYTHON ERROR\`, \`Traceback\`, \`NameError\`, \`SyntaxError\` ou erro equivalente, trate como falha interna do script gerado.
   - Não diga que faltaram dados ou que os filtros não encontraram resultado.
   - Explique que a geração/execução do script falhou e mostre um resumo curto do erro técnico.

4. **SE O OUTPUT FOR DO MODO CUSTOMIZADO (Listas Simples):**
   - Apenas formate o markdown de forma limpa e legível.
   - Respeite os títulos e contagens gerados pelo Python.
   - Não tente forçar o formato A/B/C/D se ele não existir no output.
   - Se o output estiver realmente vazio ou só indicar ausência de dados, explique que não encontrou dados para os filtros aplicados, sugerindo tentar termos mais genéricos.

5. **SE O OUTPUT FOR DO MODO QUALITATIVO (Notas por player/jornada):**
   - Interprete o bloco "Notas Qualitativas" e resuma quem atende ou não ao pedido do usuário com base no texto das notas.
   - Mantenha o formato em Markdown claro (ex.: lista de players com jornadas e o achado principal).
   - Não force A/B/C/D/E. Se houver incerteza ou nota ambígua, mencione explicitamente.
   - Se não houver notas, informe que não há evidências para o filtro aplicado.

6. **FINALIZAÇÃO:**
   Ao final de qualquer resposta, adicione uma linha horizontal (\`---\`) e a mensagem em itálico:
   *Para analisar outra heurística, clique no botão 'Iniciar Nova Análise' abaixo.*

DADOS DO PYTHON:
`.trim();
