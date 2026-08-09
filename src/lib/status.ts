type Tone = 'neutral' | 'success' | 'danger';

const ETAPA_STATUS: Record<string, { label: string; tone: Tone }> = {
  agendada: { label: 'Agendada', tone: 'neutral' },
  concluida: { label: 'Concluída', tone: 'success' },
  cancelada: { label: 'Cancelada', tone: 'danger' },
};

const CAMPEONATO_STATUS: Record<string, { label: string; tone: Tone }> = {
  agendado: { label: 'Agendado', tone: 'neutral' },
  'em-andamento': { label: 'Em andamento', tone: 'success' },
  finalizado: { label: 'Finalizado', tone: 'neutral' },
};

export function etapaStatusBadge(status: string) {
  return ETAPA_STATUS[status] ?? { label: status, tone: 'neutral' as Tone };
}

export function campeonatoStatusBadge(status: string) {
  return CAMPEONATO_STATUS[status] ?? { label: status, tone: 'neutral' as Tone };
}
