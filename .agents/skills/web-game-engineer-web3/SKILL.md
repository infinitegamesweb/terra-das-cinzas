---
name: web-game-engineer-web3
description: Build, review, and improve browser games and their online systems, including Canvas rendering, frontend architecture, persistence, authentication, multiplayer boundaries, and carefully scoped Web3 integration.
---

# Engenharia de game web e Web3

Aplique esta skill ao alterar ou revisar a arquitetura, gameplay, interface funcional, persistência, rede ou integração de carteira do jogo.

## Contexto de Terra das Cinzas

- Aplicação browser-first: HTML/CSS em `public/`, módulos em `src/`, dados em `src/data/`, imagens servidas em `public/assets/` e build em `tools/build-pages.mjs`.
- O build usa esbuild com entrada `src/game.js`, copia `public/` para `dist/` e injeta configuração pública do Supabase. `dist/` é artefato gerado; não edite sua saída manualmente.
- Existem `AuthManager.js` e integração Supabase/Web3 (SIWE) documentadas. Isso não torna combate, inventário ou economia autoritativos no servidor. Confirme o estado e a configuração antes de descrever uma função como operacional.
- `src/game.js` concentra muito comportamento. Respeite invariantes e extraia módulos com mudanças pequenas e justificadas, em vez de uma reescrita ampla.
- O jogo deve permanecer utilizável em modo solo/local quando serviços remotos não estão configurados ou estão indisponíveis.

## Método de engenharia

1. Rastreie o fluxo real entre markup, eventos, módulos, estado, renderização e salvamento antes de modificar comportamento. Consulte `PLANO_DO_JOGO.md`, mas resolva divergências com o código.
2. Defina o comportamento observável e os estados de sucesso, falha, desconexão, recarga e save antigo. Preserve migrações e compatibilidade com saves existentes.
3. Mantenha atualização/renderização previsíveis: delta de tempo limitado, ciclo de vida de listeners e recursos, colisão determinística, validação de entrada, controles acessíveis e tratamento de erros de carregamento.
4. Para mudanças de UI, conecte semântica HTML, teclado/foco, estados vazios e carregando, viewport pequeno e feedback de ação; não dependa apenas do canvas para informação essencial.
5. Para serviços, verifique o SDK/API e a configuração atual antes de integrar. Mantenha segredos no servidor; chaves públicas client-side não são segredos. Falha de autenticação/rede deve preservar o modo local.
6. Em recursos online, torne o servidor autoridade sobre identidade, progresso, inventário, recompensas e aleatoriedade. Cliente autenticado e save remoto, por si só, não impedem adulteração.
7. Só proponha blockchain quando houver necessidade concreta de propriedade/verificação entre partes independentes. Antes de integrar, explicite custódia, taxas, recuperação, privacidade, experiência sem carteira, segurança do contrato e efeito na economia. Nunca prometa ganho financeiro ou segurança não demonstrada.
8. Faça alteração pequena e revisável, rode o build existente quando o escopo pedir validação, verifique o fluxo afetado e comunique limitações do ambiente remoto.

## Qualidade e segurança

- Não exponha service-role keys, chaves privadas, tokens de API, seeds ou credenciais em código, logs ou bundles.
- Valide saves e ações no limite apropriado; trate saves locais como dados não confiáveis.
- Evite timers/listeners duplicados, estado global incoerente, operações de rede não tratadas e loops de jogo que acumulam erro de frame.
- Não apresente botões, rótulos ou interfaces como multiplayer/mercado ativo sem implementação funcional correspondente.
- Mantenha integração Web3 opcional; nenhuma ação de carteira ou transação deve ser iniciada sem pedido explícito e entendimento do custo/efeito.

## Ferramentas e fontes

Use o build do projeto (`npm run build`) para validar empacotamento. Prefira documentação oficial atual para APIs externas e bibliotecas que possam ter mudado. Leia `STATUS_CONTA_SAVE_NUVEM.md`, `CLOUDFLARE.md` e a migração do Supabase ao trabalhar nessas integrações; confirme que esses documentos correspondem ao código antes de confiar neles.
