# Terra das Cinzas

RPG de aventura 2D em HTML, CSS e JavaScript, publicado como site estático no Cloudflare Pages.

## Cloudflare Pages

- Branch de produção: `main`
- Comando de build: `npm run build`
- Diretório de saída: `dist`
- Diretório raiz: `/` (raiz do repositório)

O build copia `index.html`, `styles.css`, `_headers`, `js/` e `assets/` para `dist/`. O arquivo `_headers` desativa permissões de câmera e microfone, que o jogo não usa.

Para gerar os arquivos localmente, execute `npm run build`. Para pré-visualizar com o runtime local do Cloudflare Pages, execute `npm run dev:pages` e abra `http://localhost:4173`.

Segredos e variáveis locais ficam fora do Git (`.secrets/`, `.env*` e `.dev.vars*`). A chave Supabase `anon` em `js/cloud-config.js` é pública e pode ser incluída no cliente; nunca publique `service_role`, senhas de banco ou segredos OAuth.

Consulte [CLOUDFLARE.md](CLOUDFLARE.md) para configurar Supabase Auth, SIWE, políticas de segurança e saves na nuvem.

Para adicionar ou alterar artes, consulte [GUIA_DE_ASSETS.md](GUIA_DE_ASSETS.md), que explica a estrutura de `assets/`, os carregadores e os formatos esperados pelo jogo.
