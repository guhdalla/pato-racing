import type { CollectionEntry } from 'astro:content';

type Campeonato = CollectionEntry<'campeonatos'>['data'];

export interface PilotoStanding {
  piloto: string;
  equipe?: string;
  categoria?: string;
  pontos: number;
  vitorias: number;
  podios: number;
}

export interface EquipeStanding {
  equipe: string;
  categoria?: string;
  pontos: number;
  vitorias: number;
}

/**
 * Classificação geral de pilotos, calculada em tempo de build somando o campo
 * `pontos` de `resultadoCorrida` de todas as etapas `concluida` do campeonato.
 * Fonte única de verdade: o resultado de cada etapa (nada é armazenado em duplicidade).
 */
export function calcularClassificacaoPilotos(
  etapas: CollectionEntry<'etapas'>[],
  campeonato?: Campeonato
): PilotoStanding[] {
  const porPiloto = new Map<string, PilotoStanding>();
  const categoriaPorEquipe = new Map(
    (campeonato?.equipes ?? []).map((e) => [e.nome, e.categoria])
  );

  // Pilotos inscritos aparecem na tabela com 0 pontos antes da primeira corrida.
  for (const inscrito of campeonato?.pilotos ?? []) {
    porPiloto.set(inscrito.nome, {
      piloto: inscrito.nome,
      equipe: inscrito.equipe,
      categoria: categoriaPorEquipe.get(inscrito.equipe),
      pontos: 0,
      vitorias: 0,
      podios: 0,
    });
  }

  for (const etapa of etapas) {
    if (etapa.data.status !== 'concluida' || !etapa.data.resultadoCorrida) continue;

    for (const resultado of etapa.data.resultadoCorrida) {
      const atual = porPiloto.get(resultado.piloto) ?? {
        piloto: resultado.piloto,
        equipe: resultado.equipe,
        pontos: 0,
        vitorias: 0,
        podios: 0,
      };
      atual.pontos += resultado.pontos;
      atual.equipe = resultado.equipe ?? atual.equipe;
      atual.categoria = categoriaPorEquipe.get(atual.equipe ?? '') ?? atual.categoria;
      if (resultado.posicao === 1) atual.vitorias += 1;
      if (resultado.posicao <= 3) atual.podios += 1;
      porPiloto.set(resultado.piloto, atual);
    }
  }

  return [...porPiloto.values()].sort(
    (a, b) => b.pontos - a.pontos || b.vitorias - a.vitorias
  );
}

/** Classificação geral de equipes, mesma lógica de agregação da classificação de pilotos. */
export function calcularClassificacaoEquipes(
  etapas: CollectionEntry<'etapas'>[],
  campeonato?: Campeonato
): EquipeStanding[] {
  const porEquipe = new Map<string, EquipeStanding>();

  // Equipes inscritas aparecem na tabela com 0 pontos antes da primeira corrida.
  for (const equipe of campeonato?.equipes ?? []) {
    porEquipe.set(equipe.nome, {
      equipe: equipe.nome,
      categoria: equipe.categoria,
      pontos: 0,
      vitorias: 0,
    });
  }

  for (const etapa of etapas) {
    if (etapa.data.status !== 'concluida' || !etapa.data.resultadoCorrida) continue;

    for (const resultado of etapa.data.resultadoCorrida) {
      if (!resultado.equipe) continue;
      const atual = porEquipe.get(resultado.equipe) ?? {
        equipe: resultado.equipe,
        pontos: 0,
        vitorias: 0,
      };
      atual.pontos += resultado.pontos;
      if (resultado.posicao === 1) atual.vitorias += 1;
      porEquipe.set(resultado.equipe, atual);
    }
  }

  return [...porEquipe.values()].sort(
    (a, b) => b.pontos - a.pontos || b.vitorias - a.vitorias
  );
}
