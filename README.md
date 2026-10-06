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

## Liberar novos materiais

No `index.html`, em `baseCats(bu)`, cada item tem `available` e `doc`/`url`. Para liberar um report ou plano de mídia, basta marcar `available:true` e apontar `doc:'arquivo.html'` (abre no visualizador) ou `url:'https://...'` (abre em nova aba), e subir o arquivo junto.
