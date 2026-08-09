import { defineCollection, z } from 'astro:content';
import { file, glob } from 'astro/loaders';

const circuitos = defineCollection({
  loader: file('src/content/circuitos/circuitos.json'),
  schema: z.object({
    id: z.string(),
    nome: z.string(),
    pais: z.string(),
    paisCodigo: z.string().length(2),
    cidade: z.string(),
    comprimentoKm: z.number().positive(),
    numeroVoltasPadrao: z.number().int().positive(),
    numeroCurvas: z.number().int().positive(),
    sentido: z.enum(['horario', 'anti-horario']),
    primeiroGp: z.number().int(),
    recordeVolta: z
      .object({
        tempo: z.string(),
        piloto: z.string(),
        ano: z.number().int(),
      })
      .optional(),
    curiosidades: z.string().optional(),
  }),
});

const campeonatos = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/campeonatos' }),
  schema: z.object({
    titulo: z.string(),
    jogo: z.string(),
    temporada: z.number().int(),
    status: z.enum(['agendado', 'em-andamento', 'finalizado']),
    descricao: z.string(),
    regulamentoTexto: z.string().optional(),
    regulamentoUrl: z.string().url().optional(),
    sistemaPontuacao: z.array(
      z.object({ posicao: z.number().int(), pontos: z.number() })
    ),
    pontosVoltaMaisRapida: z.number().default(0),
    pontosSprint: z
      .array(z.object({ posicao: z.number().int(), pontos: z.number() }))
      .optional(),
    bannerImagem: z.string().optional(),
    discordUrl: z.string().url().optional(),
    dataInicio: z.coerce.date(),
    dataFim: z.coerce.date(),
  }),
});

const etapas = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/etapas' }),
  schema: z.object({
    campeonatoId: z.string(),
    rodada: z.number().int().positive(),
    circuitoId: z.string(),
    formatoFimDeSemana: z.enum(['normal', 'sprint']),
    status: z.enum(['agendada', 'concluida', 'cancelada']),
    sessoes: z.array(
      z.object({
        tipo: z.enum([
          'treino-livre-1',
          'treino-livre-2',
          'treino-livre-3',
          'classificacao-sprint',
          'sprint',
          'classificacao',
          'corrida',
        ]),
        dataHora: z.coerce.date(),
      })
    ),
    resultadoClassificacao: z
      .array(
        z.object({
          posicao: z.number().int(),
          piloto: z.string(),
          equipe: z.string().optional(),
          tempo: z.string().optional(),
        })
      )
      .optional(),
    resultadoCorrida: z
      .array(
        z.object({
          posicao: z.number().int(),
          piloto: z.string(),
          equipe: z.string().optional(),
          pontos: z.number(),
          voltaMaisRapida: z.boolean().optional(),
          status: z.string().optional(),
        })
      )
      .optional(),
    poleposition: z.string().optional(),
    voltaMaisRapida: z.string().optional(),
    podio: z.array(z.string()).max(3).optional(),
    linkTransmissao: z.string().url().optional(),
    observacoes: z.string().optional(),
  }),
});

const eventos = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/eventos' }),
  schema: z.object({
    titulo: z.string(),
    tipo: z.string(),
    data: z.coerce.date(),
    descricao: z.string(),
    imagem: z.string().optional(),
    linkInscricao: z.string().url().optional(),
  }),
});

export const collections = { circuitos, campeonatos, etapas, eventos };
