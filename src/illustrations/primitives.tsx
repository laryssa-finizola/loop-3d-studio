import { useId, useMemo, type ReactNode } from 'react';
import { light } from '../lib/color';
import { extrude, type Contour } from '../lib/geometry';

interface ExtrudedProps {
  contours: Contour[];
  depth: number;
  color: string;
  angle?: number;
  layers?: number;
  /** Desenha linhas de camada horizontais na face frontal (peça impressa em pé). */
  frontLayers?: number;
  children?: ReactNode;
}

/** Forma 2D extrudada, com laterais sombreadas e linhas de camada. */
export function Extruded({ contours, depth, color, angle = 36, layers, frontLayers, children }: ExtrudedProps) {
  const id = useId();
  const geo = useMemo(() => extrude(contours, { depth, angle, layers }), [contours, depth, angle, layers]);
  const top = Math.min(...contours.flat().map((p) => p[1]));

  return (
    <g>
      <defs>
        <linearGradient id={`${id}-f`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={light(color, 1.1)} />
          <stop offset="1" stopColor={light(color, 0.86)} />
        </linearGradient>
        {frontLayers ? (
          <pattern
            id={`${id}-l`}
            patternUnits="userSpaceOnUse"
            width="8"
            height={frontLayers}
            y={top}
          >
            <rect width="8" height={frontLayers * 0.5} fill="rgba(255,255,255,0.05)" />
            <rect y={frontLayers - 0.8} width="8" height="0.8" fill="rgba(0,0,0,0.16)" />
          </pattern>
        ) : null}
      </defs>
      {geo.sides.map((s, i) => {
        const fill = light(color, s.light);
        return <path key={i} d={s.d} fill={fill} stroke={fill} strokeWidth="0.7" strokeLinejoin="round" />;
      })}
      <path d={geo.layerLines} fill="none" stroke="rgba(0,0,0,0.26)" strokeWidth="0.8" />
      <path d={geo.front} fill={`url(#${id}-f)`} fillRule="evenodd" />
      {frontLayers ? <path d={geo.front} fill={`url(#${id}-l)`} fillRule="evenodd" /> : null}
      <path d={geo.front} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1" strokeLinejoin="round" />
      {children}
    </g>
  );
}

interface ExtrudedTextProps {
  x: number;
  y: number;
  text: string;
  size: number;
  depth: number;
  color: string;
  sideColor?: string;
  weight?: number;
  anchor?: 'start' | 'middle' | 'end';
  rotate?: number;
  angle?: number;
  letterSpacing?: number;
}

/**
 * Texto em volume: cópias empilhadas do texto, da parte de trás para a frente.
 * `x`/`y` posicionam a face frontal; a profundidade segue para trás.
 */
export function ExtrudedText({
  x,
  y,
  text,
  size,
  depth,
  color,
  sideColor,
  weight = 700,
  anchor = 'middle',
  rotate = 0,
  angle = 36,
  letterSpacing = 0,
}: ExtrudedTextProps) {
  const a = (angle * Math.PI) / 180;
  const steps = Math.max(2, Math.round(depth / 1.6));
  const side = sideColor ?? light(color, 0.62);
  const common = {
    x,
    y,
    fontSize: size,
    fontWeight: weight,
    textAnchor: anchor,
    letterSpacing,
    className: 'ill-text',
  } as const;
  const rot = rotate ? ` rotate(${rotate} ${x} ${y})` : '';

  return (
    <g aria-hidden="true">
      {Array.from({ length: steps }, (_, i) => {
        const k = steps - i;
        const t = (k / steps) * depth;
        const dx = Math.cos(a) * t;
        const dy = -Math.sin(a) * t;
        const shade = light(side, k % 3 === 0 ? 0.82 : 1 - (k / steps) * 0.18);
        return (
          <text
            key={k}
            {...common}
            transform={`translate(${dx.toFixed(2)} ${dy.toFixed(2)})${rot}`}
            fill={shade}
            stroke={shade}
            strokeWidth="1.4"
            strokeLinejoin="round"
          >
            {text}
          </text>
        );
      })}
      <text {...common} transform={rot ? rot.trim() : undefined} fill={color}>
        {text}
      </text>
    </g>
  );
}

/** Sombra suave no chão, sob a peça. */
export function FloorShadow({ cx, cy, rx, ry, gradient }: { cx: number; cy: number; rx: number; ry: number; gradient: string }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${gradient})`} />;
}
