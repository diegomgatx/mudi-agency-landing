## Objetivo rápido

Este repositório é uma landing page estática chamada "MuDi Agency". A maior parte da lógica visual está em `script.js` usando Three.js para várias cenas 3D, GSAP + ScrollTrigger para animações, e manipulação direta do DOM em `index.html`. Use este ficheiro para priorizar mudanças que preservem a performance do canvas e as convenções existentes.

## Arquitetura — visão geral

- `index.html` — marcação estática com seções claras: `#hero`, `#about`, `#team`, `#services`, `#portfolio`, `#contact` e um formulário `#contact-form`.
- `script.js` — único ponto central de comportamento: inicializa carregamento, animações GSAP, interatividade e diversas cenas Three.js. Padrão: cada seção com 3D tem um `<canvas id>` (ex: `hero-canvas`, `about-canvas`, `team-canvas`, `contact-canvas`), e coleções com `class="service-canvas" data-service="..."` e `class="portfolio-canvas" data-project="..."`.
- `styles.css` — estilos visuais e classes que o JS pressupõe (`.loading-screen`, `.custom-cursor`, `.nav-links`, `.service-card`, `.portfolio-item`, etc.).

Por que: o projeto é uma página estática otimizada para UX visual; mudanças devem evitar quebras visuais entre HTML/CSS/JS.

## Convenções e padrões específicos

- Centralização: `script.js` usa objetos globais (ex: `scenes`, `renderers`, `cameras`, `meshes`) para mapear cenas por chave. Ao adicionar/remover uma cena, atualize todos esses objetos consistentemente.
- Canvas por seção: cada canvas é esperado existir com id/class específica. Exemplo: `document.getElementById('hero-canvas')` e `document.querySelectorAll('.service-canvas')`.
- Data-attributes: `data-service` e `data-project` determinam geometria/visual dos canvases de serviço/portfólio — preferir esse padrão ao adicionar novos itens.
- Animações: GSAP + ScrollTrigger são usados amplamente; para efeitos de entrada e scroll-based animations, adicione seletores compatíveis com a estrutura existente (ex: `.section-title`, `.service-card`).
- Formulário de contato: `#contact-form` é tratado localmente (simulação). Não há backend — se integrar envio real, preserve o UX atual (botão desabilitado, texto temporário) ou adapte o mesmo fluxo.

## Fluxos de desenvolvimento comuns

- Abrir localmente: arquivo é estático — abra `index.html` no navegador (não há build). Recomendo usar uma extensão/local server para testar (Live Server) para evitar restrições de CORS ao carregar assets se necessário.
- Testes rápidos: validar visual manualmente no Chrome/Firefox; inspecionar console para erros de WebGL/Three.js (ex: canvas não encontrado ou gl context falhando).
- Otimização: reduzir número de objetos Three.js ou limitar pixelRatio para dispositivos móveis (o código já usa `Math.min(window.devicePixelRatio, 2)`).

## Pontos importantes para PRs e mudanças de código

- Ao alterar `script.js` mantenha a inicialização dentro de `DOMContentLoaded` e preserve funções de inicialização: `initLoadingScreen`, `initializeAll`, `setupAnimations`, `setupInteractivity`.
- Evite criar múltiplos render loops conflitantes por canvas sem gerenciar `requestAnimationFrame` por cena; o padrão atual cria um loop por cena — ao unificá-los, atualize o resize handler e o gerenciamento de renderers.
- Se criar novos canvases, siga o mesmo padrão: adicionar `id`/`class`, inicializar cena com câmera, renderer, adicionar à `scenes/renderers/cameras/meshes` e criar animação local.
- Para adicionar novos serviços/portfolio items, use `data-service` ou `data-project` e implemente o branch correspondente em `initServiceScenes`/`initPortfolioScenes`.

## Exemplos extraídos do código

- Hero: `const canvas = document.getElementById('hero-canvas')` → cria geometria (Icosahedron/Octahedron/Tetrahedron) e guarda em `meshes.hero`.
- Services: `document.querySelectorAll('.service-canvas')` → usa `canvas.dataset.service` para escolher entre 'web', 'ai', '3d' e construir geometria correspondente.
- Contact form: `document.getElementById('contact-form')` → coleta `FormData`, simula envio e manipula o botão (`Enviando...`, `Mensagem Enviada!`).

## Erros e armadilhas comuns (detected patterns)

- Canvas nulo: muitas funções retornam cedo se `getElementById` falhar — garantir que a marcação HTML contenha o canvas com o id/categoria correta.
- Performance: muitos loops de animação independentes podem sobrecarregar dispositivos. Se receber bug reports de performance, busque consolidar loops ou pausar cenas não-visíveis.
- Mobile menu: `nav-menu` não existe no HTML (nav usa `.nav-links`); código de toggle procura `.nav-menu` — se implementar menu móvel, alinhar nomes ou ajustar o código.

## Tarefas de alto valor que um agente AI pode executar aqui

- Corrigir bug do menu móvel: alinhar seletor `.nav-menu` com a estrutura atual ou criar o elemento esperado.
- Modularizar `script.js`: separar inicialização de Three.js e GSAP em arquivos menores (ex: `three-scenes.js`, `animations.js`) mantendo a mesma API de inicialização.
- Adicionar flag de performance/mobile que limite número de partículas/meshes e pixelRatio.

## Como revisar um PR (checklist rápido)

1. Marcup/JS sync: para cada canvas criado no HTML, existe inicialização correspondente no `script.js`? (IDs/classes/data-service/data-project)
2. Não introduzir regressões no fluxo de carregamento (`initLoadingScreen`).
3. Console limpo de erros WebGL/Uncaught (especialmente null refs a canvases).
4. Manter UX do formulário de contato ou documentar claramente a mudança para um envio real.

Se algo no repositório estiver incompleto ou você quiser que eu detalhe trechos do `script.js` para refatoração, diga qual parte prefere (ex: consolidar loops, adicionar teste de smoke para canvases, corrigir menu móvel).

---
Por favor revise estas instruções e diga se quer que eu incorpore exemplos de código ou crie PRs automáticos para correções (ex: consertar `.nav-menu` ou adicionar verificação de `canvas` antes de usar `clientWidth`).
