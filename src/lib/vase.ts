/**
 * Vaso facetado e torcido, construído como uma pilha de camadas.
 * Cada camada é um anel poligonal; suas faces frontais recebem luz conforme a
 * orientação, o que cria a sensação de volume sem WebGL.
 */
import { BRAND_STOPS, gradientAt, light, mix } from './color';
import type { Pt } from './geometry';

const TAU = Math.PI * 2;
const r2 = (n: number) => Math.round(n * 100) / 100;

export interface VaseOptions {
  layers: number;
  height: number;
  cx: number;
  baseY: number;
  sides: number;
  /** Torção total, em graus, da base até a boca. */
  twist: number;
  rotation?: number;
  /** Perfil: pares [altura relativa 0–1, raio]. */
  profile: Array<[number, number]>;
  /** Achatamento da vista superior (0 = de frente, 1 = de cima). */
  tilt: number;
  /** Espessura da parede, vista na boca do vaso. */
  wall: number;
  colorStops?: Array<[number, string]>;
}

export interface VaseLayer {
  faces: Array<{ d: string; fill: string }>;
  seam: string;
  sheen: string;
  cap: { outer: string; inner: string; fill: string; rim: string };
  /** Ponto frontal da borda superior desta camada. */
  front: Pt;
  /** Altura (y) do plano superior desta camada. */
  y: number;
}

export interface VaseGeometry {
  layers: VaseLayer[];
  silhouette: string;
  ghostRings: string;
  bounds: { left: number; right: number; top: number; bottom: number };
}

/** Interpolação cúbica suave entre pontos do perfil. */
function sampleProfile(profile: Array<[number, number]>, t: number): number {
  const n = profile.length;
  if (t <= profile[0][0]) return profile[0][1];
  if (t >= profile[n - 1][0]) return profile[n - 1][1];
  let i = 0;
  while (i < n - 2 && t > profile[i + 1][0]) i++;
  const [t0, v0] = profile[i];
  const [t1, v1] = profile[i + 1];
  const slope = (k: number) => {
    const a = profile[Math.max(0, k - 1)];
    const b = profile[Math.min(n - 1, k + 1)];
    return (b[1] - a[1]) / (b[0] - a[0]);
  };
  const h = t1 - t0;
  const s = (t - t0) / h;
  const m0 = slope(i) * h;
  const m1 = slope(i + 1) * h;
  const s2 = s * s;
  const s3 = s2 * s;
  return (2 * s3 - 3 * s2 + 1) * v0 + (s3 - 2 * s2 + s) * m0 + (-2 * s3 + 3 * s2) * v1 + (s3 - s2) * m1;
}

function normalize([x, y, z]: [number, number, number]): [number, number, number] {
  const l = Math.hypot(x, y, z) || 1;
  return [x / l, y / l, z / l];
}

const LIGHT = normalize([-0.62, 0.42, 0.66]);
const HALF = normalize([LIGHT[0], LIGHT[1] + 0.25, LIGHT[2] + 1]);

export function buildVase(opt: VaseOptions): VaseGeometry {
  const { layers, height, cx, baseY, sides, tilt, wall } = opt;
  const twist = (opt.twist * Math.PI) / 180;
  const rot0 = ((opt.rotation ?? 0) * Math.PI) / 180;
  const stops = opt.colorStops ?? BRAND_STOPS;
  const pitch = height / layers;

  const ring = (b: number, inset = 0) => {
    const t = b / layers;
    const r = sampleProfile(opt.profile, t) - inset;
    const theta = rot0 + twist * t;
    const y = baseY - t * height;
    const pts = Array.from({ length: sides }, (_, j) => {
      const phi = theta + (j / sides) * TAU;
      return { x: cx + Math.cos(phi) * r, y: y + Math.sin(phi) * r * tilt, phi };
    });
    return { pts, r, y, theta };
  };

  const rings = Array.from({ length: layers + 1 }, (_, b) => ring(b));
  const result: VaseLayer[] = [];

  for (let i = 0; i < layers; i++) {
    const lo = rings[i];
    const hi = rings[i + 1];
    const t = (i + 0.5) / layers;
    const base = gradientAt(stops, t);
    const slope = -(hi.r - lo.r) / pitch;
    const faces: VaseLayer['faces'] = [];
    let seam = '';
    let sheen = '';

    for (let j = 0; j < sides; j++) {
      const k = (j + 1) % sides;
      const midPhi = (lo.theta + hi.theta) / 2 + ((j + 0.5) / sides) * TAU;
      const nz = Math.sin(midPhi);
      if (nz <= 0.02) continue;
      const n = normalize([Math.cos(midPhi), slope, nz]);
      const lambert = Math.max(0, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]);
      const spec = Math.pow(Math.max(0, n[0] * HALF[0] + n[1] * HALF[1] + n[2] * HALF[2]), 18);
      const fill = light(base, 0.3 + 0.82 * lambert + 0.45 * spec);
      const a = lo.pts[j];
      const b = lo.pts[k];
      const c = hi.pts[k];
      const d = hi.pts[j];
      faces.push({
        d: `M${r2(a.x)} ${r2(a.y)}L${r2(b.x)} ${r2(b.y)}L${r2(c.x)} ${r2(c.y)}L${r2(d.x)} ${r2(d.y)}Z`,
        fill,
      });
      seam += `M${r2(a.x)} ${r2(a.y)}L${r2(b.x)} ${r2(b.y)}`;
      sheen += `M${r2(d.x)} ${r2(d.y + 1.1)}L${r2(c.x)} ${r2(c.y + 1.1)}`;
    }

    const inner = ring(i + 1, wall);
    const capColor = light(mix(base, '#ffffff', 0.12), 1.02);
    result.push({
      faces,
      seam,
      sheen,
      cap: {
        outer: `M${hi.pts.map((p) => `${r2(p.x)} ${r2(p.y)}`).join('L')}Z`,
        inner: `M${inner.pts.map((p) => `${r2(p.x)} ${r2(p.y)}`).join('L')}Z`,
        fill: capColor,
        rim: light(base, 1.25),
      },
      front: [cx, hi.y + hi.r * tilt],
      y: hi.y,
    });
  }

  // Contorno completo, usado como guia das camadas ainda ocultas.
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (const rg of rings) {
    let minP = rg.pts[0];
    let maxP = rg.pts[0];
    for (const p of rg.pts) {
      if (p.x < minP.x) minP = p;
      if (p.x > maxP.x) maxP = p;
    }
    left.push([minP.x, minP.y]);
    right.push([maxP.x, maxP.y]);
  }
  const silhouette =
    `M${left.map(([x, y]) => `${r2(x)} ${r2(y)}`).join('L')}` +
    `L${right
      .slice()
      .reverse()
      .map(([x, y]) => `${r2(x)} ${r2(y)}`)
      .join('L')}Z`;

  const ghostRings = rings
    .filter((_, b) => b % 2 === 0 || b === layers)
    .map((rg) => `M${rg.pts.map((p) => `${r2(p.x)} ${r2(p.y)}`).join('L')}Z`)
    .join('');

  const xs = [...left.map((p) => p[0]), ...right.map((p) => p[0])];
  return {
    layers: result,
    silhouette,
    ghostRings,
    bounds: {
      left: Math.min(...xs),
      right: Math.max(...xs),
      top: rings[layers].y - rings[layers].r * tilt,
      bottom: baseY + rings[0].r * tilt,
    },
  };
}
