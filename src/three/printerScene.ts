/**
 * Cena 3D da impressora, com vaso geométrico sendo impresso em camadas.
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

/* ==========================================================================
   Ajustes rápidos
   ========================================================================== */
const SLOW = import.meta.env.DEV ? Number(new URLSearchParams(window.location.search).get('lento')) || 1 : 1;
const PRINT_MS = 8000 * SLOW; // duração da impressão de demonstração
const PARK_MS = 900; // tempo para o bico se afastar ao terminar
const SPEED = 24; // giro automático, em graus por segundo
const RAMP_MS = 900; // aceleração do giro
const DRAG_DEG_PER_PX = 0.45; // sensibilidade ao arrastar a peça

const H = 1.6; // altura do vaso
const LAYERS = 118; // camadas visíveis
const LAYER_H = H / LAYERS;
const WALL = 0.032; // espessura da parede
const FLOOR = 0.045; // espessura do fundo
const TWIST = (64 * Math.PI) / 180;
const SIDES = 6;
const ARC = 4; // segmentos do arredondamento de cada canto
const ROWS = 96;
const NOZZLE_DROP = 0.37; // distância da viga até a ponta do bico

/** Perfil do vaso: [altura relativa, raio]. */
const PROFILE: Array<[number, number]> = [
  [0, 0.33],
  [0.16, 0.455],
  [0.38, 0.53],
  [0.6, 0.468],
  [0.8, 0.342],
  [0.93, 0.348],
  [1, 0.376],
];

/** Gradiente do símbolo da marca, de baixo para cima. */
const STOPS: Array<[number, THREE.Color]> = [
  [0, new THREE.Color('#00C8F8')],
  [0.36, new THREE.Color('#087BFF')],
  [0.7, new THREE.Color('#7C3AED')],
  [1, new THREE.Color('#D10BE8')],
];

/* ==========================================================================
   Tipos públicos
   ========================================================================== */
export interface PrinterSceneOptions {
  reducedMotion: boolean;
  autoRotate: boolean;
  /** Ângulo atual (0–359), chamado a cada mudança. */
  onAngle: (deg: number) => void;
  /** Progresso da impressão (0–1). */
  onProgress: (p: number) => void;
  /** O visitante arrastou a peça: o giro automático deve pausar. */
  onUserRotate: () => void;
  /** Primeiro quadro desenhado. */
  onReady: () => void;
  /** O WebGL falhou ou foi perdido. */
  onError: () => void;
}

export interface PrinterScene {
  setAngle: (deg: number) => void;
  setAutoRotate: (on: boolean) => void;
  setVisible: (on: boolean) => void;
  dispose: () => void;
}

/* ==========================================================================
   Utilidades
   ========================================================================== */
function sampleProfile(t: number): number {
  const p = PROFILE;
  const n = p.length;
  if (t <= p[0][0]) return p[0][1];
  if (t >= p[n - 1][0]) return p[n - 1][1];
  let i = 0;
  while (i < n - 2 && t > p[i + 1][0]) i++;
  const [t0, v0] = p[i];
  const [t1, v1] = p[i + 1];
  const slope = (k: number) => {
    const a = p[Math.max(0, k - 1)];
    const b = p[Math.min(n - 1, k + 1)];
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

function colorAt(t: number, target = new THREE.Color()): THREE.Color {
  for (let i = 1; i < STOPS.length; i++) {
    const [p1, c1] = STOPS[i];
    const [p0, c0] = STOPS[i - 1];
    if (t <= p1) return target.copy(c0).lerp(c1, (t - p0) / (p1 - p0));
  }
  return target.copy(STOPS[STOPS.length - 1][1]);
}

/** Pontos do contorno (hexágono de cantos arredondados, torcido) na altura relativa t. */
function ringPoints(t: number, inset: number): Array<[number, number]> {
  const R = sampleProfile(t) - inset;
  const rc = R * 0.085;
  const d = R - rc / Math.cos(Math.PI / SIDES);
  const theta = TWIST * t;
  const pts: Array<[number, number]> = [];
  for (let k = 0; k < SIDES; k++) {
    const a = theta + (k / SIDES) * Math.PI * 2;
    const cx = Math.cos(a) * d;
    const cz = Math.sin(a) * d;
    for (let s = 0; s <= ARC; s++) {
      const phi = a - Math.PI / SIDES + ((2 * Math.PI) / SIDES) * (s / ARC);
      pts.push([cx + Math.cos(phi) * rc, cz + Math.sin(phi) * rc]);
    }
  }
  return pts;
}

const RING_N = SIDES * (ARC + 1);

/* ==========================================================================
   Vaso
   ========================================================================== */
function buildVaseGeometry(): THREE.BufferGeometry {
  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  const c = new THREE.Color();

  const addSurface = (t0: number, inset: number, shade: number, flip: boolean) => {
    const start = pos.length / 3;
    for (let i = 0; i <= ROWS; i++) {
      const t = t0 + (1 - t0) * (i / ROWS);
      colorAt(t, c).multiplyScalar(shade);
      for (const [x, z] of ringPoints(t, inset)) {
        pos.push(x, t * H, z);
        col.push(c.r, c.g, c.b);
      }
    }
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < RING_N; j++) {
        const a = start + i * RING_N + j;
        const b = start + i * RING_N + ((j + 1) % RING_N);
        const a2 = a + RING_N;
        const b2 = b + RING_N;
        if (flip) idx.push(a, b, a2, b, b2, a2);
        else idx.push(a, a2, b, b, a2, b2);
      }
    }
    return start;
  };

  // Disco (fundo ou piso interno) ligando um anel ao centro.
  const addDisc = (t: number, inset: number, y: number, up: boolean, shade: number) => {
    colorAt(t, c).multiplyScalar(shade);
    const center = pos.length / 3;
    pos.push(0, y, 0);
    col.push(c.r, c.g, c.b);
    const start = pos.length / 3;
    for (const [x, z] of ringPoints(t, inset)) {
      pos.push(x, y, z);
      col.push(c.r, c.g, c.b);
    }
    for (let j = 0; j < RING_N; j++) {
      const a = start + j;
      const b = start + ((j + 1) % RING_N);
      if (up) idx.push(center, b, a);
      else idx.push(center, a, b);
    }
  };

  const outer = addSurface(0, 0, 1, false);
  const inner = addSurface(FLOOR / H, WALL, 0.42, true);

  // Borda superior, ligando as paredes externa e interna.
  const topOuter = outer + ROWS * RING_N;
  const topInner = inner + ROWS * RING_N;
  const rimStart = pos.length / 3;
  for (let j = 0; j < RING_N; j++) {
    for (const src of [topOuter + j, topInner + j]) {
      pos.push(pos[src * 3], pos[src * 3 + 1], pos[src * 3 + 2]);
      col.push(col[src * 3], col[src * 3 + 1], col[src * 3 + 2]);
    }
  }
  for (let j = 0; j < RING_N; j++) {
    const o = rimStart + j * 2;
    const n = rimStart + ((j + 1) % RING_N) * 2;
    idx.push(o, o + 1, n, n, o + 1, n + 1);
  }

  addDisc(0, 0, 0, false, 0.8);
  addDisc(FLOOR / H, WALL, FLOOR, true, 0.5);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

interface PrintUniforms {
  uPrintY: { value: number };
  uHot: { value: number };
}

/** Material de PLA “seda”, com linhas de camada, corte na altura impressa e brilho na camada atual. */
function makePrintMaterial(uniforms: PrintUniforms): THREE.MeshPhysicalMaterial {
  const mat = new THREE.MeshPhysicalMaterial({
    vertexColors: true,
    roughness: 0.36,
    metalness: 0.12,
    clearcoat: 0.3,
    clearcoatRoughness: 0.28,
  });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uPrintY = uniforms.uPrintY;
    shader.uniforms.uHot = uniforms.uHot;
    shader.uniforms.uLayer = { value: LAYER_H };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float vLayerY;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvLayerY = transformed.y;');
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying float vLayerY;\nuniform float uPrintY;\nuniform float uHot;\nuniform float uLayer;',
      )
      .replace(
        '#include <clipping_planes_fragment>',
        '#include <clipping_planes_fragment>\nif ( vLayerY > uPrintY ) discard;\nfloat layerPh = vLayerY / uLayer * 6.2831853;\nfloat layerAA = 1.0 - smoothstep( 0.8, 2.6, fwidth( layerPh ) );',
      )
      .replace(
        '#include <color_fragment>',
        '#include <color_fragment>\ndiffuseColor.rgb *= 1.0 - 0.3 * layerAA * smoothstep( 0.1, 1.0, -cos( layerPh ) );',
      )
      .replace(
        '#include <normal_fragment_maps>',
        '#include <normal_fragment_maps>\nvec3 layerUp = normalize( ( viewMatrix * vec4( 0.0, 1.0, 0.0, 0.0 ) ).xyz );\nnormal = normalize( normal + layerUp * sin( layerPh ) * 0.62 * layerAA );',
      )
      .replace(
        '#include <emissivemap_fragment>',
        '#include <emissivemap_fragment>\nfloat layerHot = smoothstep( uPrintY - uLayer * 3.0, uPrintY, vLayerY ) * uHot;\ntotalEmissiveRadiance += diffuseColor.rgb * layerHot * 2.4 + vec3( 1.0, 0.8, 0.6 ) * layerHot * 0.35;',
      );
  };
  return mat;
}

/** Anel que fecha a parede na altura impressa (mostra a espessura da peça em corte). */
function makeCap(): { mesh: THREE.Mesh; update: (y: number) => void } {
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(RING_N * 2 * 3);
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const normals = new Float32Array(RING_N * 2 * 3);
  for (let i = 0; i < RING_N * 2; i++) normals[i * 3 + 1] = 1;
  geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  const idx: number[] = [];
  for (let j = 0; j < RING_N; j++) {
    const o = j * 2;
    const n = ((j + 1) % RING_N) * 2;
    idx.push(o, o + 1, n, n, o + 1, n + 1);
  }
  geo.setIndex(idx);
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.1 });
  const mesh = new THREE.Mesh(geo, mat);
  const c = new THREE.Color();
  const update = (y: number) => {
    const t = Math.min(1, y / H);
    const outer = ringPoints(t, 0);
    const inner = ringPoints(t, WALL);
    for (let j = 0; j < RING_N; j++) {
      positions.set([outer[j][0], y, outer[j][1], inner[j][0], y, inner[j][1]], j * 6);
    }
    geo.attributes.position.needsUpdate = true;
    geo.computeBoundingSphere();
    colorAt(t, c);
    mat.color.copy(c);
    mat.emissive.copy(c).multiplyScalar(2.2);
  };
  return { mesh, update };
}

/* ==========================================================================
   Impressora
   ========================================================================== */
function bedTexture(): THREE.CanvasTexture {
  const size = 1024;
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const g = cv.getContext('2d')!;
  g.fillStyle = '#121318';
  g.fillRect(0, 0, size, size);
  // textura de PEI: pontinhos claros e escuros
  for (let i = 0; i < 26000; i++) {
    const v = Math.random();
    g.fillStyle = v > 0.5 ? `rgba(255,255,255,${0.025 + Math.random() * 0.04})` : `rgba(0,0,0,${0.15 + Math.random() * 0.2})`;
    g.fillRect(Math.random() * size, Math.random() * size, 1.6, 1.6);
  }
  // grade de referência discreta
  g.strokeStyle = 'rgba(255,255,255,0.06)';
  g.lineWidth = 1.5;
  for (let i = 1; i < 12; i++) {
    const p = (i / 12) * size;
    g.beginPath();
    g.moveTo(p, 0);
    g.lineTo(p, size);
    g.moveTo(0, p);
    g.lineTo(size, p);
    g.stroke();
  }
  g.strokeStyle = 'rgba(0,200,248,0.18)';
  g.lineWidth = 3;
  g.strokeRect(size * 0.04, size * 0.04, size * 0.92, size * 0.92);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function glowTexture(): THREE.CanvasTexture {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 64;
  const g = cv.getContext('2d')!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.35, 'rgba(255,255,255,0.35)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(cv);
}

interface Printer {
  group: THREE.Group;
  gantry: THREE.Group;
  head: THREE.Group;
  nozzleLight: THREE.PointLight;
  nozzleGlow: THREE.Mesh;
  fan: THREE.Group;
}

function buildPrinter(): Printer {
  const group = new THREE.Group();
  const frameMat = new THREE.MeshStandardMaterial({ color: '#23252d', metalness: 0.85, roughness: 0.36 });
  const darkMat = new THREE.MeshStandardMaterial({ color: '#111116', metalness: 0.25, roughness: 0.55 });
  const steelMat = new THREE.MeshStandardMaterial({ color: '#9fa3ad', metalness: 0.8, roughness: 0.5 });
  const aluMat = new THREE.MeshStandardMaterial({ color: '#8d919c', metalness: 0.9, roughness: 0.35 });

  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = group) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  };

  // Mesa: chapa texturizada sobre a base aquecida
  const bedMat = new THREE.MeshStandardMaterial({ map: bedTexture(), metalness: 0.15, roughness: 0.72 });
  add(new RoundedBoxGeometry(2.5, 0.05, 2.5, 2, 0.02), bedMat, 0, -0.025, 0);
  add(new RoundedBoxGeometry(2.58, 0.035, 2.58, 2, 0.012), aluMat, 0, -0.07, 0);
  add(new RoundedBoxGeometry(3.05, 0.2, 2.95, 3, 0.05), darkMat, 0, -0.19, 0);

  // Faixa de LED na frente da base, com as cores da marca
  const ledGeo = new THREE.BoxGeometry(2.3, 0.022, 0.012, 48, 1, 1);
  const ledColors: number[] = [];
  const lc = new THREE.Color();
  const lp = ledGeo.attributes.position;
  for (let i = 0; i < lp.count; i++) {
    colorAt((lp.getX(i) + 1.15) / 2.3, lc).multiplyScalar(2.6);
    ledColors.push(lc.r, lc.g, lc.b);
  }
  ledGeo.setAttribute('color', new THREE.Float32BufferAttribute(ledColors, 3));
  const led = new THREE.Mesh(ledGeo, new THREE.MeshBasicMaterial({ vertexColors: true }));
  led.position.set(0, -0.19, 1.477);
  group.add(led);

  // Colunas do eixo Z, barra superior e fusos
  const colGeo = new THREE.BoxGeometry(0.1, 2.75, 0.1);
  add(colGeo, frameMat, -1.42, 1.28, -0.12);
  add(colGeo, frameMat, 1.42, 1.28, -0.12);
  add(new THREE.BoxGeometry(2.94, 0.1, 0.1), frameMat, 0, 2.7, -0.12);
  const screwGeo = new THREE.CylinderGeometry(0.014, 0.014, 2.6, 10);
  add(screwGeo, steelMat, -1.27, 1.25, -0.12);
  add(screwGeo, steelMat, 1.27, 1.25, -0.12);

  // Viga do eixo X (sobe com a impressão)
  const gantry = new THREE.Group();
  group.add(gantry);
  add(new THREE.BoxGeometry(2.78, 0.075, 0.075), frameMat, 0, 0, -0.12, gantry);
  const blockMat = new THREE.MeshStandardMaterial({ color: '#16161c', metalness: 0.1, roughness: 0.7 });
  const sideBlock = new THREE.BoxGeometry(0.2, 0.2, 0.18);
  add(sideBlock, blockMat, -1.42, 0, -0.12, gantry);
  add(sideBlock, blockMat, 1.42, 0, -0.12, gantry);

  // Cabeçote: carcaça, ventoinha, bloco aquecedor e bico de latão
  const head = new THREE.Group();
  gantry.add(head);
  add(new RoundedBoxGeometry(0.36, 0.42, 0.26, 3, 0.04), darkMat, 0, -0.04, 0.03, head);
  const fan = new THREE.Group();
  fan.position.set(0, -0.05, 0.165);
  head.add(fan);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.012, 8, 40), frameMat);
  fan.add(ring);
  for (let i = 0; i < 7; i++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.03, 0.006), darkMat);
    blade.rotation.z = (i / 7) * Math.PI * 2;
    blade.position.set(Math.cos(blade.rotation.z) * 0.055, Math.sin(blade.rotation.z) * 0.055, 0);
    blade.rotation.x = 0.4;
    fan.add(blade);
  }
  fan.add(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 20).rotateX(Math.PI / 2), frameMat));
  add(new THREE.BoxGeometry(0.14, 0.07, 0.11), aluMat, 0, -0.29, 0, head);
  const nozzle = add(new THREE.ConeGeometry(0.045, 0.075, 6), new THREE.MeshStandardMaterial({ color: '#c99a45', metalness: 1, roughness: 0.28 }), 0, -0.3625, 0, head);
  nozzle.rotation.x = Math.PI;
  const nozzleGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.012, 12, 12),
    new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffb070').multiplyScalar(4) }),
  );
  nozzleGlow.position.set(0, -NOZZLE_DROP + 0.003, 0);
  head.add(nozzleGlow);
  const nozzleLight = new THREE.PointLight('#ff9d4d', 0, 0.9, 2);
  nozzleLight.position.set(0, -NOZZLE_DROP - 0.02, 0.02);
  head.add(nozzleLight);

  // Tubo de filamento saindo do topo do cabeçote
  const tubePath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.17, 0),
    new THREE.Vector3(0.02, 0.5, -0.05),
    new THREE.Vector3(0.18, 0.95, -0.3),
    new THREE.Vector3(0.5, 1.4, -0.7),
  ]);
  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(tubePath, 40, 0.022, 10),
    new THREE.MeshPhysicalMaterial({ color: '#e8ecf3', roughness: 0.3, transmission: 0.2, thickness: 0.05 }),
  );
  tube.castShadow = true;
  head.add(tube);

  return { group, gantry, head, nozzleLight, nozzleGlow, fan };
}

/* ==========================================================================
   Cena
   ========================================================================== */
export function createPrinterScene(canvas: HTMLCanvasElement, options: PrinterSceneOptions): PrinterScene {
  const narrow = Math.min(window.innerWidth, window.innerHeight) < 700;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, narrow ? 1.6 : 1.75));
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#08080b');
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envTarget.texture;
  scene.environmentIntensity = 0.3;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 40);
  const target = new THREE.Vector3(0, 0.98, 0);

  // Luzes: principal quente, contraluzes ciano e magenta, preenchimento suave
  const key = new THREE.DirectionalLight('#fff1e4', 2.4);
  key.position.set(-2.6, 4.2, 3.4);
  key.castShadow = true;
  key.shadow.mapSize.set(narrow ? 1024 : 2048, narrow ? 1024 : 2048);
  key.shadow.camera.left = -2.2;
  key.shadow.camera.right = 2.2;
  key.shadow.camera.top = 2.6;
  key.shadow.camera.bottom = -1.2;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  key.shadow.radius = 4;
  scene.add(key);
  const rimCyan = new THREE.PointLight('#00c8f8', 34, 0, 2);
  rimCyan.position.set(-2.4, 2.1, -3.0);
  scene.add(rimCyan);
  const rimMagenta = new THREE.PointLight('#d10be8', 34, 0, 2);
  rimMagenta.position.set(2.7, 2.3, -2.8);
  scene.add(rimMagenta);
  const fill = new THREE.DirectionalLight('#7aa7ff', 0.35);
  fill.position.set(2, 0.6, 4);
  scene.add(fill);

  // Sombra no “chão” sob a impressora
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ opacity: 0.45 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.29;
  ground.receiveShadow = true;
  scene.add(ground);

  const printer = buildPrinter();
  scene.add(printer.group);

  // Peça
  const uniforms: PrintUniforms = { uPrintY: { value: 0 }, uHot: { value: 1 } };
  const vase = new THREE.Mesh(buildVaseGeometry(), makePrintMaterial(uniforms));
  vase.castShadow = true;
  vase.receiveShadow = true;
  const piece = new THREE.Group();
  piece.add(vase);
  const cap = makeCap();
  piece.add(cap.mesh);
  scene.add(piece);

  // Partículas discretas no ar
  const particleCount = narrow ? 36 : 64;
  const pPos = new Float32Array(particleCount * 3);
  const pCol = new Float32Array(particleCount * 3);
  const pSpeed = new Float32Array(particleCount);
  const pc = new THREE.Color();
  for (let i = 0; i < particleCount; i++) {
    pPos.set([(Math.random() - 0.5) * 3, Math.random() * 2.4, -0.4 - Math.random() * 1.2], i * 3);
    colorAt(Math.random(), pc).multiplyScalar(1.6);
    pCol.set([pc.r, pc.g, pc.b], i * 3);
    pSpeed[i] = 0.04 + Math.random() * 0.08;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
  const particles = new THREE.Points(
    pGeo,
    new THREE.PointsMaterial({
      size: 0.022,
      map: glowTexture(),
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  scene.add(particles);

  // Pós-processamento: brilho apenas nas partes mais luminosas
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.5, 0.55, 0.9);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  /* ---------------- Estado ---------------- */
  const reduced = options.reducedMotion;
  let printStart = -1;
  let progress = reduced ? 1 : 0;
  let introDone = reduced;
  let parkStart = -1;
  let angle = 0;
  let autoRotate = options.autoRotate && !reduced;
  let spinStart = -1;
  let visible = true;
  let raf = 0;
  let last = 0;
  let ready = false;
  let disposed = false;
  let lastAngleSent = -1;
  let dragging = false;
  let dragX = 0;

  const PARK = { x: 1.05, y: 2.32 };

  const setPrintHeight = (p: number) => {
    const layer = Math.min(LAYERS, Math.ceil(p * LAYERS));
    const y = layer * LAYER_H;
    uniforms.uPrintY.value = p >= 1 ? H + 0.01 : y;
    cap.mesh.visible = p > 0 && p < 1;
    if (cap.mesh.visible) cap.update(y);
    return y;
  };

  const placeHead = (now: number, y: number) => {
    if (!introDone && progress < 1) {
      const r = sampleProfile(Math.min(1, y / H));
      const sweep = Math.sin(now / 160) * r;
      printer.gantry.position.y = y + NOZZLE_DROP + 0.006;
      printer.head.position.x = sweep;
      printer.nozzleLight.intensity = 1.2;
      printer.nozzleGlow.visible = true;
      uniforms.uHot.value = 1;
      return;
    }
    if (parkStart < 0) parkStart = now;
    const k = reduced ? 1 : Math.min(1, (now - parkStart) / PARK_MS);
    const e = k * k * (3 - 2 * k);
    const fromY = H + NOZZLE_DROP;
    printer.gantry.position.y = fromY + (PARK.y - fromY) * e;
    printer.head.position.x = printer.head.position.x + (PARK.x - printer.head.position.x) * Math.min(1, e * 0.35 + 0.02);
    printer.nozzleLight.intensity = 1.2 * (1 - e);
    printer.nozzleGlow.visible = e < 0.98;
    uniforms.uHot.value = 1 - e;
    if (k >= 1 && !introDone) introDone = true;
  };

  const frame = (now: number) => {
    const dt = last ? Math.min(64, now - last) : 0;
    last = now;

    if (!reduced && progress < 1) {
      if (printStart < 0) printStart = now;
      progress = Math.min(1, (now - printStart) / PRINT_MS);
      options.onProgress(progress);
    }
    const y = setPrintHeight(progress);
    placeHead(now, y);

    if (introDone && autoRotate) {
      if (spinStart < 0) spinStart = now;
      const t = Math.min(1, (now - spinStart) / RAMP_MS);
      angle = (angle + (SPEED * t * t * (3 - 2 * t) * dt) / 1000) % 360;
    }
    piece.rotation.y = (-angle * Math.PI) / 180;
    const rounded = Math.round(angle) % 360;
    if (rounded !== lastAngleSent) {
      lastAngleSent = rounded;
      options.onAngle(rounded);
    }

    if (!reduced) {
      printer.fan.rotation.z -= dt * 0.03;
      const arr = pGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        arr[i * 3 + 1] += pSpeed[i] * (dt / 1000);
        if (arr[i * 3 + 1] > 2.5) arr[i * 3 + 1] = 0;
      }
      pGeo.attributes.position.needsUpdate = true;
    }

    composer.render();
    if (!ready) {
      ready = true;
      options.onReady();
    }
  };

  const needsLoop = () => visible && (!introDone || autoRotate || dragging);

  const loop = (now: number) => {
    raf = 0;
    if (disposed) return;
    frame(now);
    if (needsLoop()) raf = requestAnimationFrame(loop);
    else last = 0;
  };

  const kick = () => {
    if (!raf && !disposed && visible) raf = requestAnimationFrame(loop);
  };

  /* ---------------- Tamanho ---------------- */
  const resize = () => {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    bloom.resolution.set(w / 2, h / 2);
    camera.aspect = w / h;
    // Enquadramento: mantém peça e cabeçote visíveis em qualquer proporção.
    const fitH = 2.45;
    const fitW = 2.2;
    const vFov = (camera.fov * Math.PI) / 180;
    const distH = fitH / 2 / Math.tan(vFov / 2);
    const distW = fitW / 2 / (Math.tan(vFov / 2) * camera.aspect);
    const dist = Math.max(distH, distW) * 1.08;
    const dir = new THREE.Vector3(0.34, 0.44, 1).normalize();
    camera.position.copy(target).addScaledVector(dir, dist);
    camera.lookAt(target);
    camera.updateProjectionMatrix();
    if (!raf) {
      last = 0;
      frame(performance.now());
    }
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  /* ---------------- Arrastar para girar ---------------- */
  const onDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    dragging = true;
    dragX = e.clientX;
    canvas.setPointerCapture(e.pointerId);
    autoRotate = false;
    options.onUserRotate();
    kick();
  };
  const onMove = (e: PointerEvent) => {
    if (!dragging) return;
    angle = (((angle - (e.clientX - dragX) * DRAG_DEG_PER_PX) % 360) + 360) % 360;
    dragX = e.clientX;
  };
  const onUp = () => {
    dragging = false;
  };
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);

  const onLost = (e: Event) => {
    e.preventDefault();
    options.onError();
  };
  canvas.addEventListener('webglcontextlost', onLost);

  resize();
  kick();

  return {
    setAngle(deg: number) {
      angle = ((deg % 360) + 360) % 360;
      lastAngleSent = Math.round(angle);
      if (!raf) {
        last = 0;
        frame(performance.now());
      }
    },
    setAutoRotate(on: boolean) {
      autoRotate = on;
      spinStart = -1;
      if (on) kick();
    },
    setVisible(on: boolean) {
      visible = on;
      if (on) kick();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('webglcontextlost', onLost);
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
        const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
        mats.forEach((m) => {
          Object.values(m).forEach((v) => v instanceof THREE.Texture && v.dispose());
          m.dispose();
        });
      });
      envTarget.dispose();
      composer.dispose();
      renderer.dispose();
    },
  };
}