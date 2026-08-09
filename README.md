# Pato Racing Hub

Hub da comunidade **Pato Racing** — organiza os eventos, campeonatos e GPs de
simuladores de corrida da comunidade: calendário, circuitos, resultados e
classificação geral, tudo em um site só.

Primeiro campeonato no ar: **Pato GP de F1 2025**, com 24 etapas passando pelos
24 circuitos do calendário.

## Stack

- [Astro](https://astro.build) — site 100% estático (sem servidor, sem runtime no cliente).
- **Sem banco de dados**: todo o conteúdo (campeonatos, etapas, circuitos, eventos)
  vive em arquivos JSON versionados no repositório, em `src/content/`, validados por
  schema ([Zod](https://zod.dev)) a cada build.
- **Sem painel de admin**: a manutenção de conteúdo é feita editando os JSON
  diretamente (veja o [`CONTENT_GUIDE.md`](./CONTENT_GUIDE.md)).
- Hospedagem gratuita no **GitHub Pages**, publicada automaticamente pelo
  GitHub Actions a cada push na branch principal.

## Rodando localmente

```bash
npm install
npm run dev       # http://localhost:4321/pato-racing/
```

```bash
npm run build     # valida os dados e gera o site estático em dist/
npm run preview   # serve o build de produção localmente
```

## Como o conteúdo é organizado

```
src/content/
  circuitos/circuitos.json        # catálogo com todos os circuitos
  campeonatos/<slug>.json         # um arquivo por campeonato/GP
  etapas/<slug-campeonato>/*.json # um arquivo por etapa do campeonato
  eventos/*.json                  # um arquivo por evento avulso
```

Cadastrar um novo campeonato, lançar as etapas, registrar resultado de uma corrida,
adicionar um evento avulso ou trocar a imagem de um circuito — tudo isso é feito
editando esses arquivos. O passo a passo completo, com todos os campos e convenções,
está no **[CONTENT_GUIDE.md](./CONTENT_GUIDE.md)**.

### Regras de conteúdo/dados

- IDs e slugs em `kebab-case`.
- Datas em ISO 8601 UTC (ex: `2026-08-23T19:00:00Z`).
- Campos de status só aceitam os valores definidos no schema (`src/content.config.ts`).
- Se um JSON estiver com um campo errado ou faltando, **o build falha** — o site
  publicado não é afetado até o problema ser corrigido. O erro aparece na aba
  **Actions** do repositório.

## Como colaborar

1. Crie uma branch a partir da `main`.
2. Faça as alterações (conteúdo em `src/content/`, ou código em `src/`).
3. Rode `npm run build` localmente e confirme que passa sem erros.
4. Abra um Pull Request.

Não é necessário (nem recomendado) commitar direto na `main` sem passar pela
validação do build.

## Deploy

Todo push na branch principal dispara o workflow em
[`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml), que builda o
Astro e publica automaticamente no GitHub Pages. Não há passo manual de deploy.
