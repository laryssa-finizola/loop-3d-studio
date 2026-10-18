/**
 * Geometria das ilustrações: formas 2D simples e uma extrusão em projeção
 * oblíqua que gera faces laterais sombreadas e linhas de camada, imitando
 * uma peça impressa. Tudo é calculado uma vez e desenhado em SVG.
 */

export type Pt = [number, number];
export type Contour = Pt[];

const TAU = Math.PI * 2;
const r2 = (n: number) => Math.round(n * 100) / 100;

/* ---------- Formas ---------- */

export function circle(cx: number, cy: number, r: number, segments = 40): Contour {
  return Array.from({ length: segments }, (_, i) => {
    const a = (i / segments) * TAU;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as Pt;
  });
}

export function regularPolygon(cx: number, cy: number, r: number, sides: number, rotation = 0): Contour {
  return Array.from({ length: sides }, (_, i) => {
    const a = rotation + (i / sides) * TAU;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as Pt;
  });
}

export function roundedRect(x: number, y: number, w: number, h: number, radius: number, seg = 8): Contour {
  const r = Math.min(radius, w / 2, h / 2);
  const corners: Array<[number, number, number]> = [
    [x + w - r, y + r, -Math.PI / 2],
    [x + w - r, y + h - r, 0],
    [x + r, y + h - r, Math.PI / 2],
    [x + r, y + r, Math.PI],
  ];
  const pts: Contour = [];
  for (const [cx, cy, start] of corners) {
    for (let i = 0; i <= seg; i++) {
      const a = start + (i / seg) * (Math.PI / 2);
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
  }
  return pts;
}

export function star(cx: number, cy: number, outer: number, inner: number, points = 5, rotation = -Math.PI / 2): Contour {
  return Array.from({ length: points * 2 }, (_, i) => {
    const a = rotation + (i / (points * 2)) * TAU;
    const r = i % 2 === 0 ? outer : inner;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as Pt;
  });
}

/** Coração paramétrico centrado em (cx, cy), com largura aproximada `size`. */
export function heart(cx: number, cy: number, size: number, segments = 60): Contour {
  const s = size / 34;
  return Array.from({ length: segments }, (_, i) => {
    const t = (i / segments) * TAU;
    const x = 16 * Math.sin(t) ** 3;
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    return [cx + x * s, cy - y * s - 2 * s] as Pt;
  });
}

/** Engrenagem com dentes trapezoidais. */
export function gear(cx: number, cy: number, rootR: number, tipR: number, teeth: number, rotation = 0): Contour {
  const pts: Contour = [];
  const step = TAU / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = rotation + i * step;
    const arc = (r: number, a0: number, a1: number, n: number) => {
      for (let k = 0; k <= n; k++) {
        const t = a0 + ((a1 - a0) * k) / n;
        pts.push([cx + Math.cos(t) * r, cy + Math.sin(t) * r]);
      }
    };
    arc(rootR, a, a + step * 0.42, 3);
    arc(tipR, a + step * 0.54, a + step * 0.88, 2);
  }
  return pts;
}

export function rotate(c: Contour, angleDeg: number, ox: number, oy: number): Contour {
  const a = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  return c.map(([x, y]) => [ox + (x - ox) * cos - (y - oy) * sin, oy + (x - ox) * sin + (y - oy) * cos]);
}

export function translate(c: Contour, dx: number, dy: number): Contour {
  return c.map(([x, y]) => [x + dx, y + dy]);
}

export function toPath(contours: Contour[]): string {
  return contours
    .map((c) => `M${c.map(([x, y]) => `${r2(x)} ${r2(y)}`).join('L')}Z`)
    .join('');
}

/* ---------- Extrusão ---------- */

function signedArea(c: Contour): number {
  let s = 0;
  for (let i = 0; i < c.length; i++) {
    const [x1, y1] = c[i];
    const [x2, y2] = c[(i + 1) % c.length];
    s += x1 * y2 - x2 * y1;
  }
  return s / 2;
}

function inside([px, py]: Pt, c: Contour): boolean {
  let hit = false;
  for (let i = 0, j = c.length - 1; i < c.length; j = i++) {
    const [xi, yi] = c[i];
    const [xj, yj] = c[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

export interface ExtrudeOptions {
  /** Profundidade aparente, em unidades do viewBox. */
  depth: number;
  /** Direção da profundidade na tela, em graus (para cima e para a direita). */
  angle?: number;
  /** Quantidade de linhas de camada desenhadas nas laterais. */
  layers?: number;
}

export interface SideFace {
  d: string;
  /** Luz recebida pela face (0 a 1). */
  light: number;
}

export interface Extrusion {
  front: string;
  sides: SideFace[];
  layerLines: string;
  offset: Pt;
}

/** Luz vinda de cima e da esquerda, em coordenadas de tela. */
const LIGHT: Pt = [-0.45, -0.89];

export function extrude(contours: Contour[], { depth, angle = 36, layers }: ExtrudeOptions): Extrusion {
  const a = (angle * Math.PI) / 180;
  const o: Pt = [Math.cos(a) * depth, -Math.sin(a) * depth];
  const ol = Math.hypot(o[0], o[1]);
  const lineCount = layers ?? Math.max(2, Math.round(depth / 5));

  const faces: Array<SideFace & { order: number }> = [];
  let lines = '';

  contours.forEach((c, index) => {
    const containedBy = contours.filter((other, j) => j !== index && inside(c[0], other)).length;
    const isHole = containedBy % 2 === 1;
    const area = signedArea(c);
    // Normal apontando para fora do material.
    const flip = (area > 0) !== isHole ? 1 : -1;

    for (let i = 0; i < c.length; i++) {
      const p = c[i];
      const q = c[(i + 1) % c.length];
      const ex = q[0] - p[0];
      const ey = q[1] - p[1];
      const len = Math.hypot(ex, ey) || 1;
      const n: Pt = [(ey / len) * flip, (-ex / len) * flip];
      const facing = (n[0] * o[0] + n[1] * o[1]) / ol;
      if (facing <= 0.001) continue;

      const p2: Pt = [p[0] + o[0], p[1] + o[1]];
      const q2: Pt = [q[0] + o[0], q[1] + o[1]];
      const lambert = Math.max(0, n[0] * LIGHT[0] + n[1] * LIGHT[1]);
      const mid: Pt = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
      faces.push({
        d: `M${r2(p[0])} ${r2(p[1])}L${r2(q[0])} ${r2(q[1])}L${r2(q2[0])} ${r2(q2[1])}L${r2(p2[0])} ${r2(p2[1])}Z`,
        light: 0.42 + 0.5 * lambert,
        order: mid[0] * o[0] + mid[1] * o[1],
      });

      for (let k = 1; k < lineCount; k++) {
        const t = k / lineCount;
        lines += `M${r2(p[0] + o[0] * t)} ${r2(p[1] + o[1] * t)}L${r2(q[0] + o[0] * t)} ${r2(q[1] + o[1] * t)}`;
      }
    }
  });

  faces.sort((f1, f2) => f1.order - f2.order);
  return {
    front: toPath(contours),
    sides: faces.map(({ d, light }) => ({ d, light })),
    layerLines: lines,
    offset: o,
  };
}

/** Deslocamento na tela de algo que está `h` unidades à frente da face frontal. */
export function towardViewer(h: number, angle = 36): Pt {
  const a = (angle * Math.PI) / 180;
  return [-Math.cos(a) * h, Math.sin(a) * h];
}
