import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import type { SiteContent } from '../data/types';
import type { PrinterScene } from '../three/printerScene';
import { LayerVase } from './LayerVase';

type Demo = SiteContent['hero']['demo'];
type Mode = 'pending' | '3d' | 'fallback';

const RING_R = 34;
const RING_LEN = 2 * Math.PI * RING_R;

/** Versão realista (WebGL): impressora imprimindo o vaso, que depois gira. */
function Printer3D({ demo, onFail }: { demo: Demo; onFail: () => void }) {
  const id = useId();
  const figureRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rangeRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLOutputElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const sceneRef = useRef<PrinterScene | null>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [done, setDone] = useState(false);

  /** Mantém o controle deslizante igual ao ângulo da peça, sem renderizar o React a cada quadro. */
  const syncAngle = useCallback((deg: number) => {
    const range = rangeRef.current;
    if (range) {
      if (range.value !== String(deg)) range.value = String(deg);
      range.style.setProperty('--pct', `${(deg / 359) * 100}%`);
      range.setAttribute('aria-valuetext', `${deg} graus`);
    }
    const text = outputRef.current?.firstChild;
    if (text) text.nodeValue = `${deg}°`;
  }, []);

  const syncProgress = useCallback((p: number) => {
    ringRef.current?.setAttribute('stroke-dashoffset', String(RING_LEN * (1 - p)));
    const text = pctRef.current?.firstChild;
    if (text) text.nodeValue = `${Math.round(p * 100)}%`;
    if (p >= 1) setDone(true);
  }, []);

  // Carrega o three.js só no navegador e só aqui.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !document.documentElement.classList.contains('webgl')) return;
    let cancelled = false;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setPlaying(false);
      syncProgress(1);
    }
    import('../three/printerScene')
      .then(({ createPrinterScene }) => {
        if (cancelled) return;
        sceneRef.current = createPrinterScene(canvas, {
          reducedMotion: reduced,
          autoRotate: !reduced,
          onAngle: syncAngle,
          onProgress: syncProgress,
          onUserRotate: () => setPlaying(false),
          onReady: () => setReady(true),
          onError: onFail,
        });
      })
      .catch(() => !cancelled && onFail());
    return () => {
      cancelled = true;
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [onFail, syncAngle, syncProgress]);

  useEffect(() => {
    sceneRef.current?.setAutoRotate(playing);
  }, [playing]);

  // Fora da tela, a cena para de ser desenhada.
  useEffect(() => {
    const el = figureRef.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([entry]) => sceneRef.current?.setVisible(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <figure ref={figureRef} className="vase printer3d">
      <div className="printer3d__stage" data-ready={ready}>
        <canvas
          ref={canvasRef}
          className="printer3d__canvas"
          role="img"
          aria-label="Ilustração 3D de uma impressora imprimindo um vaso geométrico, camada por camada."
        />
        <div className={`printer3d__ring${done ? ' is-done' : ''}`} aria-hidden="true">
          <svg viewBox="0 0 80 80">
            <defs>
              <linearGradient id={`${id}-ring`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#00C8F8" />
                <stop offset="0.5" stopColor="#7C3AED" />
                <stop offset="1" stopColor="#D10BE8" />
              </linearGradient>
            </defs>
            <circle className="printer3d__ring-track" cx="40" cy="40" r={RING_R} />
            <circle
              ref={ringRef}
              className="printer3d__ring-bar"
              cx="40"
              cy="40"
              r={RING_R}
              stroke={`url(#${id}-ring)`}
              strokeDasharray={RING_LEN}
              strokeDashoffset={RING_LEN}
            />
          </svg>
          <span className="printer3d__pct" ref={pctRef}>
            0%
          </span>
          <span className="printer3d__status">{done ? demo.done : demo.printing}</span>
        </div>
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
          aria-valuetext="0 graus"
          style={{ '--pct': '0%' } as CSSProperties}
          onPointerDown={() => setPlaying(false)}
          onChange={(e) => {
            setPlaying(false);
            sceneRef.current?.setAngle(Number(e.currentTarget.value));
            syncAngle(Number(e.currentTarget.value));
          }}
        />
        {/* Legenda só para leitores de tela: identifica a cena como demonstração. */}
        <figcaption className="visually-hidden">{demo.caption}</figcaption>
      </div>
    </figure>
  );
}

/**
 * Abertura: usa a cena 3D quando o navegador tem WebGL 2 e, se não tiver (ou
 * se algo falhar), a versão em SVG. Sem JavaScript, o HTML pré-renderizado
 * mostra a versão em SVG.
 */
export function HeroVisual({ demo }: { demo: Demo }) {
  const [mode, setMode] = useState<Mode>('pending');

  const fail = useCallback(() => {
    document.documentElement.classList.remove('webgl');
    setMode('fallback');
  }, []);

  useEffect(() => {
    setMode(document.documentElement.classList.contains('webgl') ? '3d' : 'fallback');
  }, []);

  return (
    <>
      {mode !== 'fallback' ? <Printer3D demo={demo} onFail={fail} /> : null}
      <div className="hero-fallback">{mode !== '3d' ? <LayerVase demo={demo} /> : null}</div>
    </>
  );
}