type RGB = [number, number, number];

function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex([r, g, b]: RGB): string {
  const c = (v: number) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** Mistura duas cores (t = 0 → a, t = 1 → b). */
export function mix(a: string, b: string, t: number): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return rgbToHex([ca[0] + (cb[0] - ca[0]) * t, ca[1] + (cb[1] - ca[1]) * t, ca[2] + (cb[2] - ca[2]) * t]);
}

/** Aplica luz a uma cor: 0 = preto, 1 = cor original, acima de 1 clareia em direção ao branco. */
export function light(hex: string, k: number): string {
  if (k <= 1) return mix('#050508', hex, Math.max(0, k));
  return mix(hex, '#ffffff', Math.min(1, k - 1));
}

/** Interpola uma lista de cores com posições entre 0 e 1. */
export function gradientAt(stops: Array<[number, string]>, t: number): string {
  if (t <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    const [p1, c1] = stops[i];
    const [p0, c0] = stops[i - 1];
    if (t <= p1) return mix(c0, c1, (t - p0) / (p1 - p0));
  }
  return stops[stops.length - 1][1];
}

/** Gradiente do símbolo da marca: ciano → azul → violeta → magenta. */
export const BRAND_STOPS: Array<[number, string]> = [
  [0, '#00C8F8'],
  [0.36, '#087BFF'],
  [0.7, '#7C3AED'],
  [1, '#D10BE8'],
];
