import {
    PromptBuildContext,
    SharedBoilerplateOptions,
    buildSharedBoilerplate,
    buildSharedBoilerplateCode,
    joinSections,
} from "./common";

const retailContextMap: Record<string, string> = {
    "2.1": "oferecem produtos complementares",
    "2.2": "fornecem recomendações personalizadas na Home",
    "3.10": "possuem busca por imagem",
    "3.11": "possuem busca por voz",
    "3.12": "lidam corretamente com erros de digitação na busca",
    "3.13": "entregam resultados precisos para buscas amplas",
    "3.14": "entregam resultados precisos para buscas semânticas",
    "3.15": "oferecem autocomplete na busca",
    "3.16": "fornecem resultados de busca altamente personalizados",
    "3.18": "permitem refinar buscas amplas com filtros relevantes",
    "3.2": "trazem resultados baseados no histórico de busca do usuário",
    "3.21": "permitem busca multimodal (imagem + texto)",
    "3.8": "exibem buscas recentes do usuário",
    "4.10": "apresentam informações detalhadas na página de produto",
    "4.4": "possuem reviews de clientes, com resumo gerado por IA",
    "5.1": "permitem login social",
    "5.15": "mostram locais de retirada ordenados por distância",
    "5.17": "possuem informações detalhadas de rastreamento",
    "5.18": "oferecem entrega no mesmo dia ou dia seguinte",
    "5.19": "facilitam o preenchimento de endereço com autocomplete/autofill",
    "5.21": "possuem opção de retirada em loja",
    "5.22": "mostram estoque em tempo real para retirada desde os resultados de busca",
    "5.23": "oferecem 5 ou mais meios de pagamento",
    "5.24": "permitem combinar dois métodos de pagamento",
    "5.25": "oferecem parcelamento sem juros",
    "5.26": "permitem assinatura de produtos ou compra recorrente",
    "5.27": "permitem cadastro para receber ofertas e novidades",
    "5.28": "oferecem opção de frete grátis",
    "5.29": "permitem upload de receita médica para gerar lista de compras",
    "5.5": "oferecem mais de um método de entrega",
    "5.9": "enviam notificações de produtos esquecidos no carrinho",
    "6.4": "utilizam 2 ou mais recursos multimídia para exibir produtos",
    "6.5": "permitem criar ou fazer upload de lista de compras recorrentes",
    "7.13": "apresentam estabilidade sem falhas de conexão ou indisponibilidade",
    "8.10": "possuem chatbot capaz de entender o sentimento do cliente",
    "8.13": "realizam a transferência do chatbot para humano rapidamente",
    "8.14": "possuem suporte humano que dá continuidade à conversa com o chatbot",
    "8.15": "possuem chatbot capazes de responder a interações multimodais",
    "8.16": "possuem chatbot que fornece respostas úteis e significativas",
    "8.2": "possuem chatbot com linguagem natural",
    "8.4": "permitem conversa por voz com o chatbot",
    "8.8": "possuem chatbot capaz de atuar como assistente de compras",
    "8.9": "possuem chatbot capaz de fazer alteração de endereço logo após a compra.",
    "9.3": "oferecem recursos adicionais de acessibilidade",
    "9.6": "possuem boa pontuação técnica de acessibilidade (Scanner)",
    "9.7": "possuem layout adaptável ao redimensionamento de fonte do sistema",
};

const buildRetailRouter = () => `
## 🧠 PROTOCOLO DE DECISÃO (ROUTER)

Analise a intenção do usuário e escolha **UM** dos três modos abaixo para gerar o script.

### MODO 1: ANÁLISE PADRÃO (Rigid Template)
**Quando usar:**
- O usuário pede um número de heurística (ex: "3.1", "analise a 5.4").
- O usuário pede pelo nome da heurística sem filtros complexos (ex: "quem tem busca por voz?", "fale sobre login social").
**Ação:** Gere o script usando ESTRITAMENTE o "TEMPLATE PADRÃO" definido no final destas instruções. A saída deve conter as listas A, B, C, D e E.

### MODO 2: CONSULTA CUSTOMIZADA (Flexible Logic)
**Quando usar:**
- Perguntas com filtros específicos (ex: "apenas no app", "apenas setor de moda/fashion").
- Perguntas de contagem específica (ex: "quantos players...", "quais players...").
- Cruzamento de dados complexos.
**Ação:** Escreva um script Python que:
1. Use os helpers do "SHARED BOILERPLATE" que já será injetado pelo runtime.
2. Use \`find_heuristic_id_by_text("palavra_chave")\` para encontrar IDs.
3. Implemente a lógica de filtro customizada.
4. Imprima o resultado em Markdown simples.

### MODO 3: CONSULTA QUALITATIVA (Notas)
**Quando usar:**
- Perguntas que exigem ler o campo \`note\` para inferir comportamento.
- Perguntas que citam explicitamente "nota", "evidência", "qualitativo", ou pedem exemplos/texto de jornada.
- Perguntas sobre um único tema/heurística, sem necessidade de contagem matemática.
**Ação:** Escreva um script Python que:
1. Use os helpers do "SHARED BOILERPLATE" que já será injetado pelo runtime.
2. Encontre a heurística com \`find_heuristic_id_by_text\`.
3. Considere apenas o ano corrente (\`players_current\`) a menos que o usuário peça comparação histórica.
4. Respeite \`ignore_journey\` e \`zeroed_journey\`.
5. Para cada player elegível, colete as jornadas da heurística e imprima apenas notas não vazias, truncadas a 280 caracteres.

**Pedido especial "apenas finance":**
Em qualquer modo, se o usuário pedir explicitamente analisar "apenas o setor financeiro", "isolando finance", "foco no finance", "só players de finance", etc., setar \`ANALYZE_FINANCE_ONLY = True\` no script. Caso contrário, manter \`False\`.
`.trim();

const retailPlayerFilterBlock = `
ANALYZE_FINANCE_ONLY = False
if ANALYZE_FINANCE_ONLY:
    players_current = [p for p in players_current if p.get('departmentObj', {}).get('departmentSlug') == 'finance']
    players_previous = [p for p in players_previous if p.get('departmentObj', {}).get('departmentSlug') == 'finance']
else:
    players_current = [p for p in players_current if p.get('departmentObj', {}).get('departmentSlug') != 'finance']
    players_previous = [p for p in players_previous if p.get('departmentObj', {}).get('departmentSlug') != 'finance']
`.trim();

const buildRetailHelpers = () => `
def find_heuristic_id_by_text(term):
    if not term:
        return None
    print(f"DEBUG: Buscando termo '{term}'")
    term_norm = normalize_text(term)
    stop_words = {'de', 'do', 'da', 'em', 'no', 'na', 'por', 'para', 'com', 'sem', 'o', 'a', 'os', 'as', 'um', 'uma'}
    raw_tokens = term_norm.split()
    term_tokens = [token for token in raw_tokens if token not in stop_words]
    if not term_tokens:
        term_tokens = raw_tokens

    for h_id, desc in context_map.items():
        desc_norm = normalize_text(desc)
        if all(token in desc_norm for token in term_tokens):
            print(f"DEBUG: Match encontrado no context_map: {h_id} ({desc})")
            return h_id

    for heuristic in heuristics_data:
        if str(heuristic.get('heuristicNumber')) == str(term):
            return heuristic.get('heuristicNumber')

    for heuristic in heuristics_data:
        h_name_norm = normalize_text(heuristic.get('name', ''))
        if all(token in h_name_norm for token in term_tokens):
            print(f"DEBUG: Match encontrado no nome: {heuristic.get('heuristicNumber')}")
            return heuristic.get('heuristicNumber')

    for heuristic in heuristics_data:
        desc_norm = normalize_text(heuristic.get('description', ''))
        if all(token in desc_norm for token in term_tokens):
            print(f"DEBUG: Match encontrado na descrição: {heuristic.get('heuristicNumber')}")
            return heuristic.get('heuristicNumber')

    for heuristic in heuristics_data:
        q_norm = normalize_text(heuristic.get('question', ''))
        if all(token in q_norm for token in term_tokens):
            return heuristic.get('heuristicNumber')

    print("DEBUG: Nenhum match encontrado.")
    return None

def get_scores_for_heuristic(player, heuristic_ref):
    scores_found = []
    h_key = f"h_{heuristic_ref}"
    if 'scores' not in player or not isinstance(player['scores'], dict):
        return []
    for journey_slug, journey_data in player['scores'].items():
        if not isinstance(journey_data, dict):
            continue
        if journey_data.get('ignore_journey') is True:
            continue
        if journey_data.get('zeroed_journey') is True:
            continue
        if h_key in journey_data:
            val = journey_data[h_key].get('scoreValue')
            if val is not None:
                try:
                    scores_found.append(float(val))
                except:
                    pass
    return scores_found

def get_heuristic_metadata(heuristic_ref):
    str_id = str(heuristic_ref)
    for heuristic in heuristics_data:
        if str(heuristic.get('heuristicNumber')) == str_id:
            return heuristic
    return None

def player_has_heuristic_object(player, heuristic_ref):
    h_key = f"h_{heuristic_ref}"
    if 'scores' not in player or not isinstance(player['scores'], dict):
        return False
    for journey_slug, journey_data in player['scores'].items():
        if not isinstance(journey_data, dict):
            continue
        if journey_data.get('ignore_journey') is True:
            continue
        if journey_data.get('zeroed_journey') is True:
            continue
        if h_key in journey_data:
            return True
    return False

def player_has_score_above(player, heuristic_ref, threshold):
    scores = get_scores_for_heuristic(player, heuristic_ref)
    return bool(scores) and all(score > threshold for score in scores)

def is_chatbot_heuristic(heuristic_ref):
    return str(heuristic_ref).startswith('8.')

def is_player_eligible(player, heuristic_ref):
    dept = player.get('departmentObj', {}).get('departmentSlug')
    str_id = str(heuristic_ref)
    if str_id == '8.14':
        return player_has_score_above(player, '8.14', 1)
    if is_chatbot_heuristic(str_id):
        return player_has_score_above(player, '8.2', 1)
    if str_id == '5.26':
        return player_has_heuristic_object(player, '5.26')
    if str_id == '5.15':
        return player_has_score_above(player, '5.15', 1)
    if str_id == '4.4':
        return player_has_score_above(player, '4.4', 1)
    if str_id == '5.22':
        return player_has_score_above(player, '5.15', 1)
    if str_id == '6.5':
        return dept == 'supermercado'
    if str_id == '5.29':
        return dept == 'beauty-and-drugstore'
    return True
`.trim();

const getRetailBoilerplateOptions = (): SharedBoilerplateOptions => ({
    contextMap: retailContextMap,
    playerFilterBlock: retailPlayerFilterBlock,
    helperFunctions: buildRetailHelpers(),
});

export const buildRetailPythonPrelude = (ctx: PromptBuildContext) =>
    buildSharedBoilerplateCode(ctx, getRetailBoilerplateOptions());

const buildRetailMode2Guidance = () => `
## 🧪 DIRETRIZES PARA O "MODO 2: CONSULTA CUSTOMIZADA"

1. **Encontrar o ID da heurística**
   Use SEMPRE \`heuristic_ref = find_heuristic_id_by_text("termo_curto")\`.

2. **Acessar scores de uma jornada específica**
   O objeto \`scores\` tem chaves como 'web', 'app', 'chatbot'.
   Exemplo:
   \`\`\`python
   journey_data = player['scores'].get('app', {})
   score_obj = journey_data.get(f"h_{heuristic_ref}")
   score_val = score_obj.get('scoreValue') if score_obj else None
   \`\`\`

3. **Output**
   Imprima um título claro com a contagem.
`.trim();

const buildRetailMode3Guidance = (ctx: PromptBuildContext) => `
## 🎯 DIRETRIZES PARA O "MODO 3: CONSULTA QUALITATIVA"

1. **Identificação da heurística**
   - Se o usuário der o ID, use direto.
   - Caso contrário, use \`find_heuristic_id_by_text("termo_curto")\`.

2. **Coleta de notas**
   - Para cada player, percorra as jornadas que tenham \`h_{heuristic_ref}\` com nota não vazia.
   - Trunque a nota com:
     \`note_clean = " ".join(str(note or "").replace("|", "/").split())[:280]\`

3. **Output**
   \`print(f"### Notas Qualitativas {heuristic_ref} (${ctx.currentYear})")\`
   \`print("PLAYER | JOURNEY | NOTE")\`
   \`print("--- | --- | ---")\`
`.trim();

const buildRetailTemplate = (ctx: PromptBuildContext) => `
## 📜 TEMPLATE PADRÃO

\`\`\`python
def print_player_list(title, player_names):
    clean_names = [str(name) for name in player_names if name is not None]
    clean_names.sort()
    print(f"\\n### {title} [{len(clean_names)}]")
    for name in clean_names:
        print(f"- {name}")

target_ids = [INSERT_HEURISTIC_IDS_OR_FINDER_CALLS_HERE]

cleaned_ids = []
for item in target_ids:
    if item:
        cleaned_ids.append(str(item))

if not cleaned_ids:
    print("ERRO: Nenhuma heurística encontrada para os termos pesquisados.")

for heuristic_ref in cleaned_ids:
    meta = get_heuristic_metadata(heuristic_ref)
    if not meta:
        print(f"Heuristica {heuristic_ref} não encontrada nos metadados.")
        continue

    rule = meta.get('success', '=5')
    h_name = meta.get('name', 'Nome Desconhecido')

    print(f"\\n----------------------------------------")
    print(f"## {heuristic_ref} - {h_name}")
    print(f"**Critério de Sucesso:** \`{rule}\`")
    print(f"----------------------------------------\\n")

    success_curr, fail_curr = [], []
    for player in players_current:
        if not is_player_eligible(player, heuristic_ref):
            continue
        scores = get_scores_for_heuristic(player, heuristic_ref)
        is_success = bool(scores) and all(check_success(score, rule) for score in scores)
        name = safe_get_name(player)
        if is_success:
            success_curr.append(name)
        else:
            fail_curr.append(name)

    print_player_list(f"A. Players com Êxito (${ctx.currentYear})", success_curr)
    print_player_list(f"B. Players que Falharam (${ctx.currentYear})", fail_curr)

    improved, worsened = [], []
    for player_current in players_current:
        if not is_player_eligible(player_current, heuristic_ref):
            continue

        slug = player_current.get('slug')
        if not slug:
            continue

        player_previous = next((p for p in players_previous if p.get('slug') == slug), None)
        if not player_previous:
            continue

        scores_curr = get_scores_for_heuristic(player_current, heuristic_ref)
        status_curr = bool(scores_curr) and all(check_success(score, rule) for score in scores_curr)

        status_prev = False
        if is_player_eligible(player_previous, heuristic_ref):
            scores_prev = get_scores_for_heuristic(player_previous, heuristic_ref)
            status_prev = bool(scores_prev) and all(check_success(score, rule) for score in scores_prev)

        name = safe_get_name(player_current)
        if not status_prev and status_curr:
            improved.append(name)
        if status_prev and not status_curr:
            worsened.append(name)

    print_player_list("C. Players que Melhoraram", improved)
    print_player_list("D. Players que Pioraram", worsened)

    total_eligible = len(success_curr) + len(fail_curr)
    qtd_sucesso = len(success_curr)
    qtd_fracasso = len(fail_curr)
    context_phrase = context_map.get(str(heuristic_ref), "possuem este recurso")
    entities_label = "instituições financeiras" if ANALYZE_FINANCE_ONLY else "e-commerces"

    print(f"\\n### E. Descoberta (insight)")
    print(f"**POSITIVA:**\\n{qtd_sucesso} de {total_eligible} {entities_label} {context_phrase}.\\n")
    print(f"**NEGATIVA:**\\n{qtd_fracasso} de {total_eligible} {entities_label} não {context_phrase}.")
\`\`\`
`.trim();

export const buildRetailInstruction = (ctx: PromptBuildContext) =>
    joinSections(
        buildRetailRouter(),
        buildSharedBoilerplate(ctx, getRetailBoilerplateOptions()),
        buildRetailMode2Guidance(),
        buildRetailMode3Guidance(ctx),
        buildRetailTemplate(ctx),
    );
