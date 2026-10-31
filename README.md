# Central Parques · quatro sete oito

Portal do cliente (Animália Park e Aquário de São Paulo). Site estático: sem build, sem dependências — basta publicar os arquivos.

## Arquivos

| Arquivo | Função |
|---|---|
| `index.html` | A Central completa: login, seleção de BU, categorias, visualizador. **O nome precisa ser exatamente `index.html`.** |
| `enxoval-meta-animalia.html` | Start → Enxoval de Assets Meta Ads · Animália Park |
| `enxoval-google-animalia.html` | Start → Enxoval de Assets Google Ads · Animália Park |
| `enxoval-meta-aquario.html` | Start → Enxoval de Assets Meta Ads · Aquário de São Paulo |
| `enxoval-google-aquario.html` | Start → Enxoval de Assets Google Ads · Aquário de São Paulo |
| `parceria-google/` | Parceria Google: Central de gestão das recomendações do Google (index.html), apresentação de 27/10 em PDF, planilha original e imagens das páginas. Aberta pela categoria "Parceria Google" da Central. Status, decisões, evidências (inclusive capturas de tela), histórico e autor de cada alteração ficam no Supabase e são iguais para toda a equipe (ver abaixo). |
| `instalar.html` | Guia "Salvar na tela de início" (iOS e Android), linkado no login e no rodapé |
| `favicon.ico`, `favicon-32.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `manifest.webmanifest` | Favicon e ícones de tela de início (precisam ficar na raiz, ao lado do `index.html`) |
| `assets/` | Logos em PNG com fundo transparente (referência; já estão embutidos nos HTMLs) |

Os materiais abrem dentro da Central (visualizador interno) e também funcionam sozinhos, em nova aba.

## Publicar / atualizar (GitHub → Vercel)

1. Suba **todos os arquivos desta pasta** para a raiz do repositório (branch `main`).
2. Na Vercel, importe o repositório como projeto estático (framework: *Other*, sem build command, output = raiz).
3. Cada push na `main` publica automaticamente.

Para atualizar: substitua os arquivos alterados pelo conteúdo do novo zip e faça o push. Nunca renomeie o `index.html`.

## Acesso

- Usuário: qualquer nome · Senha: `Parques#2026#` (validação no navegador — não é segurança forte, só controle de acesso simples).

## Parceria Google · banco compartilhado (Supabase)

- Projeto Supabase `central-parques` (organização 478, plano free, região São Paulo).
- Conexão em `parceria-google/supabase-store.js` (URL do projeto + chave publicável, que pode ficar no front-end).
- Tabelas: `pg_acompanhamento` (status e decisão por ação e parque), `pg_historico` (só inclusão, nada é editado ou apagado), `pg_evidencias`, `pg_materiais`, `pg_recs_custom` (ações cadastradas pela equipe) e `pg_pessoas` (autores).
- Arquivos de evidência no bucket `parceria-google` do Storage (imagens, PDF, CSV e texto, até 20 MB).
- Nada é apagado pela Central: evidências e materiais removidos ficam marcados como removidos/arquivados.
- Autor: o nome digitado no login da Central é usado como autor. Se a Parceria Google for aberta direto, ela pede o nome antes. "trocar" no topo muda o nome.
- Plano free: o Supabase pausa o projeto após 7 dias sem nenhum acesso; basta reativar no painel.

## Liberar novos materiais

No `index.html`, em `baseCats(bu)`, cada item tem `available` e `doc`/`url`. Para liberar um report ou plano de mídia, basta marcar `available:true` e apontar `doc:'arquivo.html'` (abre no visualizador) ou `url:'https://...'` (abre em nova aba), e subir o arquivo junto.

## Visual

Tema claro da 478 (referência: material "Engenharia de Demanda 478"): fundos claros, cards brancos com cantos arredondados, Poppins nos títulos e DM Sans nos textos, azul #0c25a3 como cor principal e verde #0dea9b nos marcadores. As regras ficam no bloco "Tema claro 478" no fim do CSS de cada página.

Na Parceria Google, Próximas ações é um Kanban: colunas Pendente → Em análise → Em produção → Em aplicação → Concluído, faixas por prioridade, cards arrastáveis.
