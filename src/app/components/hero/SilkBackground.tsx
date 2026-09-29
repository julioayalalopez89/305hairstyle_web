import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

// Colores tal cual (sin gestión de color) para que el magenta salga igual que en el CSS.
THREE.ColorManagement.enabled = false;

// Fondo 3D del hero: mechones de "seda" dorada (pelo largo y lacio) que ondean.
// - Escritorio: el mechón se acerca al cursor.
// - Teléfono: se mueve al inclinar o sacudir el teléfono (giroscopio/acelerómetro),
//   sin tocar la pantalla. En iPhone Apple exige un toque una sola vez para dar permiso.

type Props = { className?: string };

type OrientationPermission = { requestPermission?: () => Promise<"granted" | "denied"> };

const VERTEX = /* glsl */ `
  uniform float uTime, uStrength, uYOff, uEnergy; uniform vec2 uMouse, uX;
  attribute vec2 aUV, aRib;
  varying vec3 vN, vT, vP; varying float vRib, vU;
  vec3 pos(float u, float v) {
    float r = aRib.x, seed = aRib.y, w = uTime;
    float amp = 1.0 + uEnergy;
    float x = mix(uX.x, uX.y, u);
    // el mechón cruza en diagonal con curva en S
    float y = mix(-1.9, 1.5, u) + sin(u * 3.1416) * 0.35 + uYOff;
    y += (r - 0.5) * 0.9 * (0.6 + 0.4 * sin(u * 3.1416));
    y += (sin(u * 5.0 - w * 0.9 + r * 2.0) * 0.26 + sin(u * 11.0 - w * 1.6 + seed * 6.0) * 0.04) * amp;
    float z = (r - 0.5) * 0.9 + cos(u * 4.0 - w * 0.7 + r * 3.0) * 0.25 * amp;
    // el cursor (o la inclinación del teléfono) atrae el mechón
    vec2 d = uMouse - vec2(x, y);
    float f = exp(-dot(d, d) * 2.2) * uStrength;
    y += d.y * f * 0.45; z += f * 0.5;
    // giro de la cinta para que brille al moverse
    float tw = sin(u * 6.0 - w * 1.1 + r * 5.0 + seed) * 1.1;
    float half_ = 0.045 * (0.6 + seed * 0.8);
    float s = (v - 0.5) * 2.0 * half_;
    return vec3(x, y + cos(tw) * s, z + sin(tw) * s);
  }
  void main() {
    vec3 p = pos(aUV.x, aUV.y);
    vec3 du = pos(aUV.x + 0.002, aUV.y) - p;
    vec3 dv = pos(aUV.x, aUV.y + 0.5) - pos(aUV.x, aUV.y - 0.5 + 1e-4);
    vT = normalize(du); vN = normalize(cross(du, dv));
    vRib = aRib.y; vU = aUV.x;
    vec4 mv = modelViewMatrix * vec4(p, 1.0); vP = mv.xyz;
    gl_Position = projectionMatrix * mv;
  }`;

const FRAGMENT = /* glsl */ `
  uniform vec3 cDeep, cMain, cGold; uniform float uFade;
  varying vec3 vN, vT, vP; varying float vRib, vU;
  void main() {
    vec3 N = normalize(vN), T = normalize(vT);
    vec3 V = normalize(-vP), L = normalize(vec3(0.4, 0.8, 1.0)), H = normalize(L + V);
    float diff = 0.45 + 0.55 * abs(dot(N, L));
    // brillo anisótropo (Kajiya-Kay), el reflejo típico del pelo
    float th = dot(T, H);
    float k = sqrt(max(0.0, 1.0 - th * th));
    float spec = pow(k, 90.0) * 0.9 + pow(k, 18.0) * 0.25;
    vec3 base = mix(cDeep, cMain, 0.35 + 0.65 * vRib);
    vec3 col = base * diff + cGold * spec;
    float a = smoothstep(0.0, 0.08, vU) * smoothstep(1.0, 0.9, vU) * uFade;
    gl_FragColor = vec4(col, a);
  }`;

function buildGeometry(ribbons: number, segU: number) {
  const segV = 2;
  const perRib = (segU + 1) * (segV + 1);
  const uv = new Float32Array(ribbons * perRib * 2);
  const rib = new Float32Array(ribbons * perRib * 2);
  const idx: number[] = [];
  let v = 0;
  for (let r = 0; r < ribbons; r++) {
    const seed = Math.random();
    const base = v;
    for (let j = 0; j <= segV; j++)
      for (let i = 0; i <= segU; i++) {
        uv[v * 2] = i / segU; uv[v * 2 + 1] = j / segV;
        rib[v * 2] = r / (ribbons - 1); rib[v * 2 + 1] = seed;
        v++;
      }
    for (let j = 0; j < segV; j++)
      for (let i = 0; i < segU; i++) {
        const a = base + j * (segU + 1) + i, b = a + 1, c = a + segU + 1, d = c + 1;
        idx.push(a, c, b, b, c, d);
      }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(v * 3), 3)); // se calcula en el shader
  g.setAttribute("aUV", new THREE.BufferAttribute(uv, 2));
  g.setAttribute("aRib", new THREE.BufferAttribute(rib, 2));
  g.setIndex(idx);
  return g;
}

export default function SilkBackground({ className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [needsMotionTap, setNeedsMotionTap] = useState(false);
  const enableMotionRef = useRef<() => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
    } catch {
      return; // sin WebGL: queda el degradado de fondo del hero
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
    camera.position.set(0, 0, 5);
    const halfH = Math.tan(THREE.MathUtils.degToRad(20)) * 5;

    const isSmall = window.matchMedia("(max-width: 767px)").matches;
    const geometry = buildGeometry(isSmall ? 50 : 70, isSmall ? 160 : 220);
    const uniforms = {
      uTime: { value: 0 }, uMouse: { value: new THREE.Vector2(10, 10) }, uStrength: { value: 0 },
      uEnergy: { value: 0 }, uX: { value: new THREE.Vector2(-1, 4) }, uYOff: { value: 0 },
      cDeep: { value: new THREE.Color("#241709") }, cMain: { value: new THREE.Color("#C9A45C") },
      cGold: { value: new THREE.Color("#FFF1CF") }, uFade: { value: 1 },
    };
    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX, fragmentShader: FRAGMENT, uniforms,
      side: THREE.DoubleSide, transparent: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    const scene = new THREE.Scene();
    scene.add(mesh);

    // ---- estado de entrada: cursor en escritorio, inclinación en teléfono ----
    const pointer = { x: 10, y: 10, tx: 10, ty: 10, s: 0, ts: 0 };
    const tilt = { x: 0, y: 0, tx: 0, ty: 0, active: false, baseB: NaN, baseG: NaN };
    let energy = 0;

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return; // en táctil manda el giroscopio
      const r = canvas.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = -(((e.clientY - r.top) / r.height) * 2 - 1);
      pointer.tx = nx * halfH * camera.aspect; pointer.ty = ny * halfH; pointer.ts = 1;
    };
    const onPointerLeave = () => { pointer.ts = 0; };

    const onOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return;
      // La primera lectura es la posición "neutra"; luego se re-centra despacio
      // para que funcione igual con el teléfono vertical o recostado.
      if (Number.isNaN(tilt.baseB)) { tilt.baseB = e.beta; tilt.baseG = e.gamma; }
      tilt.baseB += (e.beta - tilt.baseB) * 0.004;
      tilt.baseG += (e.gamma - tilt.baseG) * 0.004;
      tilt.tx = THREE.MathUtils.clamp((e.gamma - tilt.baseG) / 30, -1, 1);
      tilt.ty = THREE.MathUtils.clamp((e.beta - tilt.baseB) / 30, -1, 1);
      tilt.active = true;
    };
    const onMotion = (e: DeviceMotionEvent) => {
      const a = e.acceleration;
      if (!a || a.x == null || a.y == null || a.z == null) return;
      const m = Math.hypot(a.x, a.y, a.z);
      if (m > 1.5) energy = Math.min(1.5, energy + (m - 1.5) * 0.05); // sacudir = más ondas
    };

    const listenMotion = () => {
      window.addEventListener("deviceorientation", onOrientation);
      window.addEventListener("devicemotion", onMotion);
    };
    const DOE = window.DeviceOrientationEvent as unknown as OrientationPermission | undefined;
    const DME = window.DeviceMotionEvent as unknown as OrientationPermission | undefined;
    const touch = window.matchMedia("(pointer: coarse)").matches;
    if (touch && DOE && typeof DOE.requestPermission === "function") {
      // iPhone/iPad: el permiso solo se puede pedir tras un toque del usuario.
      setNeedsMotionTap(true);
      enableMotionRef.current = () => {
        Promise.all([DOE.requestPermission!(), DME?.requestPermission?.() ?? Promise.resolve("granted")])
          .then(([o]) => { if (o === "granted") listenMotion(); })
          .catch(() => {})
          .finally(() => setNeedsMotionTap(false));
      };
    } else if (touch) {
      listenMotion(); // Android: funciona directo
    }

    window.addEventListener("pointermove", onPointerMove);
    document.documentElement.addEventListener("pointerleave", onPointerLeave);

    const resize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
      const halfW = halfH * camera.aspect;
      if (camera.aspect > 1) { uniforms.uX.value.set(-halfW * 0.15, halfW * 1.15); uniforms.uYOff.value = 0; uniforms.uFade.value = 1; }
      else { uniforms.uX.value.set(-halfW * 1.2, halfW * 1.2); uniforms.uYOff.value = 0.55; uniforms.uFade.value = 0.85; }
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    // ---- bucle: se pausa si el hero no se ve o la pestaña está oculta ----
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let visible = true, raf = 0, time = 0, last = performance.now();
    const loop = (now: number) => {
      raf = 0;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      energy *= 0.97;
      time += dt * (reduce ? 0.25 : 1) * (1 + energy * 1.5);

      tilt.x += (tilt.tx - tilt.x) * 0.06; tilt.y += (tilt.ty - tilt.y) * 0.06;
      if (tilt.active) {
        // Inclinar el teléfono "deja caer" la seda hacia ese lado.
        const halfW = halfH * camera.aspect;
        pointer.tx = tilt.x * halfW * 0.9; pointer.ty = -tilt.y * halfH * 0.8; pointer.ts = 1.2;
        mesh.rotation.z = -tilt.x * 0.3;
        mesh.position.x = tilt.x * 0.35; mesh.position.y = -tilt.y * 0.3;
        camera.position.x = tilt.x * 0.5; camera.position.y = -tilt.y * 0.35;
        camera.lookAt(0, 0, 0);
      }
      pointer.x += (pointer.tx - pointer.x) * 0.08; pointer.y += (pointer.ty - pointer.y) * 0.08;
      pointer.s += (pointer.ts - pointer.s) * 0.05;

      uniforms.uTime.value = time;
      uniforms.uMouse.value.set(pointer.x, pointer.y);
      uniforms.uStrength.value = pointer.s;
      uniforms.uEnergy.value = energy;
      renderer.render(scene, camera);
      if (visible && !document.hidden) raf = requestAnimationFrame(loop);
    };
    const start = () => { if (!raf && visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(loop); } };
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; start(); });
    io.observe(canvas);
    document.addEventListener("visibilitychange", start);
    start();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect();
      document.removeEventListener("visibilitychange", start);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("deviceorientation", onOrientation);
      window.removeEventListener("devicemotion", onMotion);
      geometry.dispose(); material.dispose(); renderer.dispose();
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} aria-hidden="true" className={className} />
      {needsMotionTap && (
        <button
          type="button"
          onClick={() => enableMotionRef.current()}
          className="absolute top-20 right-4 z-20 px-3 py-1.5 rounded-full bg-black/60 border border-[#C9A45C]/30 text-xs font-semibold text-[#C9A45C] backdrop-blur-sm shadow-sm"
        >
          ✨ Mover con el teléfono
        </button>
      )}
    </>
  );
}
