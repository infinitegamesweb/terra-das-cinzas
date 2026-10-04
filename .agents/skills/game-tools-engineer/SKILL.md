---
name: game-tools-engineer
description: Design, maintain, and validate pipelines and utilities for game assets, spritesheets, tile maps, atlases, builds, and browser-game content processing.
---

# Engenharia de ferramentas para games

Aplique esta skill ao criar ou manter ferramentas de importação, inspeção, transformação, validação e empacotamento usadas pelo jogo.

## Contexto do projeto

- Ferramentas existentes ficam em `tools/` e usam Node.js e Python; os dados de jogo ficam em `src/data/`; conteúdo servido fica em `public/assets/`.
- Há scripts de geração, extração, corte, composição e empacotamento. Inspecione entradas/saídas e documentação antes de reusar um script: alguns são patches pontuais, protótipos ou dependem de bibliotecas externas.
- `tools/build-pages.mjs` é o pipeline oficial: entrada `src/game.js`, assets copiados de `public/` e saída derivada em `dist/`.
- Leia `GUIA_DE_ASSETS.md` como referência, mas confirme convenções em loaders atuais, pois o guia contém caminhos legados.

## Método

1. Identifique o formato fonte, licença/proveniência, consumidores e saída necessária. Mapeie o caminho completo até o carregador antes de alterar ou gerar arquivos.
2. Prefira uma ferramenta reproduzível e não destrutiva: entradas e saídas explícitas, modo de pré-visualização quando útil, relatórios claros e opção de sobrescrita deliberada.
3. Para spritesheets e atlas, valide dimensões, grade, alpha, nomes de ação/direção, pivôs, metadados e consistência dos quadros. Não assuma grade uniforme se o formato aceitar recortes por frame.
4. Para mapas TMX/tiles, preserve IDs, tilesets, escala, colisões, camadas e coordenadas. Reporte referências ausentes e dados que não puder preservar.
5. Para assets web, limite tamanho e dimensões, evite duplicatas e preview desnecessário no pacote publicado; respeite pixel art sem interpolação suavizada.
6. Proteja dados externos: nunca imprima conteúdo de `.env`, tokens ou URLs assinadas. Leia apenas presença/nome de configuração quando isso bastar.
7. Gere em staging ou pasta de preview, inspecione visualmente e só então integre em `public/assets/`. Não faça limpeza recursiva nem substituições em lote sem confirmar cada destino e uso.
8. Após integração, confira os caminhos referenciados, build e preview pertinente. Registre comando, parâmetros e origem para que o resultado possa ser repetido.

## APIs e geração

Escolha a API pela saída desejada, não por quantidade de serviços. Use Spriterrific para personagens e animações quando adequado, seguindo sua skill local e verificando saldo/custo antes de enfileirar. Use geração/edição de imagem para conceitos ou raster quando disponível. Use Cloudflare/Supabase apenas para operações relevantes ao jogo e com documentação/configuração apropriadas. Não invente endpoints nem trate ferramentas de preview como API de produção. Não envie conteúdo privado para serviço externo sem necessidade clara.

## Critérios de qualidade

- Pipeline reproduzível a partir de fontes identificáveis, sem editar manualmente arquivos gerados.
- Erros aparecem com arquivo, objeto/linha ou ação necessária, em vez de falha silenciosa.
- Asset processado mantém alinhamento, alpha, nomes e metadados esperados pelos consumidores.
- Saída web só inclui recursos usados e tem tamanho razoável.
- Execução repetida não corrompe origem nem cria cópias crescentes sem controle.
