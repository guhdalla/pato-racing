# CLAUDE.md

Este arquivo fornece orientações para o Claude Code (claude.ai/code) ao trabalhar com código neste repositório.

## O que é isso

Pato Racing Hub — um site 100% estático em Astro para uma comunidade de simuladores de corrida (Pato Racing). Ele publica calendários, campeonatos, etapas de fim de semana de corrida, circuitos e eventos avulsos. **Não há banco de dados nem painel de admin**: todo o conteúdo vive como arquivos JSON em `src/content/`, validados por schemas Zod em tempo de build, e é publicado via GitHub Actions no GitHub Pages. O conteúdo e os textos do site estão em português (pt-BR).

## Comandos

```bash
npm install
npm run dev       # servidor de dev local em http://localhost:4321/pato-racing/
npm run build     # astro check (typecheck) + astro build — valida todo o JSON de conteúdo contra os schemas
npm run preview   # serve o build de produção localmente
```

Não há suíte de testes nem script de lint. `npm run build` é o gate de validação — sempre rode antes de considerar uma mudança de conteúdo ou código concluída, já que um campo JSON errado derruba o build inteiro (apontando o arquivo/campo exato no erro) em vez de falhar silenciosamente.

Não existe um comando de validação para um único arquivo/coleção — `astro check && astro build` valida tudo de uma vez, sempre.

## Arquitetura

**Modelo de conteúdo** (`src/content.config.ts` define quatro coleções, todas validadas por Zod):
- `circuitos` — um único arquivo JSON em array (`src/content/circuitos/circuitos.json`) com o catálogo de todos os circuitos.
- `campeonatos` — um arquivo por campeonato (`src/content/campeonatos/<slug>.json`); o nome do arquivo vira o slug da URL.
- `etapas` — um arquivo por etapa/fim de semana de corrida, em `src/content/etapas/<slug-campeonato>/*.json`. Cada etapa referencia seu campeonato via `campeonatoId` (precisa bater com o slug do campeonato) e um `circuitoId` (precisa existir em `circuitos.json`). O nome do arquivo em si é só organizacional — a URL usa o campo `rodada` (número da etapa).
- `eventos` — um arquivo por evento avulso (`src/content/eventos/*.json`).

**A classificação geral é sempre derivada, nunca armazenada.** `src/lib/standings.ts` calcula a classificação de pilotos/equipes em tempo de build, agregando o campo `pontos` de `resultadoCorrida` de todas as `etapas` com `status: 'concluida'` de um dado campeonato. Não existe um arquivo separado de classificação — para corrigir uma classificação, corrija o resultado da etapa correspondente, não um arquivo-resumo.

**As rotas seguem a hierarquia de conteúdo**:
- `/campeonatos/[slug]/` — visão geral de um campeonato + calendário + classificação derivada (`src/pages/campeonatos/[slug]/index.astro`).
- `/campeonatos/[slug]/[rodada]/` — cronograma/resultado de uma etapa (`src/pages/campeonatos/[slug]/[rodada].astro`). Os params são `campeonatoId` (slug) + `rodada` (número), não o nome do arquivo da etapa.
- `/circuitos/[id]/`, `/eventos/[slug]/` seguem o mesmo padrão de `getStaticPaths` + `getCollection`.

**As imagens de circuito são baseadas no sistema de arquivos, não em campos do schema.** `src/lib/circuitImages.ts` procura por `public/images/circuitos/<circuitoId>/capa.{jpg,jpeg,png,webp,avif}` e `tracado.<ext>` em tempo de build; se não existir, `CircuitImage.astro` renderiza um placeholder com bandeira + nome. Não há campo `imagem` no schema de circuito — a presença do arquivo *é* a fonte da verdade.

**Astro Content Layer API**: as coleções usam `loader: file(...)` para o catálogo único de `circuitos` e `loader: glob(...)` para as coleções `campeonatos`/`etapas`/`eventos` (uma entrada por arquivo) — é o content config do Astro 5, não o padrão legado de `src/content/config.ts` com frontmatter.

**Base path**: o site é servido a partir de um subcaminho (`base: '/pato-racing/'` em `astro.config.mjs`, `site: 'https://guhdalla.github.io'`). Links internos precisam passar por `import.meta.env.BASE_URL`, não por caminhos absolutos fixos — veja o padrão em `Layout.astro` e nas páginas (`` `${base}campeonatos/${...}/` ``). O `base` no config **precisa terminar com `/`**: `import.meta.env.BASE_URL` reflete esse valor exatamente como está escrito, e todo template do site concatena `${base}` diretamente com o resto do caminho (sem inserir separador). Se `base` não tiver a barra final, todo link do site quebra colado (ex: `pato-racingcampeonatos` em vez de `pato-racing/campeonatos`) — foi exatamente esse bug que ocorreu quando o `base` estava configurado como `'/pato-racing'`. Além disso, cada link individual também deve terminar com `/` (`.../campeonatos/`, não `.../campeonatos`), já que as rotas do Astro geram `index.html` dentro de cada pasta.

**Estilização**: sem framework de CSS. Os design tokens (cores, espaçamento, fontes) vivem em `src/styles/tokens.css` como custom properties (`--pr-*`), importadas uma vez em `Layout.astro`. Componentes usam blocos `<style>` com escopo nos arquivos `.astro`, além de classes utilitárias compartilhadas (`pr-container`, `pr-card`, `pr-table`, `pr-badge`, etc.) definidas em tokens.css/estilos globais. As bandeiras de país vêm do pacote `flag-icons` (classes `fi fi-<iso2-minúsculo>`), usando o `paisCodigo` de cada circuito.

## Convenções de edição de conteúdo

Referência completa campo a campo: **[CONTENT_GUIDE.md](./CONTENT_GUIDE.md)**. Principais regras impostas pelos schemas Zod em `src/content.config.ts`:

- IDs e slugs: `kebab-case`. O nome do arquivo de um campeonato (sem `.json`) é seu slug/id; outros conteúdos o referenciam por esse id.
- Datas: ISO 8601 UTC (ex: `"2026-08-23T19:00:00Z"`), parseadas com `z.coerce.date()`.
- Campos de status só aceitam os valores de enum exatos definidos em `content.config.ts` (ex: `status` de etapa: `agendada` | `concluida` | `cancelada`; `status` de campeonato: `agendado` | `em-andamento` | `finalizado`) — qualquer outro valor derruba o build.
- A entrada `tipo: 'corrida'` dentro do array `sessoes` é tratada como a data canônica da etapa em todo o site (usada para ordenação/exibição no calendário).
- Para registrar um resultado: mude o `status` da etapa para `concluida` e preencha `resultadoCorrida`/`resultadoClassificacao`; o valor de `pontos` em cada item de `resultadoCorrida` precisa bater com o `sistemaPontuacao`/`pontosSprint` do próprio campeonato (os pontos não são recalculados a partir da posição — são armazenados por resultado e depois somados).

## Deploy

Um push na `main` dispara `.github/workflows/deploy.yml`: `npm ci` → `npm run build` → publica `dist/` no GitHub Pages. Não há passo de deploy manual. Mudanças devem passar por branch + PR (conforme o README), rodando `npm run build` localmente antes, já que um schema quebrado falha a Action em vez de afetar o site no ar.
