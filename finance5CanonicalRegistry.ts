export type CanonicalRelation =
    | "equivalent"
    | "renumbered"
    | "split"
    | "merged"
    | "new_2026"
    | "retired_2025";

export interface CanonicalHeuristicMatch {
    journey: string;
    heuristicNumber: string;
    title: string;
}

export interface CanonicalHeuristicEntry {
    canonicalId: string;
    label: string;
    relation: CanonicalRelation;
    matches: {
        "2025": CanonicalHeuristicMatch[];
        "2026": CanonicalHeuristicMatch[];
    };
    notes?: string;
}

export interface CanonicalHeuristicRegistry {
    project: string;
    enabled: boolean;
    canonicalHeuristics: CanonicalHeuristicEntry[];
}

const finance5CanonicalHeuristics: CanonicalHeuristicEntry[] = [
    {
        canonicalId: "app_open_authentication",
        label: "Autenticação ao abrir o app",
        relation: "equivalent",
        matches: {
            "2025": [
                {
                    journey: "gerais",
                    heuristicNumber: "1.1",
                    title: "O app exige autenticação (biometria ou senha) sempre que é aberto?",
                },
            ],
            "2026": [
                {
                    journey: "seguranca",
                    heuristicNumber: "1.1",
                    title: "O app exige autenticação (biometria ou senha) sempre que é aberto?",
                },
            ],
        },
    },
    {
        canonicalId: "extra_security_features",
        label: "Recursos extras de segurança",
        relation: "renumbered",
        matches: {
            "2025": [
                {
                    journey: "abertura",
                    heuristicNumber: "1.1",
                    title: "O app oferece recursos extras de segurança.",
                },
            ],
            "2026": [
                {
                    journey: "seguranca",
                    heuristicNumber: "1.2",
                    title: "O app oferece recursos extras de segurança.",
                },
            ],
        },
    },
    {
        canonicalId: "terms_mobile_readability",
        label: "Termos otimizados para mobile",
        relation: "renumbered",
        matches: {
            "2025": [
                {
                    journey: "gerais",
                    heuristicNumber: "1.2",
                    title: "Os termos de uso/contrato são de fácil compreensão e os documentos são otimizados para dispositivos móveis.",
                },
            ],
            "2026": [
                {
                    journey: "abertura",
                    heuristicNumber: "1.3",
                    title: "Os termos de uso/contrato são de fácil compreensão e os documentos são otimizados para dispositivos móveis.",
                },
            ],
        },
    },
    {
        canonicalId: "selfie_fraud_protection",
        label: "Segurança da selfie contra fraude",
        relation: "retired_2025",
        matches: {
            "2025": [
                {
                    journey: "abertura",
                    heuristicNumber: "1.2",
                    title: "A identificação por selfie é segura e a prova de fraudes.",
                },
            ],
            "2026": [],
        },
        notes: "Não há correspondência 1:1 clara em 2026.",
    },
    {
        canonicalId: "app_store_reputation",
        label: "Reputação nas lojas de apps",
        relation: "retired_2025",
        matches: {
            "2025": [
                {
                    journey: "gerais",
                    heuristicNumber: "1.4",
                    title: "Reputação do app na Play Store e Apple Store",
                },
            ],
            "2026": [],
        },
    },
    {
        canonicalId: "boleto_payee_clarity",
        label: "Clareza do destinatário no boleto",
        relation: "retired_2025",
        matches: {
            "2025": [
                {
                    journey: "gerais",
                    heuristicNumber: "1.5",
                    title: "O app deixa claro qual é o destinatário em um pagamento de boleto.",
                },
            ],
            "2026": [],
        },
    },
    {
        canonicalId: "contactless_toggle",
        label: "Ativar ou desativar contactless",
        relation: "retired_2025",
        matches: {
            "2025": [
                {
                    journey: "cartao",
                    heuristicNumber: "2.1",
                    title: "O app permite ativar/desativar o contactless (pagamento por aproximação)",
                },
            ],
            "2026": [],
        },
    },
    {
        canonicalId: "contactless_limit_adjustment",
        label: "Ajuste de limite por aproximação",
        relation: "equivalent",
        matches: {
            "2025": [
                {
                    journey: "cartao",
                    heuristicNumber: "2.2",
                    title: "É possível ajustar o limite por aproximação, tanto do cartão físico quanto do Google Pay?",
                },
            ],
            "2026": [
                {
                    journey: "produtos",
                    heuristicNumber: "2.2",
                    title: "É possível ajustar o limite por aproximação, tanto do cartão físico quanto do Google Pay?",
                },
            ],
        },
    },
    {
        canonicalId: "home_insurance_plan_personalization",
        label: "Recomendação e personalização do seguro residência",
        relation: "new_2026",
        matches: {
            "2025": [],
            "2026": [
                {
                    journey: "produtos",
                    heuristicNumber: "2.1",
                    title: "O seguro residência recomenda um plano ideal e oferece a possibilidade de personalização do mesmo.",
                },
            ],
        },
    },
    {
        canonicalId: "credit_card_personalization",
        label: "Personalização do cartão de crédito",
        relation: "new_2026",
        matches: {
            "2025": [],
            "2026": [
                {
                    journey: "produtos",
                    heuristicNumber: "2.3",
                    title: "O aplicativo permite diferentes tipos de personalização para o cartão de crédito? ",
                },
            ],
        },
    },
    {
        canonicalId: "debit_card_personalization",
        label: "Personalização do cartão de débito",
        relation: "new_2026",
        matches: {
            "2025": [],
            "2026": [
                {
                    journey: "produtos",
                    heuristicNumber: "2.4",
                    title: "O aplicativo permite diferentes tipos de personalização para o cartão de débito?",
                },
            ],
        },
    },
    {
        canonicalId: "account_opening_status_emails",
        label: "E-mails de status da abertura de conta",
        relation: "retired_2025",
        matches: {
            "2025": [
                {
                    journey: "abertura",
                    heuristicNumber: "3.1",
                    title: "Emails de status do processo. Após a abertura, o banco comunica se a conta foi aberta com sucesso ou não.",
                },
            ],
            "2026": [],
        },
    },
    {
        canonicalId: "generic_operation_feedback",
        label: "Feedback rápido sobre operações",
        relation: "retired_2025",
        matches: {
            "2025": [
                {
                    journey: "gerais",
                    heuristicNumber: "3.1",
                    title: "O app apresenta feedback aos usuários o mais rápido possível, informando-os sobre o sucesso ou o fracasso de qualquer operação.",
                },
            ],
            "2026": [],
        },
    },
    {
        canonicalId: "account_opening_progress_clarity",
        label: "Clareza do progresso na abertura de conta",
        relation: "retired_2025",
        matches: {
            "2025": [
                {
                    journey: "abertura",
                    heuristicNumber: "3.2",
                    title: "O app deixa evidente para o usuário onde ele está durante o processo de abertura.",
                },
            ],
            "2026": [],
        },
    },
    {
        canonicalId: "home_insurance_summary_details",
        label: "Resumo detalhado do seguro residência",
        relation: "new_2026",
        matches: {
            "2025": [],
            "2026": [
                {
                    journey: "produtos",
                    heuristicNumber: "3.1",
                    title: "A página de resumo final possui informações detalhadas sobre o seguro residência que está sendo contratado.",
                },
            ],
        },
    },
    {
        canonicalId: "conversational_account_opening",
        label: "Abertura de conta conversacional",
        relation: "new_2026",
        matches: {
            "2025": [],
            "2026": [
                {
                    journey: "abertura",
                    heuristicNumber: "3.3",
                    title: "O app oferece um processo de abertura de conta conversacional por meio de seus canais digitais.",
                },
            ],
        },
    },
    {
        canonicalId: "simulated_cpf_detection",
        label: "Detecção imediata de CPF simulado no Pix",
        relation: "new_2026",
        matches: {
            "2025": [],
            "2026": [
                {
                    journey: "abertura",
                    heuristicNumber: "3.4",
                    title: "O app identifica um CPF simulado imediatamente, ao tentar fazer uma transferência via Pix.",
                },
            ],
        },
    },
    {
        canonicalId: "post_opening_product_offer",
        label: "Oferta de produto após abertura da conta",
        relation: "equivalent",
        matches: {
            "2025": [
                {
                    journey: "abertura",
                    heuristicNumber: "4.1",
                    title: "Após a abertura de conta, até o último dia de coleta, o banco ofereceu algum produto financeiro via notificação push, banners, cards, ou por outra via?",
                },
            ],
            "2026": [
                {
                    journey: "abertura",
                    heuristicNumber: "4.1",
                    title: "Após a abertura de conta, até o último dia de coleta, o banco ofereceu algum produto financeiro via notificação, push, banners, cards, ou por outra via?",
                },
            ],
        },
    },
    {
        canonicalId: "credit_enablement_in_app",
        label: "Habilitação da função crédito no app",
        relation: "equivalent",
        matches: {
            "2025": [
                {
                    journey: "cartao",
                    heuristicNumber: "4.1",
                    title: 'A função "crédito" é de livre escolha do usuário e de fácil habilitação pelo app (sem precisar inserir mais dados)',
                },
            ],
            "2026": [
                {
                    journey: "produtos",
                    heuristicNumber: "4.1",
                    title: 'A função "crédito" é de livre escolha do usuário e de fácil habilitação pelo app (sem precisar inserir mais dados).',
                },
            ],
        },
    },
    {
        canonicalId: "gallery_boleto_attachment",
        label: "Anexar boleto da galeria",
        relation: "equivalent",
        matches: {
            "2025": [
                {
                    journey: "abertura",
                    heuristicNumber: "4.2",
                    title: "O app apresenta, em sua própria interface, uma funcionalidade de anexar boletos que já estão na galeria do aparelho.",
                },
            ],
            "2026": [
                {
                    journey: "seguranca",
                    heuristicNumber: "4.2",
                    title: "O app apresenta, em sua própria interface, uma funcionalidade de anexar boletos que já estão na galeria do aparelho.",
                },
            ],
        },
    },
    {
        canonicalId: "digital_wallet_integration",
        label: "Integração com carteiras digitais",
        relation: "equivalent",
        matches: {
            "2025": [
                {
                    journey: "cartao",
                    heuristicNumber: "4.3",
                    title: "O app apresenta, em sua própria interface, alguma integração com carteiras digitais (Carteira Google, Apple Pay ou Samsung Pay, etc)",
                },
            ],
            "2026": [
                {
                    journey: "produtos",
                    heuristicNumber: "4.3",
                    title: "O app apresenta, em sua própria interface, alguma integração com carteiras digitais (Carteira Google, Apple Pay ou Samsung Pay, etc).",
                },
            ],
        },
    },
    {
        canonicalId: "payment_initiation_itp",
        label: "Iniciador de transações de pagamento (ITP)",
        relation: "renumbered",
        matches: {
            "2025": [
                {
                    journey: "open-finance",
                    heuristicNumber: "4.3",
                    title: "O app possui Iniciador de Transações de Pagamento (ITP)",
                },
            ],
            "2026": [
                {
                    journey: "produtos",
                    heuristicNumber: "4.4",
                    title: "O app possui Iniciador de Transações de Pagamento (ITP).",
                },
            ],
        },
    },
    {
        canonicalId: "open_finance_product_unlock",
        label: "Liberação de produtos após compartilhamento Open Finance",
        relation: "retired_2025",
        matches: {
            "2025": [
                {
                    journey: "open-finance",
                    heuristicNumber: "4.5",
                    title: "O banco oferece a liberação de produtos e serviços após o compartilhamento de dados com outras instituições e realizar movimentações.",
                },
            ],
            "2026": [],
        },
    },
    {
        canonicalId: "post_optin_offers",
        label: "Ofertas após opt-in",
        relation: "equivalent",
        matches: {
            "2025": [
                {
                    journey: "open-finance",
                    heuristicNumber: "4.6",
                    title: "O banco ofereceu produtos e serviços logo após o opt-in.",
                },
            ],
            "2026": [
                {
                    journey: "produtos",
                    heuristicNumber: "4.6",
                    title: "O banco ofereceu produtos e serviços após o opt-in.",
                },
            ],
        },
    },
    {
        canonicalId: "home_insurance_prefill",
        label: "Pré-preenchimento na contratação do seguro residência",
        relation: "new_2026",
        matches: {
            "2025": [],
            "2026": [
                {
                    journey: "produtos",
                    heuristicNumber: "4.7",
                    title: "O processo de contratação do seguro residência não exige que o usuário digite dados anteriormente informados na abertura da conta.",
                },
            ],
        },
    },
    {
        canonicalId: "account_approval_time",
        label: "Tempo de aprovação da conta",
        relation: "equivalent",
        matches: {
            "2025": [
                {
                    journey: "abertura",
                    heuristicNumber: "6.1",
                    title: "Tempo de aprovação da conta.",
                },
            ],
            "2026": [
                {
                    journey: "abertura",
                    heuristicNumber: "6.1",
                    title: "Tempo de aprovação da conta.",
                },
            ],
        },
    },
    {
        canonicalId: "pre_physical_virtual_card",
        label: "Cartão virtual antes do físico",
        relation: "equivalent",
        matches: {
            "2025": [
                {
                    journey: "cartao",
                    heuristicNumber: "6.1",
                    title: "O cartão virtual pode ser ativado antes da chegada do cartão físico.",
                },
            ],
            "2026": [
                {
                    journey: "produtos",
                    heuristicNumber: "6.1",
                    title: "O cartão virtual pode ser ativado antes da chegada do cartão físico.",
                },
            ],
        },
    },
    {
        canonicalId: "app_stability",
        label: "Estabilidade e disponibilidade do app",
        relation: "equivalent",
        matches: {
            "2025": [
                {
                    journey: "gerais",
                    heuristicNumber: "6.1",
                    title: "O app não apresenta falhas de conexão, bugs ou indisponibilidade de alguma funcionalidade.",
                },
            ],
            "2026": [
                {
                    journey: "seguranca",
                    heuristicNumber: "6.1",
                    title: "O app não apresenta falhas de conexão, bugs ou indisponibilidade de alguma funcionalidade.",
                },
            ],
        },
    },
    {
        canonicalId: "invoice_payment_clarity",
        label: "Clareza sobre fatura e pagamento",
        relation: "retired_2025",
        matches: {
            "2025": [
                {
                    journey: "cartao",
                    heuristicNumber: "6.2",
                    title: "O app apresenta informações sobre fatura e pagamento de forma clara.",
                },
            ],
            "2026": [],
        },
    },
    {
        canonicalId: "chatbot_visibility_and_language",
        label: "Chatbot localizável e com linguagem natural",
        relation: "split",
        matches: {
            "2025": [
                {
                    journey: "gerais",
                    heuristicNumber: "7.2",
                    title: "O chatbot é visível, facilmente localizável e começa com linguagem natural.",
                },
            ],
            "2026": [
                {
                    journey: "assistencia",
                    heuristicNumber: "12.3",
                    title: "O chatbot é visível e facilmente localizável.",
                },
                {
                    journey: "assistencia",
                    heuristicNumber: "7.2",
                    title: "O chatbot possui linguagem natural.",
                },
            ],
        },
        notes: "Heurística única em 2025 foi dividida em localização e linguagem natural em 2026.",
    },
    {
        canonicalId: "chatbot_visibility",
        label: "Chatbot facilmente localizável",
        relation: "new_2026",
        matches: {
            "2025": [],
            "2026": [
                {
                    journey: "assistencia",
                    heuristicNumber: "12.3",
                    title: "O chatbot é visível e facilmente localizável.",
                },
            ],
        },
    },
    {
        canonicalId: "chatbot_natural_language",
        label: "Chatbot com linguagem natural",
        relation: "new_2026",
        matches: {
            "2025": [],
            "2026": [
                {
                    journey: "assistencia",
                    heuristicNumber: "7.2",
                    title: "O chatbot possui linguagem natural.",
                },
            ],
        },
    },
    {
        canonicalId: "chatbot_meaningful_answers",
        label: "Respostas significativas do chatbot",
        relation: "equivalent",
        matches: {
            "2025": [
                {
                    journey: "gerais",
                    heuristicNumber: "7.3",
                    title: "O chatbot provê respostas significativas para as perguntas.",
                },
            ],
            "2026": [
                {
                    journey: "assistencia",
                    heuristicNumber: "7.3",
                    title: "O chatbot provê respostas significativas para as perguntas.",
                },
            ],
        },
    },
    {
        canonicalId: "human_chat_support",
        label: "Suporte humano via chat",
        relation: "equivalent",
        matches: {
            "2025": [
                {
                    journey: "gerais",
                    heuristicNumber: "7.4",
                    title: "O suporte humano via chat é rápido e eficaz.",
                },
            ],
            "2026": [
                {
                    journey: "assistencia",
                    heuristicNumber: "7.4",
                    title: "O suporte humano via chat é rápido e eficaz.",
                },
            ],
        },
    },
    {
        canonicalId: "help_center",
        label: "Central de ajuda no app",
        relation: "equivalent",
        matches: {
            "2025": [
                {
                    journey: "gerais",
                    heuristicNumber: "7.5",
                    title: "Existe uma central de ajuda, com ou sem FAQ dentro do app?",
                },
            ],
            "2026": [
                {
                    journey: "assistencia",
                    heuristicNumber: "7.5",
                    title: "Existe uma central de ajuda, com ou sem FAQ dentro do app?",
                },
            ],
        },
    },
    {
        canonicalId: "chatbot_sentiment_analysis",
        label: "Análise de sentimento no chatbot",
        relation: "equivalent",
        matches: {
            "2025": [
                {
                    journey: "gerais",
                    heuristicNumber: "7.7",
                    title: "O bot é capaz de fazer análise de sentimento.",
                },
            ],
            "2026": [
                {
                    journey: "assistencia",
                    heuristicNumber: "7.7",
                    title: "O chatbot é capaz de fazer análise de sentimento.",
                },
            ],
        },
    },
    {
        canonicalId: "general_search_assistance",
        label: "Busca auxilia questões gerais",
        relation: "equivalent",
        matches: {
            "2025": [
                {
                    journey: "gerais",
                    heuristicNumber: "7.8",
                    title: "A busca do app auxilia o correntista em questões gerais.",
                },
            ],
            "2026": [
                {
                    journey: "seguranca",
                    heuristicNumber: "7.8",
                    title: "A busca do app auxilia o correntista em questões gerais.",
                },
            ],
        },
    },
    {
        canonicalId: "typo_tolerant_help_search",
        label: "Busca da ajuda com tolerância a erros",
        relation: "equivalent",
        matches: {
            "2025": [
                {
                    journey: "gerais",
                    heuristicNumber: "7.9",
                    title: "A busca da central de ajuda retorna resultados com erros de digitação.",
                },
            ],
            "2026": [
                {
                    journey: "seguranca",
                    heuristicNumber: "7.9",
                    title: "A busca da central de ajuda retorna resultados com erros de digitação.",
                },
            ],
        },
    },
    {
        canonicalId: "chatbot_contract_questions",
        label: "Chatbot responde perguntas contratuais",
        relation: "equivalent",
        matches: {
            "2025": [
                {
                    journey: "gerais",
                    heuristicNumber: "7.10",
                    title: "O chatbot é capaz de responder perguntas relacionadas ao contrato do cliente.",
                },
            ],
            "2026": [
                {
                    journey: "assistencia",
                    heuristicNumber: "7.10",
                    title: "O chatbot é capaz de responder perguntas relacionadas ao contrato do cliente.",
                },
            ],
        },
    },
    {
        canonicalId: "chatbot_resume_conversation",
        label: "Chatbot retoma conversa interrompida",
        relation: "equivalent",
        matches: {
            "2025": [
                {
                    journey: "gerais",
                    heuristicNumber: "7.11",
                    title: "O chatbot é capaz de retomar uma conversa que foi interrompida pelo usuário.",
                },
            ],
            "2026": [
                {
                    journey: "assistencia",
                    heuristicNumber: "7.11",
                    title: "O chatbot é capaz de retomar uma conversa que foi interrompida pelo usuário.",
                },
            ],
        },
    },
    {
        canonicalId: "document_upload_ease",
        label: "Upload de documentos no cadastro",
        relation: "equivalent",
        matches: {
            "2025": [
                {
                    journey: "abertura",
                    heuristicNumber: "8.1",
                    title: "O upload de documentos durante o cadastro é fácil e com poucas etapas.",
                },
            ],
            "2026": [
                {
                    journey: "abertura",
                    heuristicNumber: "8.1",
                    title: "O upload de documentos durante o cadastro é fácil e com poucas etapas.",
                },
            ],
        },
    },
    {
        canonicalId: "pix_flow_ease",
        label: "Passo a passo do Pix",
        relation: "equivalent",
        matches: {
            "2025": [
                {
                    journey: "abertura",
                    heuristicNumber: "8.3",
                    title: "Passo a passo para uso do PIX é simples e rápido",
                },
            ],
            "2026": [
                {
                    journey: "produtos",
                    heuristicNumber: "8.3",
                    title: "Passo a passo para uso do PIX é simples e rápido.",
                },
            ],
        },
    },
    {
        canonicalId: "account_opening_stays_in_app",
        label: "Abertura de conta totalmente no app",
        relation: "equivalent",
        matches: {
            "2025": [
                {
                    journey: "abertura",
                    heuristicNumber: "10.1",
                    title: "Não há obrigatoriedade de sair para outra plataforma, quando se está criando a conta via app.",
                },
            ],
            "2026": [
                {
                    journey: "abertura",
                    heuristicNumber: "10.1",
                    title: "O processo de abertura de conta pode ser concluído integralmente dentro do aplicativo.",
                },
            ],
        },
    },
    {
        canonicalId: "notification_settings",
        label: "Configuração de notificações do app",
        relation: "retired_2025",
        matches: {
            "2025": [
                {
                    journey: "gerais",
                    heuristicNumber: "10.2",
                    title: "É possível configurar as notificações do app.",
                },
            ],
            "2026": [],
        },
    },
    {
        canonicalId: "device_migration",
        label: "Migração segura para novo dispositivo",
        relation: "equivalent",
        matches: {
            "2025": [
                {
                    journey: "gerais",
                    heuristicNumber: "10.3",
                    title: "A migração do app para um novo dispositivo é segura e com instruções claras.",
                },
            ],
            "2026": [
                {
                    journey: "seguranca",
                    heuristicNumber: "10.3",
                    title: "A migração do app para um novo dispositivo é segura e com instruções claras.",
                },
            ],
        },
    },
    {
        canonicalId: "home_insurance_integrated_in_app",
        label: "Contratação de seguro residência integrada ao app",
        relation: "new_2026",
        matches: {
            "2025": [],
            "2026": [
                {
                    journey: "produtos",
                    heuristicNumber: "10.1",
                    title: "A jornada de contratação do seguro residência está integrada no app.",
                },
            ],
        },
    },
    {
        canonicalId: "pfm_tools",
        label: "Ferramentas de PFM",
        relation: "renumbered",
        matches: {
            "2025": [
                {
                    journey: "abertura",
                    heuristicNumber: "12.1",
                    title: "O app oferece recursos de PFM.",
                },
            ],
            "2026": [
                {
                    journey: "produtos",
                    heuristicNumber: "12.3",
                    title: "O aplicativo oferece informações financeiras personalizadas ou ferramentas de gestão de finanças pessoais para o usuário? (PFM)",
                },
            ],
        },
    },
    {
        canonicalId: "pix_clipboard_detection",
        label: "Sugestão a partir de chave Pix copiada",
        relation: "equivalent",
        matches: {
            "2025": [
                {
                    journey: "gerais",
                    heuristicNumber: "12.1",
                    title: "O app identifica que uma chave pix foi copiada e sugere uma ação correspondente.",
                },
            ],
            "2026": [
                {
                    journey: "produtos",
                    heuristicNumber: "12.1",
                    title: "O app identifica que uma chave pix foi copiada e sugere uma ação correspondente.",
                },
            ],
        },
    },
    {
        canonicalId: "open_finance_balance_display",
        label: "Exibição de saldo de outros bancos",
        relation: "equivalent",
        matches: {
            "2025": [
                {
                    journey: "open-finance",
                    heuristicNumber: "12.2",
                    title: "O app exibe o saldo bancário de outros bancos via Open Finance.",
                },
            ],
            "2026": [
                {
                    journey: "produtos",
                    heuristicNumber: "12.2",
                    title: "O app exibe o saldo bancário de outros bancos via Open Finance.",
                },
            ],
        },
    },
    {
        canonicalId: "home_insurance_findability",
        label: "Localização do seguro residência",
        relation: "new_2026",
        matches: {
            "2025": [],
            "2026": [
                {
                    journey: "produtos",
                    heuristicNumber: "12.4",
                    title: "Seguro residência é facilmente localizável.",
                },
            ],
        },
    },
    {
        canonicalId: "marketplace",
        label: "Marketplace próprio do app",
        relation: "equivalent",
        matches: {
            "2025": [
                {
                    journey: "abertura",
                    heuristicNumber: "14.1",
                    title: "O app possui um Marketplace",
                },
            ],
            "2026": [
                {
                    journey: "acesso",
                    heuristicNumber: "14.1",
                    title: "O app possui um Marketplace.",
                },
            ],
        },
    },
    {
        canonicalId: "temporary_virtual_credit_card",
        label: "Cartão de crédito virtual temporário",
        relation: "renumbered",
        matches: {
            "2025": [
                {
                    journey: "cartao",
                    heuristicNumber: "14.1",
                    title: "A instituição oferece cartão virtual temporário.",
                },
            ],
            "2026": [
                {
                    journey: "produtos",
                    heuristicNumber: "14.3",
                    title: "A instituição oferece cartão de crédito virtual temporário.",
                },
            ],
        },
    },
    {
        canonicalId: "loyalty_program",
        label: "Programa de fidelidade próprio",
        relation: "retired_2025",
        matches: {
            "2025": [
                {
                    journey: "abertura",
                    heuristicNumber: "14.2",
                    title: "O banco oferece algum programa de fidelidade próprio.",
                },
            ],
            "2026": [],
        },
    },
    {
        canonicalId: "expanded_ecosystem",
        label: "Ecossistema expandido além do financeiro",
        relation: "equivalent",
        matches: {
            "2025": [
                {
                    journey: "abertura",
                    heuristicNumber: "14.4",
                    title: "Ecossistema expandido. O app exibe produtos e serviços que vão além do âmbito financeiro.",
                },
            ],
            "2026": [
                {
                    journey: "acesso",
                    heuristicNumber: "14.4",
                    title: "Ecossistema expandido. O app exibe produtos e serviços que vão além do âmbito financeiro.",
                },
            ],
        },
    },
    {
        canonicalId: "open_finance_benefits_communication",
        label: "Comunicação de benefícios atrelados ao Open Finance",
        relation: "new_2026",
        matches: {
            "2025": [],
            "2026": [
                {
                    journey: "produtos",
                    heuristicNumber: "14.5",
                    title: "O banco comunica benefícios aos clientes, atrelados ao Open Finance.",
                },
            ],
        },
    },
    {
        canonicalId: "voice_help_during_selfie",
        label: "Ajuda por voz durante a selfie",
        relation: "equivalent",
        matches: {
            "2025": [
                {
                    journey: "abertura",
                    heuristicNumber: "15.1",
                    title: "É possível obter ajuda em voz, na hora da selfie.",
                },
            ],
            "2026": [
                {
                    journey: "abertura",
                    heuristicNumber: "15.1",
                    title: "É possível obter ajuda por voz, na hora da selfie.",
                },
            ],
        },
    },
    {
        canonicalId: "multiple_accessibility_features",
        label: "Múltiplos recursos de acessibilidade",
        relation: "equivalent",
        matches: {
            "2025": [
                {
                    journey: "gerais",
                    heuristicNumber: "15.1",
                    title: "O app oferece mais de um recurso de acessibilidade.",
                },
            ],
            "2026": [
                {
                    journey: "assistencia",
                    heuristicNumber: "15.1",
                    title: "O app oferece mais de um recurso de acessibilidade.",
                },
            ],
        },
    },
    {
        canonicalId: "pix_ocr",
        label: "OCR para chave Pix impressa ou manuscrita",
        relation: "equivalent",
        matches: {
            "2025": [
                {
                    journey: "abertura",
                    heuristicNumber: "15.2",
                    title: "O app possui OCR para ler uma chave Pix que está impressa ou manuscrita.",
                },
            ],
            "2026": [
                {
                    journey: "produtos",
                    heuristicNumber: "15.2",
                    title: "O app possui OCR para ler uma chave Pix que está impressa ou manuscrita.",
                },
            ],
        },
    },
    {
        canonicalId: "voice_commands",
        label: "Comandos de voz integrados",
        relation: "equivalent",
        matches: {
            "2025": [
                {
                    journey: "gerais",
                    heuristicNumber: "15.2",
                    title: "O app aceita comandos de voz, tanto de forma in-app, como integrado em algum assistente (Google Assistente, Siri, Alexa, etc)",
                },
            ],
            "2026": [
                {
                    journey: "assistencia",
                    heuristicNumber: "15.2",
                    title: "O app aceita comandos de voz, tanto de forma in-app, como integrado em algum assistente (Google Assistente, Siri, Alexa, etc).",
                },
            ],
        },
    },
    {
        canonicalId: "accessibility_scanner",
        label: "Resultado técnico do scanner de acessibilidade",
        relation: "equivalent",
        matches: {
            "2025": [
                {
                    journey: "gerais",
                    heuristicNumber: "15.4",
                    title: "Resultado do scanner de acessibilidade para a Home e a tela do extrato.",
                },
            ],
            "2026": [
                {
                    journey: "assistencia",
                    heuristicNumber: "15.4",
                    title: "Resultado do scanner de acessibilidade para a Home e a tela do extrato.",
                },
            ],
        },
    },
    {
        canonicalId: "chatbot_audio_input",
        label: "Envio de áudio para o chatbot",
        relation: "equivalent",
        matches: {
            "2025": [
                {
                    journey: "gerais",
                    heuristicNumber: "15.5",
                    title: "O chatbot permite enviar áudio e é capaz de compreendê-lo.",
                },
            ],
            "2026": [
                {
                    journey: "assistencia",
                    heuristicNumber: "15.5",
                    title: "O chatbot permite enviar áudio e é capaz de compreendê-lo.",
                },
            ],
        },
    },
    {
        canonicalId: "no_layout_breaks_accessibility",
        label: "Sem quebra de layout com acessibilidade",
        relation: "equivalent",
        matches: {
            "2025": [
                {
                    journey: "gerais",
                    heuristicNumber: "15.7",
                    title: "Não há quebras de layout quando o usuário utiliza recursos de acessibilidade do sistema operacional.",
                },
            ],
            "2026": [
                {
                    journey: "assistencia",
                    heuristicNumber: "15.7",
                    title: "Não há quebras de layout quando o usuário utiliza recursos de acessibilidade do sistema operacional.",
                },
            ],
        },
    },
];

export const finance5CanonicalRegistry: CanonicalHeuristicRegistry = {
    project: "finance5",
    enabled: true,
    canonicalHeuristics: finance5CanonicalHeuristics,
};
