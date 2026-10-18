/**
 * Ilustrações locais das peças de exemplo. São desenhos de possibilidades,
 * exibidos com o selo “Exemplo ilustrativo”, e não fotos de trabalhos reais.
 * Todas usam o mesmo viewBox (480 × 380) e a mesma luz.
 */
import { useId, type ReactElement } from 'react';
import type { IllustrationId } from '../data/types';
import { light } from '../lib/color';
import {
  circle,
  gear,
  heart,
  regularPolygon,
  rotate,
  roundedRect,
  star,
  towardViewer,
  translate,
  type Contour,
  type Pt,
} from '../lib/geometry';
import { buildVase } from '../lib/vase';
import { Extruded, ExtrudedText, FloorShadow } from './primitives';

const C = {
  white: '#ECECF2',
  gray: '#C3C6D2',
  graphite: '#262632',
  ink: '#17171F',
  cyan: '#00C8F8',
  blue: '#087BFF',
  violet: '#7C3AED',
  magenta: '#D10BE8',
};

const ANGLE = 36;
const along = (d: number): Pt => [Math.cos((ANGLE * Math.PI) / 180) * d, -Math.sin((ANGLE * Math.PI) / 180) * d];

type PieceProps = { shadow: string };

/* ---------- Produtos personalizados ---------- */

const KEY_ROT = -9;
const KEY_PIVOT: Pt = [249, 206];
const KEY_PLATE = rotate(roundedRect(118, 150, 262, 112, 50), KEY_ROT, ...KEY_PIVOT);
const KEY_HOLE = rotate(circle(166, 206, 15), KEY_ROT, ...KEY_PIVOT);
/** Argola: elipse à esquerda do furo, girada junto com a peça. */
const RING = { cx: 166 - 50, cy: 206, rx: 40, ry: 44 };
function ringArc(t0: number, t1: number, steps = 24): string {
  const pts: Contour = Array.from({ length: steps + 1 }, (_, i) => {
    const t = t0 + ((t1 - t0) * i) / steps;
    return [RING.cx + Math.cos(t) * RING.rx, RING.cy + Math.sin(t) * RING.ry] as Pt;
  });
  return `M${rotate(pts, KEY_ROT, ...KEY_PIVOT).map((q) => q.map((v) => v.toFixed(1)).join(' ')).join('L')}`;
}
const RING_BACK = ringArc(0, Math.PI * 2, 64);
const RING_FRONT = ringArc(-0.05, 1.45);

function ChaveiroNome({ shadow }: PieceProps) {
  const raised = towardViewer(7);
  return (
    <g>
      <FloorShadow cx={262} cy={318} rx={170} ry={20} gradient={shadow} />
      {/* argola: parte que passa por trás da peça */}
      <path d={RING_BACK} fill="none" stroke={light(C.gray, 0.72)} strokeWidth="7" />
      <Extruded contours={[KEY_PLATE, KEY_HOLE]} depth={20} color={C.violet} />
      {/* argola: trecho que atravessa o furo e passa pela frente */}
      <path d={RING_FRONT} fill="none" stroke={C.gray} strokeWidth="7" strokeLinecap="round" />
      <ExtrudedText
        x={274 + raised[0]}
        y={230 + raised[1]}
        text="Lia"
        size={66}
        depth={7}
        color={C.white}
        sideColor="#b9a6e8"
        rotate={KEY_ROT}
      />
    </g>
  );
}

const PLATE_BASE = [roundedRect(96, 262, 288, 36, 8)];
const PLATE_SHIFT = along(26);
const PLATE_FACE = [translate(roundedRect(118, 118, 244, 146, 14), PLATE_SHIFT[0], PLATE_SHIFT[1])];

function PlaquinhaMesa({ shadow }: PieceProps) {
  const raised = towardViewer(5);
  return (
    <g>
      <FloorShadow cx={270} cy={312} rx={190} ry={22} gradient={shadow} />
      <Extruded contours={PLATE_BASE} depth={74} color={C.graphite} />
      <Extruded contours={PLATE_FACE} depth={12} color={C.white} frontLayers={5} />
      <ExtrudedText
        x={240 + PLATE_SHIFT[0] + raised[0]}
        y={208 + PLATE_SHIFT[1] + raised[1]}
        text="Mesa 4"
        size={48}
        depth={5}
        color={C.violet}
      />
    </g>
  );
}

/* ---------- Brindes e lembranças ---------- */

const EV_STAR = rotate(star(150, 196, 70, 32), -14, 150, 196);
const EV_STAR_HOLE = rotate(circle(150, 150, 7, 20), -14, 150, 196);
const EV_CIRCLE = circle(340, 182, 58, 48);
const EV_CIRCLE_HOLE = circle(340, 142, 7, 20);
const EV_HEART = rotate(heart(246, 234, 132), 6, 246, 234);
const EV_HEART_HOLE = rotate(circle(246, 196, 7, 20), 6, 246, 234);

function ChaveirosEvento({ shadow }: PieceProps) {
  return (
    <g>
      <FloorShadow cx={252} cy={322} rx={190} ry={20} gradient={shadow} />
      <circle cx={140} cy={118} r={22} fill="none" stroke={light(C.gray, 0.8)} strokeWidth="5" />
      <Extruded contours={[EV_STAR, EV_STAR_HOLE]} depth={14} color={C.cyan} />
      <circle cx={342} cy={108} r={22} fill="none" stroke={light(C.gray, 0.8)} strokeWidth="5" />
      <Extruded contours={[EV_CIRCLE, EV_CIRCLE_HOLE]} depth={14} color={C.blue}>
        <circle cx={340} cy={190} r={30} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="5" />
      </Extruded>
      <circle cx={250} cy={166} r={22} fill="none" stroke={light(C.gray, 0.9)} strokeWidth="5" />
      <Extruded contours={[EV_HEART, EV_HEART_HOLE]} depth={14} color={C.magenta} />
    </g>
  );
}

const COASTER = regularPolygon(226, 206, 84, 6);
const COASTER_INNER = regularPolygon(226, 206, 62, 6);
const HOLDER_BASE = [roundedRect(118, 280, 228, 22, 6)];
const HOLDER_LIP = [roundedRect(118, 256, 228, 30, 6)];
const HOLDER_BACK_SHIFT = along(108);
const HOLDER_BACK = [translate(roundedRect(118, 236, 228, 50, 6), HOLDER_BACK_SHIFT[0], HOLDER_BACK_SHIFT[1])];
const COASTER_COLORS = [C.white, C.violet, C.white, C.cyan];

function PortaCopos({ shadow }: PieceProps) {
  return (
    <g>
      <FloorShadow cx={290} cy={312} rx={190} ry={22} gradient={shadow} />
      <Extruded contours={HOLDER_BASE} depth={120} color={C.graphite} />
      <Extruded contours={HOLDER_BACK} depth={10} color={C.graphite} />
      {[0.78, 0.56, 0.34, 0.12].map((f, i) => {
        const [dx, dy] = along(120 * f);
        const c = COASTER_COLORS[i];
        return (
          <Extruded key={f} contours={[translate(COASTER, dx, dy)]} depth={9} color={c} layers={3}>
            {i === 3 ? (
              <g fill="none" stroke="rgba(0,0,0,0.22)" strokeWidth="3" strokeLinejoin="round">
                <path d={`M${translate(COASTER_INNER, dx, dy).map((p) => p.join(' ')).join('L')}Z`} />
                <path d={`M${226 + dx} ${166 + dy}L${261 + dx} ${226 + dy}L${191 + dx} ${226 + dy}Z`} />
              </g>
            ) : null}
          </Extruded>
        );
      })}
      <Extruded contours={HOLDER_LIP} depth={12} color={C.graphite} />
    </g>
  );
}

/* ---------- Peças técnicas ---------- */

const GEAR_MAIN = gear(232, 196, 100, 124, 14, 0.1);
const GEAR_HOLES = [circle(232, 196, 28, 36), ...[0, 1, 2, 3, 4].map((i) => {
  const a = -Math.PI / 2 + (i / 5) * Math.PI * 2;
  return circle(232 + Math.cos(a) * 64, 196 + Math.sin(a) * 64, 15, 28);
})];
const GEAR_SMALL = gear(378, 112, 46, 62, 8, 0.32);
const GEAR_SMALL_HOLE = circle(378, 112, 14, 28);

function Engrenagem({ shadow }: PieceProps) {
  return (
    <g>
      <FloorShadow cx={260} cy={334} rx={180} ry={20} gradient={shadow} />
      <Extruded contours={[GEAR_SMALL, GEAR_SMALL_HOLE]} depth={22} color="#5b5e6e" />
      <Extruded contours={[GEAR_MAIN, ...GEAR_HOLES]} depth={28} color={C.gray}>
        <circle cx={232} cy={196} r={40} fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="5" />
      </Extruded>
    </g>
  );
}

const L_ROT = -5;
const L_SHAPE = rotate(
  [
    [132, 96],
    [198, 96],
    [198, 236],
    [356, 236],
    [356, 302],
    [132, 302],
  ],
  L_ROT,
  240,
  200,
);
const L_HOLE_CENTERS = rotate(
  [
    [165, 136],
    [165, 198],
    [250, 269],
    [318, 269],
  ],
  L_ROT,
  240,
  200,
);
const L_HOLES = L_HOLE_CENTERS.map(([x, y]) => circle(x, y, 10, 28));

function Cantoneira({ shadow }: PieceProps) {
  return (
    <g>
      <FloorShadow cx={262} cy={326} rx={170} ry={20} gradient={shadow} />
      <Extruded contours={[L_SHAPE, ...L_HOLES]} depth={34} color={C.blue}>
        {L_HOLE_CENTERS.map(([x, y]) => (
          <circle key={x} cx={x} cy={y} r={16} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="4" />
        ))}
      </Extruded>
    </g>
  );
}

/* ---------- Decoração e utilidades ---------- */

const DECOR_VASE = buildVase({
  layers: 26,
  height: 238,
  cx: 240,
  baseY: 306,
  sides: 5,
  twist: 84,
  rotation: 20,
  tilt: 0.27,
  wall: 5,
  colorStops: [
    [0, '#7C3AED'],
    [1, '#D10BE8'],
  ],
  profile: [
    [0, 54],
    [0.25, 82],
    [0.5, 92],
    [0.78, 70],
    [1, 76],
  ],
});

function VasoGeometrico({ shadow }: PieceProps) {
  const last = DECOR_VASE.layers[DECOR_VASE.layers.length - 1];
  return (
    <g>
      <FloorShadow cx={244} cy={314} rx={130} ry={20} gradient={shadow} />
      {DECOR_VASE.layers.map((layer, i) => (
        <g key={i}>
          {layer.faces.map((f, j) => (
            <path key={j} d={f.d} fill={f.fill} stroke={f.fill} strokeWidth="0.6" />
          ))}
          <path d={layer.seam} fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="0.9" />
          <path d={layer.sheen} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
        </g>
      ))}
      <path d={last.cap.outer} fill={last.cap.fill} stroke={last.cap.rim} />
      <path d={last.cap.inner} fill="#0a0810" />
    </g>
  );
}

interface Box {
  x: number;
  w: number;
  h: number;
  color: string;
}
const ORG_BOTTOM = 304;
const ORG_DEPTH = 84;
const ORG_BOXES: Box[] = [
  { x: 96, w: 96, h: 112, color: C.white },
  { x: 192, w: 96, h: 168, color: C.cyan },
  { x: 288, w: 96, h: 78, color: C.white },
];
const ORG_SHAPES = ORG_BOXES.map((b) => [roundedRect(b.x, ORG_BOTTOM - b.h, b.w, b.h, 4, 3)]);

function interior(b: Box, wall = 7): string {
  const top = ORG_BOTTOM - b.h;
  const f = wall / ORG_DEPTH;
  const [ox, oy] = along(ORG_DEPTH);
  const pts: Pt[] = [
    [b.x + wall + ox * f, top + oy * f],
    [b.x + b.w - wall + ox * f, top + oy * f],
    [b.x + b.w - wall + ox * (1 - f), top + oy * (1 - f)],
    [b.x + wall + ox * (1 - f), top + oy * (1 - f)],
  ];
  return `M${pts.map((p) => p.map((v) => v.toFixed(1)).join(' ')).join('L')}Z`;
}

function Organizador({ shadow }: PieceProps) {
  const id = useId();
  const tallTop = ORG_BOTTOM - ORG_BOXES[1].h;
  const [ox, oy] = along(ORG_DEPTH * 0.5);
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-in`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#0b0b10" />
          <stop offset="1" stopColor="#2a2a35" />
        </linearGradient>
        <clipPath id={`${id}-rim`}>
          <rect x="0" y="0" width="480" height={tallTop + 2} />
        </clipPath>
      </defs>
      <FloorShadow cx={278} cy={314} rx={200} ry={22} gradient={shadow} />
      {ORG_BOXES.map((b, i) => (
        <g key={b.x}>
          <Extruded contours={ORG_SHAPES[i]} depth={ORG_DEPTH} color={b.color} layers={14} frontLayers={4} />
          <path d={interior(b)} fill={`url(#${id}-in)`} />
          {i === 1 ? (
            <g clipPath={`url(#${id}-rim)`}>
              <g transform={`translate(${222 + ox} ${tallTop + oy}) rotate(-12)`}>
                <rect x="-6" y="-92" width="12" height="120" rx="3" fill={C.magenta} />
                <path d="M-6 -92h12l-6 -16z" fill="#f3d6c4" />
              </g>
              <g transform={`translate(${256 + ox} ${tallTop + oy}) rotate(9)`}>
                <rect x="-5" y="-70" width="10" height="100" rx="3" fill={C.violet} />
                <rect x="-5" y="-70" width="10" height="10" rx="2" fill={C.ink} />
              </g>
            </g>
          ) : null}
        </g>
      ))}
    </g>
  );
}

const STAND_DEPTH = 130;
const STAND_BASE = [roundedRect(96, 286, 290, 22, 6)];
const REST_FOOT: Pt = [258, 288];
const REST_TOP: Pt = [176, 116];
const STAND_REST: Contour = [REST_FOOT, [REST_FOOT[0] - 24, REST_FOOT[1]], [REST_TOP[0] - 22, REST_TOP[1] + 8], REST_TOP];
const STAND_LIP = roundedRect(296, 262, 18, 28, 4, 2);
// Aparelho deitado sobre a face superior do encosto.
const U = (() => {
  const dx = REST_TOP[0] - REST_FOOT[0];
  const dy = REST_TOP[1] - REST_FOOT[1];
  const l = Math.hypot(dx, dy);
  return [dx / l, dy / l] as Pt;
})();
const N: Pt = [-U[1], U[0]];
const PHONE_LEN = 178;
const PHONE_THICK = 12;
const P0: Pt = [REST_FOOT[0] + 30, 286];
const P1: Pt = [P0[0] + U[0] * PHONE_LEN, P0[1] + U[1] * PHONE_LEN];
const P2: Pt = [P1[0] + N[0] * PHONE_THICK, P1[1] + N[1] * PHONE_THICK];
const P3: Pt = [P0[0] + N[0] * PHONE_THICK, P0[1] + N[1] * PHONE_THICK];
const PHONE_DEPTH = 96;
const PHONE_SHIFT = along((STAND_DEPTH - PHONE_DEPTH) / 2);
const PHONE_SHAPE = translate([P0, P1, P2, P3], PHONE_SHIFT[0], PHONE_SHIFT[1]);
const PHONE_SCREEN = (() => {
  const [, , q2, q3] = PHONE_SHAPE;
  const [ox, oy] = along(PHONE_DEPTH);
  const at = (s: number, t: number): Pt => [q3[0] + (q2[0] - q3[0]) * s + ox * t, q3[1] + (q2[1] - q3[1]) * s + oy * t];
  return [at(0.05, 0.08), at(0.95, 0.08), at(0.95, 0.92), at(0.05, 0.92)];
})();

function SuporteCelular({ shadow }: PieceProps) {
  return (
    <g>
      <FloorShadow cx={290} cy={312} rx={200} ry={22} gradient={shadow} />
      <Extruded contours={STAND_BASE} depth={STAND_DEPTH} color={C.white} layers={20} />
      <Extruded contours={[STAND_REST]} depth={STAND_DEPTH} color={C.white} layers={20} />
      <Extruded contours={[PHONE_SHAPE]} depth={PHONE_DEPTH} color="#2c2c38" layers={2} />
      <path
        d={`M${PHONE_SCREEN.map((q) => q.map((v) => v.toFixed(1)).join(' ')).join('L')}Z`}
        fill="#0d1420"
        stroke="rgba(0,200,248,0.4)"
        strokeWidth="1"
      />
      <Extruded contours={[STAND_LIP]} depth={STAND_DEPTH} color={C.white} layers={20} />
    </g>
  );
}

/* ---------- Publicidade e comunicação ---------- */

const SIGN_BASE = [roundedRect(56, 266, 368, 32, 6)];
const SIGN_SHIFT = along(18);

function Letreiro({ shadow }: PieceProps) {
  return (
    <g>
      <FloorShadow cx={262} cy={312} rx={220} ry={22} gradient={shadow} />
      <Extruded contours={SIGN_BASE} depth={58} color={C.graphite} />
      <ExtrudedText
        x={240 + SIGN_SHIFT[0]}
        y={268 + SIGN_SHIFT[1]}
        text="ABERTO"
        size={86}
        depth={20}
        color={C.white}
        sideColor="#8c90a2"
        letterSpacing={-2}
      />
      <rect x={70} y={279} width={110} height={5} rx={2.5} fill={C.cyan} opacity="0.85" />
    </g>
  );
}

const PLAQUE = [roundedRect(62, 120, 356, 156, 24)];
const ARROW_RAISE = towardViewer(6);
const ARROW: Contour = translate(
  [
    [96, 186],
    [146, 186],
    [146, 164],
    [190, 198],
    [146, 232],
    [146, 210],
    [96, 210],
  ],
  ARROW_RAISE[0],
  ARROW_RAISE[1],
);

function PlacaSinalizacao({ shadow }: PieceProps) {
  const raised = towardViewer(5);
  return (
    <g>
      <FloorShadow cx={262} cy={322} rx={190} ry={18} gradient={shadow} />
      <rect x={78} y={142} width={356} height={156} rx={24} fill="#000" opacity="0.35" />
      <Extruded contours={PLAQUE} depth={14} color={C.blue}>
        {[
          [88, 144],
          [392, 144],
          [88, 252],
          [392, 252],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={6} fill={light(C.blue, 0.6)} stroke="rgba(255,255,255,0.4)" />
        ))}
      </Extruded>
      <Extruded contours={[ARROW]} depth={6} color={C.white} layers={2} />
      <ExtrudedText
        x={208 + raised[0]}
        y={214 + raised[1]}
        text="Recepção"
        size={40}
        weight={600}
        depth={5}
        color={C.white}
        sideColor="#9fc6ff"
        anchor="start"
      />
    </g>
  );
}

const REGISTRY: Record<IllustrationId, (p: PieceProps) => ReactElement> = {
  'chaveiro-nome': ChaveiroNome,
  'plaquinha-mesa': PlaquinhaMesa,
  'chaveiros-evento': ChaveirosEvento,
  'porta-copos': PortaCopos,
  engrenagem: Engrenagem,
  cantoneira: Cantoneira,
  'vaso-geometrico': VasoGeometrico,
  organizador: Organizador,
  'suporte-celular': SuporteCelular,
  letreiro: Letreiro,
  'placa-sinalizacao': PlacaSinalizacao,
};

interface IllustrationProps {
  id: IllustrationId;
  /** Texto alternativo. Vazio quando a imagem é decorativa (ex.: miniaturas). */
  alt: string;
  className?: string;
}

export function Illustration({ id, alt, className }: IllustrationProps) {
  const uid = useId();
  const Piece = REGISTRY[id];
  return (
    <svg
      className={className}
      viewBox="0 0 480 380"
      {...(alt ? { role: 'img', 'aria-label': alt } : { 'aria-hidden': true })}
      focusable="false"
    >
      <defs>
        <radialGradient id={`${uid}-shadow`}>
          <stop offset="0" stopColor="#000" stopOpacity="0.7" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <Piece shadow={`${uid}-shadow`} />
    </svg>
  );
}
