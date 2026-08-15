# Guia de conteúdo — Pato Racing Hub

Este site não tem painel de admin. Todo o "banco de dados" é feito de arquivos JSON
versionados no repositório, dentro de `src/content/`. Para cadastrar ou atualizar
qualquer coisa, você edita esses arquivos (pelo GitHub.com ou localmente) e dá push —
o GitHub Actions builda e publica o site automaticamente.

Se algum arquivo tiver um campo errado ou faltando, **o build falha** e o site publicado
não muda — então não tem risco de "quebrar" o site no ar por um JSON malformado. O erro
aparece na aba **Actions** do repositório, apontando o arquivo e o campo com problema.

## Estrutura

```
src/content/
  circuitos/circuitos.json        # catálogo único com todos os circuitos
  campeonatos/<slug>.json         # um arquivo por campeonato/GP
  etapas/<slug-campeonato>/*.json # um arquivo por etapa do campeonato
  eventos/*.json                  # um arquivo por evento avulso
```

## Convenções gerais

- **IDs e slugs**: sempre em `kebab-case` (minúsculo, sem acento, palavras separadas por hífen). O nome do arquivo (sem `.json`) vira o slug usado na URL.
- **Datas**: sempre em ISO 8601 com horário UTC, ex: `"2026-08-23T19:00:00Z"`.
- **Campos de status** só aceitam os valores listados abaixo — qualquer outro valor quebra o build.

## Como cadastrar um novo campeonato/GP

1. Crie `src/content/campeonatos/<slug>.json`.
2. Preencha os campos:
   - `titulo`, `jogo` (ex: `"F1 25"`), `temporada` (número)
   - `status`: `"agendado"` | `"em-andamento"` | `"finalizado"`
   - `descricao`
   - `sistemaPontuacao`: lista de `{ "posicao": N, "pontos": N }`
   - `pontosVoltaMaisRapida` (número, pode ser `0`)
   - opcionais: `regulamentoTexto`, `regulamentoUrl`, `pontosSprint`, `bannerImagem`, `discordUrl`
   - `dataInicio` e `dataFim` (ISO 8601)
3. Crie a pasta `src/content/etapas/<slug>/` para as etapas (próximo passo).

Use `src/content/campeonatos/pato-gp-f1-2025.json` como exemplo pronto.

## Como cadastrar as etapas de um campeonato

Para cada etapa, crie um arquivo em `src/content/etapas/<slug-campeonato>/NN-circuito.json`
(o nome do arquivo é só organização, não afeta a URL — a URL usa o campo `rodada`).

Campos obrigatórios:
- `campeonatoId`: precisa ser exatamente igual ao slug do arquivo do campeonato.
- `rodada`: número da etapa (1, 2, 3…).
- `circuitoId`: precisa existir em `circuitos.json`.
- `formatoFimDeSemana`: `"normal"` ou `"sprint"`.
- `status`: `"agendada"` | `"concluida"` | `"cancelada"`.
- `sessoes`: lista de `{ "tipo": "...", "dataHora": "..." }`. Tipos possíveis: `treino-livre-1`,
  `treino-livre-2`, `treino-livre-3`, `classificacao-sprint`, `sprint`, `classificacao`, `corrida`.
  A sessão `corrida` é a que aparece como data principal da etapa em todo o site.

## Como registrar o resultado de uma corrida já disputada

1. Abra o arquivo da etapa correspondente.
2. Mude `status` para `"concluida"`.
3. Preencha (todos opcionais, adicione o que tiver):
   - `resultadoClassificacao`: lista de `{ posicao, piloto, equipe, tempo }`
   - `resultadoCorrida`: lista de `{ posicao, piloto, equipe, pontos, voltaMaisRapida, status }`
     — o campo `pontos` é o que alimenta a **classificação geral automática** do campeonato,
     preencha com o valor já definido conforme `sistemaPontuacao`/`pontosSprint` do campeonato.
   - `poleposition`, `voltaMaisRapida`, `podio` (lista com até 3 nomes), `linkTransmissao`, `linkReplay`, `observacoes`
   - `punicoes`: lista de incidentes/punições da corrida, cada item com
     `{ tempo, volta, piloto, equipe, incidente, punicao }` (`tempo` e `volta` são opcionais).
     Renderizada como tabela na página da etapa, junto com o resultado da corrida.
   - `linkReplay`: caminho relativo do arquivo de replay do jogo (`.frr` no F1 25) dentro de `public/`,
     ex: `"replays/<slug-campeonato>/NN-circuito.frr"`. Coloque o arquivo em
     `public/replays/<slug-campeonato>/NN-circuito.frr` — a página só oferece um link de download
     (não existe player de `.frr` no navegador; é preciso abrir o replay dentro do próprio jogo).
4. Dê commit/push. A classificação geral de pilotos e equipes é recalculada automaticamente
   no próximo build — não precisa editar nenhum outro arquivo.

**Formato do campo `voltaMaisRapida`**: escreva sempre como `"Piloto (tempo)"`, ex.:
`"Paulo Henrique (1:20.468)"`. Esse formato é parseado em tempo de build
(`src/lib/circuitRecords.ts`) para calcular o "Pato Racer mais rápido da pista" de cada
circuito — a mais rápida entre todas as etapas já concluídas ali, em qualquer campeonato.
Um formato diferente faz esse recorde da comunidade ser ignorado silenciosamente para
aquela etapa (não quebra o build, só não conta pro cálculo).

## Como cadastrar um evento avulso

Crie `src/content/eventos/<slug>.json` com:
`titulo`, `tipo`, `data` (ISO 8601), `descricao`, e opcionalmente `imagem`, `linkInscricao`.

## Como adicionar ou editar um circuito

Edite `src/content/circuitos/circuitos.json` (é um array — adicione um novo objeto ou
edite um existente). Campos: `id`, `nome`, `pais`, `paisCodigo` (código ISO de 2 letras,
ex: `"BR"`, usado para mostrar a bandeira), `cidade`, `comprimentoKm`, `numeroVoltasPadrao`,
`numeroCurvas`, `sentido` (`"horario"` ou `"anti-horario"`), `primeiroGp` (ano), e
opcionalmente `recordeVolta` (`{ tempo, piloto, ano }`) e `curiosidades`.

## Como adicionar as imagens de um circuito

Não é obrigatório — sem imagem, o site mostra automaticamente um placeholder com a
bandeira do país e o nome do circuito. Para usar uma imagem real, adicione o arquivo em:

```
public/images/circuitos/<id-do-circuito>/capa.jpg      # foto de capa
public/images/circuitos/<id-do-circuito>/tracado.png   # mapa do traçado
```

Extensões aceitas: `jpg`, `jpeg`, `png`, `webp`, `avif`. O `<id-do-circuito>` é o campo
`id` do circuito em `circuitos.json`.

## Testando antes de publicar

Rode localmente antes de dar push, para pegar qualquer erro de schema antes do GitHub Actions:

```bash
npm install
npm run build
```

Se o build passar sem erros, pode dar push com confiança.
