import type { CollectionEntry } from 'astro:content';

export interface RecordeComunidade {
  piloto: string;
  tempo: string;
  campeonatoId: string;
  rodada: number;
}

function parseTempoParaMs(tempo: string): number | null {
  const partes = tempo.split(':').map((p) => p.trim());
  if (partes.length < 2 || partes.length > 3) return null;

  const segundos = Number(partes.pop());
  const minutos = Number(partes.pop());
  const horas = partes.length > 0 ? Number(partes.pop()) : 0;
  if ([segundos, minutos, horas].some((n) => Number.isNaN(n))) return null;

  return Math.round(((horas * 60 + minutos) * 60 + segundos) * 1000);
}

/**
 * Recorde de volta da comunidade Pato Racing num circuito: a mais rápida entre
 * `voltaMaisRapida` ("Piloto (tempo)") de todas as etapas concluídas já disputadas
 * ali, em qualquer campeonato/temporada. Derivado a partir das etapas — nada é
 * armazenado em duplicidade, mesmo princípio da classificação geral.
 */
export function calcularRecordeComunidade(
  etapas: CollectionEntry<'etapas'>[],
  circuitoId: string
): RecordeComunidade | undefined {
  let melhorMs = Infinity;
  let melhor: RecordeComunidade | undefined;

  for (const etapa of etapas) {
    if (etapa.data.circuitoId !== circuitoId) continue;
    if (etapa.data.status !== 'concluida' || !etapa.data.voltaMaisRapida) continue;

    const match = etapa.data.voltaMaisRapida.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
    if (!match) continue;

    const piloto = match[1].trim();
    const tempo = match[2].trim();
    const ms = parseTempoParaMs(tempo);
    if (ms === null) continue;

    if (ms < melhorMs) {
      melhorMs = ms;
      melhor = { piloto, tempo, campeonatoId: etapa.data.campeonatoId, rodada: etapa.data.rodada };
    }
  }

  return melhor;
}
