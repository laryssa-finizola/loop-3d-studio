import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import type { SiteContent } from '../data/types';
import { buildVase, type VaseOptions } from '../lib/vase';

const VIEW = { w: 560, h: 680 };
const LAYERS = 44;
const SIDES = 6;
/** Tempo entre camadas na animação de entrada (ms). */
const LAYER_MS = 24;
const START_MS = 200;
const BASE_Y = 586;
const BASE_ROTATION = 8;
/** Velocidade do giro automático, em graus por segundo. */
const SPEED = 24;
/** Tempo para o giro atingir a velocidade normal depois da entrada (ms). */
const RAMP_MS = 900;

const OPTIONS: VaseOptions = {
  layers: LAYERS,
  height: 452,
  cx: 300,
  baseY: BASE_Y,
  sides: SIDES,
  twist: 64,
  rotation: BASE_ROTATION,
  tilt: 0.27,
  wall: 7,
  profile: [
    [0, 92],
    [0.16, 128],
    [0.38, 150],
    [0.6, 132],
    [0.8, 96],
    [0.93, 98],
    [1, 106],
  ],
};

/** Geometria do vaso girado `angle` graus em torno do próprio eixo. */
const geometryAt = (angle: number) => buildVase({ ...OPTIONS, rotation: BASE_ROTATION + angle });

const INITIAL = geometryAt(0);
const TOP = INITIAL.layers[LAYERS - 1];
const RULER_X = INITIAL.bounds.left - 44;
const TICKS = INITIAL.layers
  .map((layer, i) => ({ y: layer.y, major: (i + 1) % 11 === 0 }))
  .filter((_, i) => (i + 1) % 4 === 0 || (i + 1) % 11 === 0);

/** Trajetória do bico durante a animação de entrada, gerada a partir das camadas. */
const NOZZLE_KEYFRAMES = (() => {
  const last = INITIAL.layers.length - 1;
  const frames = INITIAL.layers
    .map((layer, i) => `${((i / last) * 100).toFixed(2)}%{transform:translate(${layer.front[0]}px,${layer.front[1].toFixed(1)}px)}`)
    .join('');
  return `@keyframes loop-nozzle-path{${frames}}`;
})();

const valueText = (deg: number) => `${deg} graus`;

interface LayerVaseProps {
  demo: SiteContent['hero']['demo'];
}

export function LayerVase({ demo }: LayerVaseProps) {
  const id = useId();
  const total = INITIAL.layers.length;
  const [intro, setIntro] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(true);

  const figureRef = useRef<HTMLElement>(null);
  const layersRef = useRef<SVGGElement>(null);
  const capOuterRef = useRef<SVGPathElement>(null);
  const capInnerRef = useRef<SVGPathElement>(null);
  const rangeRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLOutputElement>(null);
  const angleRef = useRef(0);

  /**
   * Redesenha o vaso no ângulo pedido. Atualiza o SVG diretamente, sem
   * renderizar o React a cada quadro, e mantém o controle sincronizado.
   */
  const paint = useCallback((angle: number) => {
    const root = layersRef.current;
    if (!root) return;
    const geo = geometryAt(angle);

    geo.layers.forEach((layer, i) => {
      const g = root.children[i];
      if (!g) return;
      for (let j = 0; j < SIDES; j++) {
        const el = g.children[j];
        const face = layer.faces[j];
        if (face) {
          el.setAttribute('d', face.d);
          el.setAttribute('fill', face.fill);
          el.setAttribute('stroke', face.fill);
        } else {
          el.setAttribute('d', '');
        }
      }
      g.children[SIDES]?.setAttribute('d', layer.seam);
      g.children[SIDES + 1]?.setAttribute('d', layer.sheen);
    });

    const top = geo.layers[geo.layers.length - 1];
    capOuterRef.current?.setAttribute('d', top.cap.outer);
    capOuterRef.current?.setAttribute('fill', top.cap.fill);
    capOuterRef.current?.setAttribute('stroke', top.cap.rim);
    capInnerRef.current?.setAttribute('d', top.cap.inner);

    const deg = Math.round(angle) % 360;
    const range = rangeRef.current;
    if (range) {
      if (range.value !== String(deg)) range.value = String(deg);
      range.style.setProperty('--pct', `${(deg / 359) * 100}%`);
      range.setAttribute('aria-valuetext', valueText(deg));
    }
    const text = outputRef.current?.firstChild;
    if (text) text.nodeValue = `${deg}°`;
  }, []);

  // Fim da entrada: a classe sai e o giro começa (se estiver ativado).
  useEffect(() => {
    const timer = window.setTimeout(() => setIntro(false), START_MS + total * LAYER_MS + 500);
    return () => window.clearTimeout(timer);
  }, [total]);

  // Com movimento reduzido, o vaso fica parado até o visitante pedir o giro.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) setPlaying(false);
    const onChange = () => mq.matches && setPlaying(false);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Fora da tela, o giro para para economizar processamento e bateria.
  useEffect(() => {
    const el = figureRef.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const spinning = playing && !intro && visible;

  useEffect(() => {
    if (!spinning) return;
    let raf = 0;
    let last = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const dt = last ? Math.min(64, now - last) : 0;
      last = now;
      const t = Math.min(1, (now - start) / RAMP_MS);
      const ease = t * t * (3 - 2 * t);
      angleRef.current = (angleRef.current + (SPEED * ease * dt) / 1000) % 360;
      paint(angleRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [spinning, paint]);

  /** O visitante assumiu o controle: o giro automático pausa. */
  const takeControl = () => {
    setIntro(false);
    setPlaying(false);
  };

  const style = {
    '--layer-ms': `${LAYER_MS}ms`,
    '--start-ms': `${START_MS}ms`,
    '--intro-ms': `${total * LAYER_MS}ms`,
  } as CSSProperties;

  return (
    <figure ref={figureRef} className={`vase${intro ? ' is-intro' : ''}`} style={style}>
      <div className="vase__stage">
        <svg className="vase__svg" viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} role="img" aria-labelledby={`${id}-title`}>
          <title id={`${id}-title`}>Ilustração de um vaso geométrico impresso em camadas.</title>
          <style>{NOZZLE_KEYFRAMES}</style>
          <defs>
            <radialGradient id={`${id}-plate`} cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#1d1d29" />
              <stop offset="100%" stopColor="#101017" />
            </radialGradient>
            <radialGradient id={`${id}-shadow`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#000" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#000" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`${id}-inside`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#030305" />
              <stop offset="100%" stopColor="#1a1426" />
            </linearGradient>
            <clipPath id={`${id}-plate-clip`}>
              <ellipse cx="300" cy="590" rx="252" ry="68" />
            </clipPath>
          </defs>

          {/* Mesa de impressão */}
          <g className="vase__plate" aria-hidden="true">
            <ellipse cx="300" cy="598" rx="252" ry="68" fill="#0b0b10" />
            <ellipse cx="300" cy="590" rx="252" ry="68" fill={`url(#${id}-plate)`} stroke="rgba(255,255,255,0.09)" />
            <g clipPath={`url(#${id}-plate-clip)`} stroke="rgba(255,255,255,0.05)" strokeWidth="1">
              {Array.from({ length: 13 }, (_, i) => {
                const x = 48 + i * 42;
                return <line key={`v${i}`} x1={x} y1="510" x2={x + (x - 300) * 0.25} y2="670" />;
              })}
              {Array.from({ length: 7 }, (_, i) => {
                const y = 530 + i * 19;
                return <line key={`h${i}`} x1="40" y1={y} x2="560" y2={y} />;
              })}
            </g>
            <ellipse cx="300" cy="590" rx="170" ry="40" fill={`url(#${id}-shadow)`} />
          </g>

          {/* Guia: contorno da peça, visível enquanto ela se forma */}
          <g className="vase__ghost" aria-hidden="true">
            <path d={INITIAL.ghostRings} />
            <path d={INITIAL.silhouette} className="vase__outline" />
          </g>

          {/* Camadas: cada grupo tem 6 faces (as escondidas ficam vazias), a junta e o brilho */}
          <g ref={layersRef} className="vase__layers" aria-hidden="true">
            {INITIAL.layers.map((layer, i) => (
              <g key={i} className="vase__layer" style={{ '--i': i } as CSSProperties}>
                {Array.from({ length: SIDES }, (_, j) => {
                  const face = layer.faces[j];
                  return (
                    <path
                      key={j}
                      d={face?.d ?? ''}
                      fill={face?.fill ?? 'none'}
                      stroke={face?.fill ?? 'none'}
                      strokeWidth="0.6"
                    />
                  );
                })}
                <path className="vase__seam" d={layer.seam} />
                <path className="vase__sheen" d={layer.sheen} />
              </g>
            ))}
          </g>

          {/* Boca do vaso, mostrando a parede da peça */}
          <g className="vase__cap" aria-hidden="true">
            <path ref={capOuterRef} d={TOP.cap.outer} fill={TOP.cap.fill} stroke={TOP.cap.rim} strokeWidth="1" />
            <path ref={capInnerRef} d={TOP.cap.inner} fill={`url(#${id}-inside)`} />
          </g>

          {/* Régua de altura */}
          <g className="vase__ruler" aria-hidden="true">
            <line x1={RULER_X} y1={BASE_Y} x2={RULER_X} y2={TOP.y} />
            {TICKS.map((t) => (
              <line key={t.y} x1={RULER_X} x2={RULER_X + (t.major ? 14 : 8)} y1={t.y} y2={t.y} />
            ))}
            <path className="vase__marker" d={`M${RULER_X - 4} ${TOP.y}l-10 -6v12z`} />
          </g>

          {/* Bico de impressão, visível só durante a formação */}
          <g
            className="vase__nozzle"
            aria-hidden="true"
            style={{ transform: `translate(${TOP.front[0]}px, ${TOP.front[1]}px)` }}
          >
            <line x1="0" y1="-210" x2="0" y2="-74" className="vase__filament" />
            <rect x="-30" y="-96" width="60" height="16" rx="3" className="vase__sink" />
            <rect x="-24" y="-80" width="48" height="30" rx="4" className="vase__block" />
            <path d="M-11 -50h22l-7 34h-8z" className="vase__tip" />
            <circle cx="0" cy="-12" r="3" className="vase__melt" />
          </g>
        </svg>
      </div>

      <div className="vase__control">
        <div className="vase__control-row">
          <label htmlFor={`${id}-range`}>{demo.label}</label>
          <output ref={outputRef} htmlFor={`${id}-range`} aria-live="off">
            0°
          </output>
        </div>
        <input
          ref={rangeRef}
          id={`${id}-range`}
          type="range"
          min={0}
          max={359}
          step={1}
          defaultValue={0}
          aria-valuetext={valueText(0)}
          style={{ '--pct': '0%' } as CSSProperties}
          onPointerDown={takeControl}
          onChange={(e) => {
            takeControl();
            angleRef.current = Number(e.currentTarget.value);
            paint(angleRef.current);
          }}
        />
        {/* Legenda só para leitores de tela: identifica a cena como demonstração. */}
        <figcaption className="visually-hidden">{demo.caption}</figcaption>
      </div>
    </figure>
  );
}