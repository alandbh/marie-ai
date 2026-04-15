import {
    PromptBuildContext,
    PromptProjectExtension,
    SharedBoilerplateOptions,
    buildSharedBoilerplate,
    buildSharedBoilerplateCode,
    joinSections,
} from "./common";

const financeContextMap: Record<string, string> = {
    app_open_authentication: "pedem autenticação sempre que o app é reaberto",
    extra_security_features: "oferecem recursos extras de segurança",
    terms_mobile_readability: "apresentam termos claros e legíveis no celular",
    contactless_limit_adjustment: "permitem ajustar limite por aproximação",
    post_opening_product_offer:
        "oferecem produtos financeiros após a abertura da conta",
    credit_enablement_in_app: "permitem habilitar a função crédito pelo app",
    gallery_boleto_attachment: "permitem anexar boletos da galeria",
    digital_wallet_integration: "integram o cartão a carteiras digitais",
    payment_initiation_itp:
        "possuem Iniciador de Transações de Pagamento (ITP)",
    post_optin_offers: "oferecem produtos após o opt-in",
    account_approval_time: "aprovam a conta com agilidade",
    pre_physical_virtual_card:
        "ativam cartão virtual antes da chegada do físico",
    app_stability: "mantêm estabilidade sem falhas do app",
    chatbot_visibility: "tornam o chatbot fácil de localizar",
    chatbot_natural_language: "possuem chatbot com linguagem natural",
    chatbot_meaningful_answers: "fazem o chatbot responder de forma útil",
    human_chat_support:
        "oferecem suporte humano via chat com rapidez e contexto",
    help_center: "possuem central de ajuda dentro do app",
    chatbot_sentiment_analysis: "fazem o chatbot entender sentimento",
    general_search_assistance: "fazem a busca ajudar em questões gerais",
    typo_tolerant_help_search: "aceitam erros de digitação na busca da ajuda",
    chatbot_contract_questions:
        "fazem o chatbot responder perguntas de contrato",
    chatbot_resume_conversation:
        "fazem o chatbot retomar conversas interrompidas",
    document_upload_ease: "facilitam o upload de documentos",
    pix_flow_ease: "tornam o passo a passo do pix simples e rápido",
    account_opening_stays_in_app: "permitem abrir conta sem sair do aplicativo",
    device_migration: "tornam a migração para um novo dispositivo segura",
    pfm_tools: "oferecem ferramentas de gestão financeira pessoal",
    pix_clipboard_detection: "detectam chave pix copiada e sugerem ação",
    open_finance_balance_display:
        "exibem saldo de outros bancos via open finance",
    marketplace: "possuem marketplace próprio",
    temporary_virtual_credit_card:
        "oferecem cartão de crédito virtual temporário",
    expanded_ecosystem: "oferecem serviços além do âmbito financeiro",
    voice_help_during_selfie: "oferecem ajuda por voz na selfie",
    multiple_accessibility_features:
        "oferecem mais de um recurso de acessibilidade",
    pix_ocr: "leem chave pix impressa ou manuscrita por OCR",
    voice_commands: "aceitam comandos de voz",
    accessibility_scanner: "têm boa pontuação no scanner de acessibilidade",
    chatbot_audio_input: "permitem enviar áudio ao chatbot",
    no_layout_breaks_accessibility:
        "evitam quebras de layout com acessibilidade",
};

const buildFinanceRouter = (extension?: PromptProjectExtension) =>
    `
## 🧠 PROTOCOLO DE DECISÃO (ROUTER)

Analise a intenção do usuário e escolha **UM** dos três modos abaixo para gerar o script.

### MODO 1: ANÁLISE PADRÃO (Rigid Template)
**Quando usar:**
- O usuário pede uma heurística específica, um número, um título ou um conceito bem delimitado.
**Ação:** Gere o script usando o TEMPLATE PADRÃO.

### MODO 2: CONSULTA CUSTOMIZADA (Flexible Logic)
**Quando usar:**
- Perguntas com filtros específicos.
- Perguntas de contagem.
- Cruzamento de dados complexos entre jornadas, scores e perfis de instituições.
**Ação:** Use os helpers do boilerplate para localizar a heurística, aplicar filtros e imprimir o resultado em Markdown simples.

### MODO 3: CONSULTA QUALITATIVA (Notas)
**Quando usar:**
- Perguntas que dependem do campo \`note\`.
- Pedidos por exemplos, evidências, explicações ou comentários do avaliador.
**Ação:** Use a heurística resolvida e imprima apenas notas relevantes, truncadas com segurança.

${extension?.routerSection || ""}
`.trim();

const financePlayerFilterBlock = `
ANALYZE_FINANCE_ONLY = False
# Estudos finance já contêm apenas instituições financeiras; não aplicar filtro por departmentSlug.
players_current = list(players_current)
players_previous = list(players_previous)
`.trim();

const buildFinanceRuntimeConfig = (extension?: PromptProjectExtension) =>
    `
USE_PROJECT_CANONICAL = False
PROJECT_CANONICAL_REGISTRY_FILE = ""
${extension?.runtimeConfig || ""}
`.trim();

const financeAdditionalLoaders = `
def load_project_registry():
    if not USE_PROJECT_CANONICAL or not PROJECT_CANONICAL_REGISTRY_FILE:
        return {"enabled": False, "canonicalHeuristics": []}
    try:
        with open(PROJECT_CANONICAL_REGISTRY_FILE, 'r') as f:
            data = json.load(f)
            if isinstance(data, dict):
                return data
    except Exception as e:
        print(f"DEBUG: Erro ao ler registry canônico: {e}")
    return {"enabled": False, "canonicalHeuristics": []}
`.trim();

const financePostLoadSetup = `
project_registry = load_project_registry()
canonical_heuristics = project_registry.get('canonicalHeuristics', []) if project_registry.get('enabled') else []
`.trim();

const buildFinanceHelpers = () =>
    `
def is_raw_heuristic_number(value):
    return bool(re.match(r'^\\\\d+\\\\.\\\\d+$', str(value or '').strip()))

def get_registry_entry_by_id(canonical_id):
    for entry in canonical_heuristics:
        if entry.get('canonicalId') == canonical_id:
            return entry
    return None

def get_registry_matches(entry, year):
    if not entry:
        return []
    matches = entry.get('matches', {}).get(str(year), [])
    if isinstance(matches, dict):
        return [matches]
    if isinstance(matches, list):
        return matches
    return []

def get_registry_search_blob(entry):
    parts = [
        entry.get('canonicalId', ''),
        entry.get('label', ''),
        entry.get('notes', ''),
    ]
    for year in ('2025', '2026'):
        for match in get_registry_matches(entry, year):
            parts.append(match.get('title', ''))
            parts.append(match.get('heuristicNumber', ''))
            parts.append(match.get('journey', ''))
    return normalize_text(" ".join(parts))

def get_explicit_journeys(term):
    term_norm = normalize_text(term)
    tokens = set(re.findall(r'\\b[a-z_]+\\b', term_norm))
    journeys = set()
    for entry in canonical_heuristics:
        for year in ('2025', '2026'):
            for match in get_registry_matches(entry, year):
                journey = normalize_text(match.get('journey', ''))
                if journey and journey in tokens:
                    journeys.add(journey)
    return journeys

def resolve_heuristic_ref(term):
    if not USE_PROJECT_CANONICAL or not canonical_heuristics:
        return None

    term_str = str(term or '').strip()
    if not term_str:
        return None

    exact_entry = get_registry_entry_by_id(term_str)
    if exact_entry:
        return exact_entry.get('canonicalId')

    explicit_numbers = re.findall(r'\\\\b\\\\d+\\\\.\\\\d+\\\\b', term_str)
    explicit_journeys = get_explicit_journeys(term_str)
    if explicit_numbers:
        numeric_candidates = []
        for entry in canonical_heuristics:
            has_number = False
            for year in ('2025', '2026'):
                for match in get_registry_matches(entry, year):
                    if str(match.get('heuristicNumber')) in explicit_numbers:
                        has_number = True
                        break
                if has_number:
                    break
            if has_number:
                numeric_candidates.append(entry)

        if explicit_journeys and numeric_candidates:
            current_journey_candidates = []
            current_year = str(CURRENT_YEAR)
            for entry in numeric_candidates:
                matches = [
                    match
                    for match in get_registry_matches(entry, current_year)
                    if str(match.get('heuristicNumber')) in explicit_numbers
                ]
                if any(
                    normalize_text(match.get('journey', '')) in explicit_journeys
                    for match in matches
                ):
                    current_journey_candidates.append(entry)

            if len(current_journey_candidates) == 1:
                return current_journey_candidates[0].get('canonicalId')
            if len(current_journey_candidates) > 1:
                numeric_candidates = current_journey_candidates
            else:
                any_year_journey_candidates = []
                for entry in numeric_candidates:
                    matches = []
                    for year in ('2025', '2026'):
                        matches.extend(
                            [
                                match
                                for match in get_registry_matches(entry, year)
                                if str(match.get('heuristicNumber')) in explicit_numbers
                            ]
                        )
                    if any(
                        normalize_text(match.get('journey', '')) in explicit_journeys
                        for match in matches
                    ):
                        any_year_journey_candidates.append(entry)
                if len(any_year_journey_candidates) == 1:
                    return any_year_journey_candidates[0].get('canonicalId')
                if len(any_year_journey_candidates) > 1:
                    numeric_candidates = any_year_journey_candidates

        if len(numeric_candidates) == 1:
            return numeric_candidates[0].get('canonicalId')
        if len(numeric_candidates) > 1 and is_raw_heuristic_number(term_str):
            print(f"DEBUG: Referência ambígua no registry para '{term_str}'.")
            return None

    term_norm = normalize_text(term_str)
    stop_words = {'de', 'do', 'da', 'em', 'no', 'na', 'por', 'para', 'com', 'sem', 'o', 'a', 'os', 'as', 'um', 'uma'}
    raw_tokens = term_norm.split()
    term_tokens = [token for token in raw_tokens if token not in stop_words]
    if not term_tokens:
        term_tokens = raw_tokens

    scored = []
    for entry in canonical_heuristics:
        blob = get_registry_search_blob(entry)
        score = 0
        label_norm = normalize_text(entry.get('label', ''))
        if label_norm and label_norm in term_norm:
            score += 20
        for year in ('2025', '2026'):
            for match in get_registry_matches(entry, year):
                match_number = str(match.get('heuristicNumber'))
                match_journey = normalize_text(match.get('journey', ''))
                if match_number in explicit_numbers:
                    score += 80 if year == str(CURRENT_YEAR) else 40
                    if explicit_journeys and match_journey in explicit_journeys:
                        score += 160 if year == str(CURRENT_YEAR) else 80
                title_norm = normalize_text(match.get('title', ''))
                if title_norm and title_norm in term_norm:
                    score += 40
                    if year == '2026' and len(get_registry_matches(entry, '2026')) == 1:
                        score += 15
        for token in term_tokens:
            if token in blob:
                score += 1
        if score > 0:
            scored.append((score, entry))

    scored.sort(key=lambda item: item[0], reverse=True)
    if not scored:
        return None
    if len(scored) > 1 and scored[0][0] == scored[1][0]:
        print(f"DEBUG: Match ambíguo no registry para '{term_str}'.")
        return None
    return scored[0][1].get('canonicalId')

def get_resolved_matches_for_year(heuristic_ref, target_year):
    if USE_PROJECT_CANONICAL and canonical_heuristics:
        canonical_id = resolve_heuristic_ref(heuristic_ref) or str(heuristic_ref)
        entry = get_registry_entry_by_id(canonical_id)
        if entry:
            return get_registry_matches(entry, target_year)
        return []
    return []

def get_scores_for_heuristic(player, heuristic_ref, target_year=CURRENT_YEAR):
    if 'scores' not in player or not isinstance(player['scores'], dict):
        return []

    if USE_PROJECT_CANONICAL and canonical_heuristics:
        scores_found = []
        for match in get_resolved_matches_for_year(heuristic_ref, target_year):
            journey_slug = match.get('journey')
            heuristic_number = match.get('heuristicNumber')
            h_key = f"h_{heuristic_number}"
            journey_data = player['scores'].get(journey_slug, {})
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

    scores_found = []
    h_key = f"h_{heuristic_ref}"
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

def get_heuristic_metadata(heuristic_ref, target_year=CURRENT_YEAR):
    if USE_PROJECT_CANONICAL and canonical_heuristics:
        canonical_id = resolve_heuristic_ref(heuristic_ref) or str(heuristic_ref)
        entry = get_registry_entry_by_id(canonical_id)
        if not entry:
            return None
        matches = get_registry_matches(entry, target_year)
        primary_match = matches[0] if matches else None
        return {
            'heuristicNumber': primary_match.get('heuristicNumber') if primary_match else canonical_id,
            'name': primary_match.get('title') if primary_match and len(matches) == 1 else entry.get('label', canonical_id),
            'success': '=5',
            'relation': entry.get('relation'),
            'canonicalId': canonical_id,
        }

    str_id = str(heuristic_ref)
    for heuristic in heuristics_data:
        if str(heuristic.get('heuristicNumber')) == str_id:
            return heuristic
    return None

def get_success_rule_for_heuristic(heuristic_ref, target_year=CURRENT_YEAR):
    if USE_PROJECT_CANONICAL and canonical_heuristics:
        return '=5'
    meta = get_heuristic_metadata(heuristic_ref, target_year)
    if not meta:
        return '=5'
    return meta.get('success', '=5')

def player_succeeds(player, heuristic_ref, target_year=CURRENT_YEAR):
    scores = get_scores_for_heuristic(player, heuristic_ref, target_year)
    rule = get_success_rule_for_heuristic(heuristic_ref, target_year)
    return bool(scores) and all(check_success(score, rule) for score in scores)

def has_matches_for_year(heuristic_ref, target_year):
    if USE_PROJECT_CANONICAL and canonical_heuristics:
        return bool(get_resolved_matches_for_year(heuristic_ref, target_year))
    return True

def find_heuristic_id_by_text(term):
    if not term:
        return None
    print(f"DEBUG: Buscando termo '{term}'")

    if USE_PROJECT_CANONICAL and canonical_heuristics:
        canonical_id = resolve_heuristic_ref(term)
        if canonical_id:
            print(f"DEBUG: Match encontrado no registry canônico: {canonical_id}")
            return canonical_id

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

    print("DEBUG: Nenhum match encontrado.")
    return None
`.trim();

const getFinanceBoilerplateOptions = (
    extension?: PromptProjectExtension,
): SharedBoilerplateOptions => ({
    contextMap: financeContextMap,
    additionalImports: "import re",
    runtimeConfig: buildFinanceRuntimeConfig(extension),
    additionalLoaders: financeAdditionalLoaders,
    postLoadSetup: financePostLoadSetup,
    playerFilterBlock: financePlayerFilterBlock,
    helperFunctions: buildFinanceHelpers(),
});

export const buildFinancePythonPrelude = (
    ctx: PromptBuildContext,
    extension?: PromptProjectExtension,
) => buildSharedBoilerplateCode(ctx, getFinanceBoilerplateOptions(extension));

const buildFinanceMode2Guidance = (extension?: PromptProjectExtension) =>
    `
## 🧪 DIRETRIZES PARA O "MODO 2: CONSULTA CUSTOMIZADA"

1. **Encontrar a referência da heurística**
   Use SEMPRE \`heuristic_ref = find_heuristic_id_by_text("termo_curto")\`.

2. **Acessar scores**
   Use:
   \`\`\`python
   scores = get_scores_for_heuristic(player, heuristic_ref, CURRENT_YEAR)
   \`\`\`

3. **Comparação histórica**
   Use:
   \`\`\`python
   status_curr = player_succeeds(player_current, heuristic_ref, CURRENT_YEAR)
   status_prev = player_succeeds(player_previous, heuristic_ref, PREVIOUS_YEAR)
   \`\`\`

${extension?.mode2Guidance || ""}
`.trim();

const buildFinanceMode3Guidance = (
    ctx: PromptBuildContext,
    extension?: PromptProjectExtension,
) =>
    `
## 🎯 DIRETRIZES PARA O "MODO 3: CONSULTA QUALITATIVA"

1. **Identificação da heurística**
   - Se o usuário der o ID, use direto apenas se não houver ambiguidade.
   - Caso contrário, use \`find_heuristic_id_by_text("termo_curto")\`.

2. **Coleta de notas**
   - Para cada player, percorra as jornadas que tenham a heurística resolvida.
   - Se \`USE_PROJECT_CANONICAL\` estiver ativo, use as jornadas dos matches canônicos do ano corrente.
   - Trunque a nota com:
     \`note_clean = " ".join(str(note or "").replace("|", "/").split())[:280]\`

3. **Output**
   \`print(f"### Notas Qualitativas {heuristic_ref} (${ctx.currentYear})")\`
   \`print("PLAYER | JOURNEY | NOTE")\`
   \`print("--- | --- | ---")\`

${extension?.mode3Guidance || ""}
`.trim();

const buildFinanceTemplate = (
    ctx: PromptBuildContext,
    extension?: PromptProjectExtension,
) =>
    `
## 📜 TEMPLATE PADRÃO

\`\`\`python
def print_player_list(title, player_names):
    clean_names = [str(name) for name in player_names if name is not None]
    clean_names.sort()
    print(f"\\n### {title} [{len(clean_names)}]")
    for name in clean_names:
        print(f"- {name}")

def is_player_eligible(player, heuristic_ref):
    return True

target_ids = [INSERT_HEURISTIC_IDS_OR_FINDER_CALLS_HERE]

cleaned_ids = []
for item in target_ids:
    if item:
        cleaned_ids.append(str(item))

if not cleaned_ids:
    print("ERRO: Nenhuma heurística encontrada para os termos pesquisados.")

for heuristic_ref in cleaned_ids:
    meta = get_heuristic_metadata(heuristic_ref, CURRENT_YEAR)
    if not meta:
        print(f"Heuristica {heuristic_ref} não encontrada nos metadados.")
        continue

    rule = get_success_rule_for_heuristic(heuristic_ref, CURRENT_YEAR)
    h_name = meta.get('name', 'Nome Desconhecido')
    display_id = meta.get('heuristicNumber', heuristic_ref)

    print(f"\\n----------------------------------------")
    print(f"## {display_id} - {h_name}")
    print(f"**Critério de Sucesso:** \`{rule}\`")
    print(f"----------------------------------------\\n")

    success_curr, fail_curr = [], []
    for player in players_current:
        if not is_player_eligible(player, heuristic_ref):
            continue
        is_success = player_succeeds(player, heuristic_ref, CURRENT_YEAR)
        name = safe_get_name(player)
        if is_success:
            success_curr.append(name)
        else:
            fail_curr.append(name)

    print_player_list(f"A. Players com Êxito (${ctx.currentYear})", success_curr)
    print_player_list(f"B. Players que Falharam (${ctx.currentYear})", fail_curr)

    improved, worsened = [], []
    for player_current in players_current:
        slug = player_current.get('slug')
        if not slug:
            continue

        player_previous = next((p for p in players_previous if p.get('slug') == slug), None)
        if not player_previous:
            continue

        if USE_PROJECT_CANONICAL:
            if not has_matches_for_year(heuristic_ref, CURRENT_YEAR):
                continue
            if not has_matches_for_year(heuristic_ref, PREVIOUS_YEAR):
                continue

        status_curr = player_succeeds(player_current, heuristic_ref, CURRENT_YEAR)
        status_prev = player_succeeds(player_previous, heuristic_ref, PREVIOUS_YEAR)

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
    context_phrase = context_map.get(str(display_id), context_map.get(str(heuristic_ref), h_name.lower()))

    print(f"\\n### E. Descoberta (insight)")
    print(f"**POSITIVA:**\\n{qtd_sucesso} de {total_eligible} instituições financeiras {context_phrase}.\\n")
    print(f"**NEGATIVA:**\\n{qtd_fracasso} de {total_eligible} instituições financeiras não {context_phrase}.")
\`\`\`

${extension?.templateNotes || ""}
`.trim();

export const buildFinanceInstruction = (
    ctx: PromptBuildContext,
    extension?: PromptProjectExtension,
) =>
    joinSections(
        buildFinanceRouter(extension),
        buildSharedBoilerplate(ctx, getFinanceBoilerplateOptions(extension)),
        buildFinanceMode2Guidance(extension),
        buildFinanceMode3Guidance(ctx, extension),
        buildFinanceTemplate(ctx, extension),
    );
