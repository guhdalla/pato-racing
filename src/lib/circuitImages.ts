import fs from 'node:fs';
import path from 'node:path';

const EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'avif'];
const PUBLIC_CIRCUITOS_DIR = path.join(process.cwd(), 'public', 'images', 'circuitos');

function findImage(circuitoId: string, base: 'capa' | 'tracado'): string | null {
  for (const ext of EXTENSIONS) {
    const filePath = path.join(PUBLIC_CIRCUITOS_DIR, circuitoId, `${base}.${ext}`);
    if (fs.existsSync(filePath)) {
      return `images/circuitos/${circuitoId}/${base}.${ext}`;
    }
  }
  return null;
}

/** Retorna o caminho (relativo à raiz pública) da foto de capa do circuito, ou null se não existir. */
export function getCircuitCapa(circuitoId: string): string | null {
  return findImage(circuitoId, 'capa');
}

/** Retorna o caminho (relativo à raiz pública) do mapa do traçado do circuito, ou null se não existir. */
export function getCircuitTracado(circuitoId: string): string | null {
  return findImage(circuitoId, 'tracado');
}
