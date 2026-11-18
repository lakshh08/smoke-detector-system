"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown, ArrowDownRight, ArrowRight, ArrowUpRight, BellRing, Check, ChevronDown, CircleDot,
  Cpu, Flame, Menu, Radio, Shield, ShieldCheck, Siren, Sparkles, TriangleAlert, Waves, Wind, X,
} from "lucide-react";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";

type SensorMode = "vapor" | "smoke" | "gas";

function Detector({ exploded = false, mode }: { exploded?: boolean; mode: SensorMode }) {
  const group = useRef<THREE.Group>(null);
  const lens = useRef<THREE.MeshStandardMaterial>(null);
  const indicator = useRef<THREE.MeshBasicMaterial>(null);
  const baseOffset = exploded ? 1.05 : 0;
  const coreOffset = exploded ? 0.46 : 0;

  useFrame(({ clock }) => {
    if (group.current && !exploded) group.current.rotation.y += 0.0015;
    const alerting = mode !== "vapor";
    const pulse = (Math.sin(clock.elapsedTime * (mode === "gas" ? 7 : mode === "smoke" ? 4.5 : 2.2)) + 1) / 2;
    if (lens.current) {
      lens.current.emissiveIntensity = mode === "gas" ? 1.1 + pulse * 1.3 : mode === "smoke" ? 0.8 + pulse * 0.65 : 0.5 + pulse * 0.18;
      lens.current.emissive.set(mode === "gas" ? "#ff4f26" : mode === "smoke" ? "#ff9a52" : "#20d9e8");
    }
    if (indicator.current) {
      indicator.current.color.set(mode === "gas" ? "#ff5b32" : mode === "smoke" ? "#ff9a52" : "#78f2f1");
      indicator.current.opacity = alerting ? 0.45 + pulse * 0.55 : 1;
    }
  });

  return (
    <Float speed={1.15} rotationIntensity={0.08} floatIntensity={0.12}>
      <group ref={group} rotation={[0.12, -0.25, 0]}>
        <mesh position={[0, baseOffset + 0.08, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.31, 1.42, 0.3, 96]} />
          <meshPhysicalMaterial color="#d9ddda" metalness={0.48} roughness={0.24} clearcoat={0.8} clearcoatRoughness={0.2} />
        </mesh>
        <mesh position={[0, baseOffset - 0.09, 0]}>
          <cylinderGeometry args={[1.38, 1.38, 0.055, 96]} />
          <meshStandardMaterial color="#7f8a88" metalness={0.8} roughness={0.24} />
        </mesh>
        <mesh position={[0, coreOffset - 0.16, 0]}>
          <cylinderGeometry args={[1.08, 1.12, 0.075, 96]} />
          <meshStandardMaterial color="#13191b" metalness={0.55} roughness={0.3} />
        </mesh>
        <mesh position={[0, coreOffset - 0.28, 0]}>
          <cylinderGeometry args={[1.25, 1.3, 0.13, 96]} />
          <meshStandardMaterial color="#adb6b3" metalness={0.67} roughness={0.29} />
        </mesh>
        <mesh position={[0, coreOffset - 0.39, 0]}>
          <cylinderGeometry args={[1.16, 1.22, 0.1, 96]} />
          <meshStandardMaterial color="#c6cbc8" metalness={0.52} roughness={0.33} />
        </mesh>
        {Array.from({ length: 40 }).map((_, i) => {
          const angle = (i / 40) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(angle) * 1.16, baseOffset + 0.234, Math.sin(angle) * 1.16]} rotation={[0, -angle, 0]}>
              <boxGeometry args={[0.12, 0.012, 0.026]} />
              <meshStandardMaterial color="#687270" metalness={0.55} roughness={0.4} />
            </mesh>
          );
        })}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;
          return (
            <mesh key={`screw-${i}`} position={[Math.cos(angle) * 1.15, coreOffset - 0.215, Math.sin(angle) * 1.15]}>
              <cylinderGeometry args={[0.035, 0.035, 0.012, 16]} />
              <meshStandardMaterial color="#59615f" metalness={0.8} roughness={0.25} />
            </mesh>
          );
        })}
        <mesh position={[0, baseOffset + 0.245, 0]}>
          <cylinderGeometry args={[0.31, 0.34, 0.045, 64]} />
          <meshStandardMaterial color="#161f20" metalness={0.72} roughness={0.18} />
        </mesh>
        <mesh position={[0, baseOffset + 0.272, 0]}>
          <cylinderGeometry args={[0.205, 0.22, 0.018, 64]} />
          <meshStandardMaterial ref={lens} color="#15383a" metalness={0.55} roughness={0.18} emissive="#20d9e8" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0, baseOffset + 0.285, 0]}>
          <torusGeometry args={[0.255, 0.013, 8, 64]} />
          <meshBasicMaterial ref={indicator} color="#78f2f1" toneMapped={false} transparent />
        </mesh>
        <mesh position={[0, baseOffset + 0.294, 0]}>
          <circleGeometry args={[0.055, 32]} />
          <meshBasicMaterial color="#d4ffff" toneMapped={false} />
        </mesh>
      </group>
    </Float>
  );
}

function SensorEventEffect({ mode }: { mode: SensorMode }) {
  const rings = useRef<Array<THREE.Mesh | null>>([]);

  useFrame(({ clock }) => {
    rings.current.forEach((ring, index) => {
      if (!ring) return;
      const progress = (clock.elapsedTime * 0.38 + index / 3) % 1;
      const gasAlert = mode === "gas";
      const pulse = (Math.sin(clock.elapsedTime * 4.5) + 1) / 2;
      const visible = gasAlert || (mode === "smoke" && index === 0);
      ring.visible = visible;
      ring.position.y = gasAlert ? -0.58 + progress * 1.9 : 0.31;
      ring.scale.setScalar(gasAlert ? 0.6 + progress * 0.8 : 0.85 + pulse * 0.16);
      const material = ring.material as THREE.MeshBasicMaterial;
      material.color.set(gasAlert ? "#ff6a2a" : "#ff9a52");
      material.opacity = !visible ? 0 : gasAlert ? (1 - progress) * 0.48 : 0.25 + pulse * 0.24;
    });
  });

  return (
    <group>
      {[0, 1, 2].map((index) => (
        <mesh
          key={index}
          ref={(mesh) => { rings.current[index] = mesh; }}
          rotation={[Math.PI / 2, 0, 0]}
          visible={mode !== "vapor" && (mode === "gas" || index === 0)}
        >
          <torusGeometry args={[0.82, 0.012, 8, 64]} />
          <meshBasicMaterial color="#ff6a2a" transparent opacity={0.4} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function Smoke() {
  const ref = useRef<THREE.Points>(null);
  const positions = useRef<Float32Array>();
  const count = 180;
  if (!positions.current) {
    positions.current = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions.current[i * 3] = (Math.random() - .5) * 7;
      positions.current[i * 3 + 1] = (Math.random() - .5) * 5;
      positions.current[i * 3 + 2] = (Math.random() - .5) * 4;
    }
  }
  useFrame(({ clock }, delta) => {
    if (!ref.current) return;
    const position = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      const index = i * 3;
      position.array[index + 1] += delta * (0.035 + (i % 5) * 0.009);
      position.array[index] += Math.sin(clock.elapsedTime * 0.25 + i) * delta * 0.012;
      if (position.array[index + 1] > 2.8) position.array[index + 1] = -2.8;
    }
    position.needsUpdate = true;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.current, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#a8c4c3" size={0.024} transparent opacity={0.28} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function ProductCanvas({ compact = false, exploded = false, mode = "vapor" }: { compact?: boolean; exploded?: boolean; mode?: SensorMode }) {
  const reduceMotion = useReducedMotion();
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 1.1, 5.2], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      style={{ touchAction: "pan-y" }}
    >
      <ambientLight intensity={0.85} />
      <directionalLight position={[3, 5, 4]} intensity={3.2} color="#fff4e8" />
      <directionalLight position={[-4, 2, -2]} intensity={2.5} color="#66e4ed" />
      <pointLight position={[-3, 0, 2]} intensity={mode === "gas" ? 16 : mode === "smoke" ? 12 : 9} color={mode === "gas" ? "#ff4f26" : mode === "smoke" ? "#ff9a52" : "#ff6a2a"} />
      <pointLight position={[2, 2, -3]} intensity={10} color="#56d9e8" />
      <Suspense fallback={null}><Smoke /><SensorEventEffect mode={mode} /><Detector exploded={exploded} mode={mode} /></Suspense>
      <OrbitControls enablePan={false} enableZoom={!compact} autoRotate={!reduceMotion && !exploded} autoRotateSpeed={0.38} minDistance={4} maxDistance={7} minPolarAngle={.55} maxPolarAngle={2.25} />
    </Canvas>
  );
}

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: .65, ease: [0.22, 1, .36, 1] } },
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="eyebrow flex items-center gap-3"><span className="h-px w-6 bg-[#ff6a2a]" />{children}</div>;
}

function ModeSwitch({ mode, onModeChange, className }: { mode: SensorMode; onModeChange: (mode: SensorMode) => void; className: string }) {
  return (
    <div className={`glass flex -translate-x-1/2 items-center gap-1 rounded-full p-1 ${className}`}>
      {(["vapor", "smoke", "gas"] as const).map(item => (
        <button
          key={item}
          type="button"
          aria-pressed={mode === item}
          onClick={() => onModeChange(item)}
          className={`rounded-full px-3 py-2 text-[8px] font-bold uppercase tracking-[.08em] transition md:px-4 md:text-[9px] ${mode === item ? item === "vapor" ? "bg-white text-black" : "bg-[#ff6a2a] text-black" : "text-white/50 hover:text-white"}`}
        >
          {item === "vapor" ? "Clear" : item === "smoke" ? "Smoke" : "Gas leak"}
        </button>
      ))}
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const links = [["Technology", "#technology"], ["Simulator", "#simulator"], ["Specs", "#specs"], ["Enterprise", "#enterprise"]];
  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-4 pt-4 md:px-8">
      <nav className="glass mx-auto flex h-[62px] max-w-[1376px] items-center justify-between rounded-full px-5 md:px-7">
        <a href="#" className="flex items-center gap-2.5" aria-label="AegisSmoke home">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ff6a2a]/45 bg-[#ff6a2a]/10 text-[#ff7840]"><Shield size={16} strokeWidth={1.8} /></div>
          <span className="text-[15px] font-extrabold tracking-[-.06em]">AEGIS<span className="font-medium text-white/45">SMOKE</span><sup className="ml-0.5 text-[8px] text-[#ff7840]">®</sup></span>
        </a>
        <div className="hidden items-center gap-9 md:flex">
          {links.map(([label, href]) => <a key={label} href={href} className="text-[11px] font-semibold text-white/55 transition hover:text-white">{label}</a>)}
        </div>
        <div className="hidden md:block">
          <a href="#enterprise" className="flex items-center gap-2 rounded-full bg-[#ff6a2a] px-5 py-3 text-[10px] font-bold uppercase tracking-[.12em] text-[#111] transition hover:bg-[#ff8c56]">Request demo <ArrowUpRight size={14} /></a>
        </div>
        <button className="flex h-10 w-10 items-center justify-center md:hidden" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>
      {open && <div className="glass mx-1 mt-2 rounded-2xl p-4 md:hidden">{links.map(([label, href]) => <a onClick={() => setOpen(false)} key={label} href={href} className="block border-b border-white/10 py-3 text-sm text-white/75">{label}</a>)}<a href="#enterprise" className="mt-4 flex justify-center rounded-xl bg-[#ff6a2a] py-3 text-xs font-bold uppercase text-black">Request demo</a></div>}
    </header>
  );
}

function Hero({
  mode,
  onModeChange,
  buzzerPlaying,
  onSilence,
}: {
  mode: SensorMode;
  onModeChange: (mode: SensorMode) => void;
  buzzerPlaying: boolean;
  onSilence: () => void;
}) {
  const gasAlert = mode === "gas";
  return (
    <section className="noise page-grid relative flex min-h-[840px] flex-col overflow-hidden px-5 pb-12 pt-32 md:min-h-[900px] md:px-10 md:pt-36">
      <div className="pointer-events-none absolute left-1/2 top-[18%] h-[520px] w-[760px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(32,83,84,.18),transparent_67%)]" />
      <div className="relative z-10 mx-auto w-full max-w-[1376px]">
        <div className="grid items-center gap-0 lg:grid-cols-[.96fr_1.04fr]">
          <motion.div initial="hidden" animate="visible" variants={reveal} className="relative z-10 pt-5 lg:pt-16">
            <Eyebrow>Intelligence, built into every breath</Eyebrow>
            <h1 className="mt-7 max-w-[760px] text-[clamp(3.2rem,7.3vw,7.1rem)] font-semibold leading-[.91] tracking-[-.075em]">
              See danger<span className="text-white/35">.</span><br />
              <span className="text-white/40">Before</span> it starts.
            </h1>
            <p className="mt-7 max-w-[440px] text-[14px] leading-7 text-white/48 md:text-[15px]">
              Predictive smoke detection for the places that can&apos;t afford a second of uncertainty.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#simulator" className="orange-glow inline-flex items-center gap-2 rounded-full bg-[#ff6a2a] px-6 py-3.5 text-[11px] font-bold uppercase tracking-[.1em] text-[#111] transition hover:-translate-y-0.5 hover:bg-[#ff8c56]">Explore the system <ArrowRight size={14} /></a>
              <a href="#technology" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-[11px] font-semibold text-white/75 transition hover:border-white/35 hover:text-white"><CircleDot size={13} className="text-[#ff7840]" /> See how it works</a>
            </div>
            <div className="mt-12 flex items-center gap-5">
              <div className="flex -space-x-2">{["#d7a47e", "#8ba69a", "#9d8da8"].map((c, i) => <span key={i} className="h-7 w-7 rounded-full border-2 border-[#080a0c]" style={{ background: `linear-gradient(145deg,${c},#272b2c)` }} />)}</div>
              <p className="text-[10px] leading-5 text-white/40"><span className="font-semibold text-white/75">Trusted where it matters.</span><br />Protecting 12,000+ critical spaces</p>
            </div>
          </motion.div>
          <div className="model-stage relative mx-auto h-[430px] w-full max-w-[660px] md:h-[570px] lg:-ml-8 lg:mt-2">
            <div className="model-orbit absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[.055] md:h-[460px] md:w-[460px]" />
            <div className="model-orbit absolute left-1/2 top-1/2 h-[265px] w-[265px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/[.09] md:h-[350px] md:w-[350px]" />
            <div className="model-ambience absolute left-1/2 top-1/2 h-[170px] w-[170px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff6a2a]/[.07] blur-[70px]" />
            <ProductCanvas compact mode={mode} />
            <ModeSwitch mode={mode} onModeChange={onModeChange} className="absolute left-1/2 top-4 z-10" />
            <div className="glass absolute bottom-[12%] left-[3%] z-10 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2"><span className={`sensor-pulse h-1.5 w-1.5 rounded-full ${mode === "vapor" ? "bg-[#65e8c1]" : "bg-[#ff7144]"}`} /><span className="mono text-[9px] uppercase tracking-[.13em] text-white/55">{mode === "gas" ? "Gas event · demo" : mode === "smoke" ? "Smoke event · demo" : "Sensor active"}</span></div>
              <div className="mt-1.5 text-[12px] font-semibold">Aegis One <span className="text-white/35">· Gen 04</span></div>
              {gasAlert && <button type="button" onClick={onSilence} className="mt-2 inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[.08em] text-[#ff9a75] hover:text-white"><Siren size={11} /> {buzzerPlaying ? "Silence buzzer" : "Buzzer muted"}</button>}
            </div>
            <div className="glass absolute right-[2%] top-[15%] z-10 rounded-xl px-4 py-3">
              <div className="mono text-[9px] uppercase tracking-[.13em] text-white/40">Response time</div>
              <div className="mt-1 flex items-baseline gap-1 text-[19px] font-semibold tracking-tight">0.38<span className="mono text-[10px] font-normal text-[#66e4ed]">SEC</span></div>
            </div>
            <div className="absolute bottom-4 right-6 z-10 flex items-center gap-2 text-[9px] uppercase tracking-[.12em] text-white/30"><ArrowDownRight size={13} /> Drag to explore</div>
          </div>
        </div>
      </div>
      <div className="relative z-10 mx-auto mt-auto flex w-full max-w-[1376px] items-center justify-between border-t border-white/[.09] pt-5">
        <span className="mono text-[9px] uppercase tracking-[.15em] text-white/30">Engineered for what&apos;s next</span>
        <a href="#technology" className="flex items-center gap-2 text-[9px] uppercase tracking-[.15em] text-white/40 hover:text-white/80">Scroll to explore <ArrowDown size={12} /></a>
      </div>
    </section>
  );
}

function Metrics() {
  const [active, setActive] = useState(false);
  const [sample, setSample] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setSample((n) => (n + 1) % 8), 900);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <section id="technology" className="relative overflow-hidden border-y border-white/[.07] bg-[#0b0e10] px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1376px]">
        <div className="grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-end">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: .25 }} variants={reveal}>
            <Eyebrow>01 / From signal to certainty</Eyebrow>
            <h2 className="section-title mt-7 max-w-[560px]">A new sense<br />of <span className="text-white/35">what&apos;s next.</span></h2>
            <p className="mt-6 max-w-[420px] text-[13px] leading-7 text-white/45">Most alarms react to smoke. Aegis reads the room. Multispectral sensors and on-device intelligence recognize risk while it&apos;s still just a signal.</p>
            <button onClick={() => setActive(!active)} className="mt-7 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#ff8151] hover:text-[#ffac8c]">
              {active ? "View clear air" : "Simulate an event"} <ArrowRight size={13} />
            </button>
          </motion.div>
          <div className="glass relative overflow-hidden rounded-2xl p-5 md:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/[.08] pb-5">
              <div><div className="mono text-[9px] uppercase tracking-[.13em] text-white/35">Live environmental intelligence</div><div className="mt-2 text-[13px] font-semibold">Floor 04 / West wing</div></div>
              <div className="flex items-center gap-2 rounded-full border border-[#66e4ed]/20 bg-[#66e4ed]/[.06] px-3 py-1.5"><span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-[#ff7144]" : "bg-[#66e4ed]"} sensor-pulse`} /><span className="mono text-[8px] uppercase tracking-[.1em] text-white/60">{active ? "Anomaly detected" : "All zones nominal"}</span></div>
            </div>
            <div className="grid grid-cols-2 gap-3 py-5 md:grid-cols-4">
              {[["PM2.5", active ? `${(24 + sample * 13).toFixed(0)}` : "04", "µg/m³"], ["CO", active ? `${(18 + sample * 9).toFixed(0)}` : "0.2", "ppm"], ["TEMP", active ? `${(23 + sample * .6).toFixed(1)}` : "21.4", "°C"], ["HUMIDITY", "42", "%"]].map(([label, val, unit]) => (
                <div key={label} className="rounded-xl border border-white/[.07] bg-white/[.02] p-3.5"><div className="mono text-[8px] tracking-[.12em] text-white/35">{label}</div><div className={`mt-2 text-[22px] font-semibold tracking-tight ${active && label !== "HUMIDITY" ? "text-[#ff8151]" : "text-white/90"}`}>{val}<span className="ml-1 text-[9px] font-normal text-white/35">{unit}</span></div></div>
              ))}
            </div>
            <div className="relative h-[170px] overflow-hidden rounded-xl border border-white/[.07] bg-[#080b0c] px-3 pt-4">
              <div className="absolute inset-0 grid grid-rows-4">{[0,1,2,3].map(x => <div key={x} className="border-b border-white/[.04]" />)}</div>
              <svg viewBox="0 0 600 145" preserveAspectRatio="none" className="relative h-full w-full">
                <defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#66e4ed" stopOpacity=".17" /><stop offset="100%" stopColor="#66e4ed" stopOpacity="0" /></linearGradient></defs>
                <path d={active ? "M0 113 C45 109 52 114 90 104 S130 103 170 95 S215 95 245 75 S280 83 318 67 S360 68 390 44 S430 48 458 36 S498 43 530 18 S565 33 600 8 L600 145 L0 145 Z" : "M0 105 C38 106 48 98 82 101 S126 96 162 99 S207 94 242 97 S288 93 324 96 S368 88 402 94 S442 89 478 91 S525 87 560 89 S581 86 600 85 L600 145 L0 145 Z"} fill="url(#fill)" />
                <path d={active ? "M0 113 C45 109 52 114 90 104 S130 103 170 95 S215 95 245 75 S280 83 318 67 S360 68 390 44 S430 48 458 36 S498 43 530 18 S565 33 600 8" : "M0 105 C38 106 48 98 82 101 S126 96 162 99 S207 94 242 97 S288 93 324 96 S368 88 402 94 S442 89 478 91 S525 87 560 89 S581 86 600 85"} fill="none" stroke={active ? "#ff7548" : "#66e4ed"} strokeWidth="2" className="chart-line" />
                {active && <circle cx="530" cy="18" r="4" fill="#ff7548"><animate attributeName="r" values="3;8;3" dur="1.5s" repeatCount="indefinite" /></circle>}
              </svg>
              <div className="mono absolute bottom-2 left-3 right-3 flex justify-between text-[7px] text-white/25"><span>14:02:10</span><span>14:02:30</span><span>14:02:50</span><span>14:03:10</span><span>NOW</span></div>
            </div>
            <div className="mt-4 flex items-center justify-between text-[9px] text-white/35"><span>Optical scatter · 10 sec average</span><span className="mono text-[#66e4ed]">● LIVE FEED</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Simulator({ mode, onModeChange }: { mode: SensorMode; onModeChange: (mode: SensorMode) => void }) {
  const SceneIcon = mode === "gas" ? Wind : mode === "smoke" ? Flame : Waves;
  const isHazard = mode !== "vapor";
  const selectMode = (item: "vapor" | "smoke" | "gas") => {
    onModeChange(item);
  };
  return (
    <section id="simulator" className="px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1376px]">
        <div className="mb-12 flex flex-col justify-between gap-7 md:flex-row md:items-end">
          <div><Eyebrow>02 / Intelligence in every layer</Eyebrow><h2 className="section-title mt-7">Not everything<br />in the air is <span className="text-white/35">a threat.</span></h2></div>
          <p className="max-w-[360px] text-[13px] leading-7 text-white/45">The difference between a false alarm and a fast response is understanding. Aegis learns the signature of your space.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
          <div className="glass relative min-h-[400px] overflow-hidden rounded-2xl p-6 md:p-9">
            <div className="absolute inset-0 page-grid opacity-50" />
            <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
              <div><div className="mono text-[9px] uppercase tracking-[.15em] text-white/35">Scenario simulation / 01</div><h3 className="mt-2 text-xl font-semibold tracking-tight">Read the room.</h3></div>
              <div className="flex flex-wrap rounded-full border border-white/10 bg-black/30 p-1">
                {(["vapor", "smoke", "gas"] as const).map(item => <button key={item} onClick={() => selectMode(item)} aria-pressed={mode === item} className={`rounded-full px-3 py-2 text-[9px] font-bold uppercase tracking-[.1em] transition ${mode === item ? item === "vapor" ? "bg-white text-black" : "bg-[#ff6a2a] text-black" : "text-white/45"}`}>{item === "vapor" ? "Steam / vapor" : item === "smoke" ? "Real smoke" : "Gas leak"}</button>)}
              </div>
            </div>
            <div className="relative z-10 mt-10 grid items-center gap-7 md:grid-cols-[1fr_auto_1fr]">
              <div className="relative flex h-[200px] items-center justify-center overflow-hidden rounded-xl border border-white/[.07] bg-[#080b0d]">
                <div className={`absolute h-[150px] w-[150px] rounded-full blur-[48px] transition-all duration-700 ${isHazard ? "bg-[#ff6a2a]/25" : "bg-[#a8d7e5]/20"}`} />
                {mode === "gas" && <><div className="absolute h-[120px] w-[120px] animate-ping rounded-full border border-[#ff6a2a]/20" /><div className="absolute h-[82px] w-[82px] rounded-full border border-dashed border-[#ff6a2a]/35" /></>}
                <SceneIcon size={mode === "gas" ? 56 : 68} strokeWidth={1.2} className={`relative transition-all duration-700 ${isHazard ? "scale-110 text-[#ff8455]" : "text-[#b5d5d9]"}`} />
                <span className="mono absolute bottom-3 left-3 text-[8px] uppercase tracking-[.12em] text-white/40">{mode === "gas" ? "Compatible gas sensor feed" : "Live optical feed"}</span>
                <span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 mono text-[8px] uppercase ${isHazard ? "bg-[#ff6a2a]/15 text-[#ff8151]" : "bg-white/10 text-white/55"}`}>{mode === "gas" ? "Concentration rising" : mode === "smoke" ? "Particulate rise" : "Moisture event"}</span>
              </div>
              <div className="hidden h-px w-12 bg-gradient-to-r from-[#66e4ed]/50 to-[#ff6a2a]/60 md:block" />
              <div className="space-y-4">
                <div className="mono text-[8px] uppercase tracking-[.15em] text-white/35">Aegis AI classification</div>
                <div className={`text-2xl font-semibold tracking-tight transition-colors ${isHazard ? "text-[#ff8151]" : "text-[#66e4ed]"}`}>{mode === "gas" ? "Gas detected" : mode === "smoke" ? "Fire signature detected" : "False alarm filtered"}</div>
                <p className="max-w-[290px] text-[11px] leading-6 text-white/40">{mode === "gas" ? "A compatible gas sensor crosses its configured threshold. Local alarms activate and configured response contacts are notified." : mode === "smoke" ? "Combustion signature confirmed across optical + thermal channels." : "Water vapor recognized. No alert sent. Your people keep moving."}</p>
                <div className="flex flex-wrap gap-2 pt-1">{(mode === "gas" ? ["GAS MODULE", "LOCAL ALARM", "ALERT ROUTING"] : ["OPTICAL", "THERMAL", "AI CORE"]).map(t => <span key={t} className="mono rounded border border-white/[.09] px-2 py-1 text-[7px] tracking-[.1em] text-white/45">{t}</span>)}</div>
                {mode === "gas" && <div className="grid gap-2 pt-1 sm:grid-cols-3 md:grid-cols-1 xl:grid-cols-3">
                  {[["01", "Detect", Wind], ["02", "Sound alarm", BellRing], ["03", "Notify team", TriangleAlert]].map(([step, label, Icon]) => {
                    const StepIcon = Icon as typeof Wind;
                    return <div key={step as string} className="flex items-center gap-2 rounded-lg border border-[#ff6a2a]/15 bg-[#ff6a2a]/[.04] px-2.5 py-2">
                      <StepIcon size={12} className="shrink-0 text-[#ff8151]" />
                      <span className="mono text-[7px] leading-4 text-white/60"><span className="text-[#ff8151]">{step as string} / </span>{label as string}</span>
                    </div>;
                  })}
                </div>}
              </div>
            </div>
            <div className="relative z-10 mt-8 border-t border-white/[.07] pt-4 flex justify-between mono text-[8px] uppercase tracking-[.12em] text-white/35"><span>{mode === "gas" ? "Threshold response simulated" : "Analysis completed"}</span><span className="text-white/65">{mode === "gas" ? "GAS EVENT" : "0.38 sec"} <span className="text-[#66e4ed]">↗</span></span></div>
            <p className="relative z-10 mt-3 text-[9px] leading-5 text-white/35">Gas detection requires compatible gas-sensor hardware; alert routing depends on site configuration. Simulation only—not a life-safety control.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="glass relative overflow-hidden rounded-2xl p-6">
              <div className="absolute right-5 top-6 flex h-9 w-9 items-center justify-center rounded-full border border-[#ff6a2a]/25 bg-[#ff6a2a]/10 text-[#ff8151]"><Waves size={16} /></div>
              <div className="eyebrow">Precision, at speed</div>
              <div className="mt-8 flex items-baseline gap-2 text-[56px] font-semibold leading-none tracking-[-.08em]">0.38<span className="mono text-[12px] tracking-normal text-[#ff8151]">SEC</span></div>
              <p className="mt-3 max-w-[300px] text-[11px] leading-6 text-white/40">From first signal to intelligent decision. Before a traditional alarm has time to react.</p>
              <div className="mt-6 h-[2px] overflow-hidden rounded-full bg-white/[.07]"><div className="h-full w-[72%] bg-gradient-to-r from-[#ff6a2a] to-[#ffc186]" /></div>
            </div>
            <div className="glass relative overflow-hidden rounded-2xl p-6">
              <div className="absolute right-5 top-6 flex h-9 w-9 items-center justify-center rounded-full border border-[#66e4ed]/25 bg-[#66e4ed]/10 text-[#66e4ed]"><Radio size={16} /></div>
              <div className="eyebrow text-[#66e4ed]">Built for every floor</div>
              <div className="mt-7 flex h-[62px] items-center justify-center gap-5">
                {[0,1,2,3,4].map((n) => <div key={n} className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#66e4ed]/30 bg-[#66e4ed]/[.06]"><span className="h-2 w-2 rounded-full bg-[#66e4ed]" />{n !== 2 && <span className="absolute left-8 top-1/2 h-px w-6 bg-[#66e4ed]/35" />}</div>)}
              </div>
              <p className="mt-3 max-w-[320px] text-[11px] leading-6 text-white/40">Self-healing mesh keeps every sensor connected. No blind spots. No single point of failure.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Exploded({ mode, onModeChange, buzzerPlaying, onSilence }: { mode: SensorMode; onModeChange: (mode: SensorMode) => void; buzzerPlaying: boolean; onSilence: () => void }) {
  const parts = [
    { num: "01", name: "Dual-spectrum optics", desc: "Reads particle size and light scatter to spot combustion before visible smoke.", icon: Sparkles, color: "#66e4ed" },
    { num: "02", name: "Edge AI processor", desc: "Classifies anomalies on-device. Your data stays yours. Decisions happen now.", icon: Cpu, color: "#ff8151" },
    { num: "03", name: "Acoustic array", desc: "Directional sound cuts through real environments—not just quiet hallways.", icon: Siren, color: "#ffbf70" },
    { num: "04", name: "Precision mesh shell", desc: "An engineered airflow path protects the sensor while particles flow freely.", icon: ShieldCheck, color: "#9ce5c7" },
  ];
  return (
    <section className="relative overflow-hidden border-y border-white/[.07] bg-[#0b0e10] px-5 py-24 md:px-10 md:py-32">
      <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff6a2a]/[.045] blur-[100px]" />
      <div className="relative mx-auto max-w-[1376px]">
        <div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr]">
          <div><Eyebrow>03 / Precision, by design</Eyebrow><h2 className="section-title mt-7">Every layer<br />has a <span className="text-white/35">purpose.</span></h2><p className="mt-6 max-w-[370px] text-[13px] leading-7 text-white/45">A system engineered from the sensor out. Scroll to see what makes the difference.</p>
            <div className="mt-9 space-y-0">{parts.map((p, i) => <motion.div key={p.num} initial={{ opacity: 0, x: -18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: .6 }} transition={{ delay: i * .12 }} className="group flex gap-4 border-b border-white/[.08] py-4">
              <span className="mono pt-1 text-[9px] text-white/30">{p.num}</span><div className="flex-1"><div className="flex items-center gap-2 text-[12px] font-semibold">{p.name}<ArrowUpRight size={12} className="text-white/25 transition group-hover:text-[#ff8151]" /></div><p className="mt-1.5 max-w-[340px] text-[10px] leading-5 text-white/40">{p.desc}</p></div><p.icon size={16} style={{ color: p.color }} className="mt-1 opacity-70" />
            </motion.div>)}</div>
          </div>
          <div className="model-stage relative h-[460px] overflow-hidden rounded-2xl border border-white/[.07] bg-[#080b0d] md:h-[620px]">
            <div className="absolute inset-0 page-grid opacity-60" />
            <div className="model-orbit absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[.06]" />
            <div className="model-orbit absolute left-1/2 top-1/2 h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/[.07]" />
            <ProductCanvas exploded mode={mode} />
            <div className="glass absolute left-5 top-5 rounded-lg px-3 py-2">
              <div className="mono text-[8px] uppercase tracking-[.12em] text-white/40">Aegis One · Exploded view</div>
              <div className={`mt-1 flex items-center gap-2 text-[9px] ${mode === "vapor" ? "text-[#66e4ed]" : "text-[#ff9a52]"}`}><span className={`h-1 w-1 rounded-full ${mode === "vapor" ? "bg-[#66e4ed]" : "bg-[#ff9a52]"}`} />{mode === "gas" ? "Gas event · demo" : mode === "smoke" ? "Smoke event · demo" : "Live model"}</div>
              {mode === "gas" && <button type="button" onClick={onSilence} className="mt-1.5 inline-flex items-center gap-1 text-[8px] font-semibold uppercase tracking-[.08em] text-[#ff9a75] hover:text-white"><Siren size={10} />{buzzerPlaying ? "Silence buzzer" : "Buzzer muted"}</button>}
            </div>
            <ModeSwitch mode={mode} onModeChange={onModeChange} className="absolute left-1/2 top-[78px] z-10 md:top-5" />
            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between"><span className="mono text-[8px] uppercase tracking-[.12em] text-white/35">4 integrated systems</span><span className="flex items-center gap-2 text-[8px] uppercase tracking-[.12em] text-white/45"><ArrowDownRight size={13} /> Rotate to inspect</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Comparison() {
  const rows = [
    ["Smoke detection", "Reactive, single sensor", "Predictive, multispectral"],
    ["False alarm filtering", "Limited / none", "On-device AI classification"],
    ["Response time", "30–60 seconds", "< 0.4 seconds"],
    ["Connectivity", "Standalone / wired", "Self-healing wireless mesh"],
    ["Facility intelligence", "None", "Live, centralized visibility"],
    ["Data privacy", "Cloud-dependent", "Edge-first by design"],
  ];
  return (
    <section id="specs" className="px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1120px]">
        <div className="mb-12 text-center"><div className="flex justify-center"><Eyebrow>04 / Set a new standard</Eyebrow></div><h2 className="section-title mx-auto mt-7 max-w-[700px]">Not another alarm.<br /><span className="text-white/35">A smarter standard.</span></h2></div>
        <div className="glass overflow-hidden rounded-2xl">
          <div className="grid grid-cols-[1.1fr_1fr_1fr] border-b border-white/[.09] px-4 py-5 md:px-8">
            <div className="mono self-center text-[8px] uppercase tracking-[.15em] text-white/30">Capabilities</div><div className="mono self-center text-[8px] uppercase tracking-[.12em] text-white/35">Traditional systems</div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.09em] text-[#ff8151]"><Shield size={13} /> Aegis</div>
          </div>
          {rows.map(([label, old, current], i) => <div key={label} className={`grid grid-cols-[1.1fr_1fr_1fr] items-center px-4 py-5 md:px-8 ${i < rows.length - 1 ? "border-b border-white/[.06]" : ""}`}>
            <div className="text-[10px] font-semibold text-white/75 md:text-[12px]">{label}</div><div className="pr-1 text-[9px] leading-5 text-white/35 md:text-[11px]">{old}</div><div className="flex items-start gap-1.5 text-[9px] font-medium leading-5 text-white/85 md:gap-2 md:text-[11px]"><Check size={13} className="mt-1 shrink-0 text-[#66e4ed]" />{current}</div>
          </div>)}
          <div className="grid grid-cols-[1.1fr_1fr_1fr] border-t border-white/[.09] bg-white/[.02] px-4 py-4 md:px-8"><div /><div className="mono text-[8px] text-white/30">The old way</div><div className="mono text-[8px] text-[#66e4ed]">The Aegis way ↗</div></div>
        </div>
        <div className="mt-4 text-center text-[9px] text-white/30">*Performance metrics based on internal validation. System configuration and environment may affect results.</div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer id="enterprise" className="relative overflow-hidden border-t border-white/[.08] bg-[#0b0e10] px-5 pb-7 pt-24 md:px-10 md:pt-32">
      <div className="absolute left-1/2 top-0 h-[390px] w-[700px] -translate-x-1/2 bg-[radial-gradient(ellipse,rgba(255,106,42,.13),transparent_70%)]" />
      <div className="relative mx-auto max-w-[1376px]">
        <div className="grid gap-10 border-b border-white/[.09] pb-16 md:grid-cols-[1.2fr_.8fr] md:items-end md:pb-20">
          <div><Eyebrow>Ready for a better kind of protection?</Eyebrow><h2 className="mt-6 max-w-[740px] text-[clamp(3rem,7vw,6.2rem)] font-semibold leading-[.94] tracking-[-.075em]">Protect what<br />you&apos;ve <span className="text-white/35">built.</span></h2></div>
          <div className="md:justify-self-end"><p className="mb-5 max-w-[310px] text-[12px] leading-6 text-white/45">Let&apos;s make your facility a little more certain. Start with a conversation.</p><a href="mailto:enterprise@aegissmoke.com?subject=Aegis%20enterprise%20demo" className="orange-glow inline-flex items-center gap-3 rounded-full bg-[#ff6a2a] px-7 py-4 text-[10px] font-bold uppercase tracking-[.12em] text-black transition hover:-translate-y-0.5 hover:bg-[#ff8c56]">Request an enterprise demo <ArrowUpRight size={14} /></a></div>
        </div>
        <div className="grid gap-10 py-10 md:grid-cols-[1fr_2fr]">
          <div><a href="#" className="flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ff6a2a]/40 bg-[#ff6a2a]/10 text-[#ff7840]"><Shield size={15} /></span><span className="text-[14px] font-extrabold tracking-[-.06em]">AEGIS<span className="font-medium text-white/40">SMOKE</span></span></a><p className="mt-4 max-w-[250px] text-[10px] leading-5 text-white/35">A clearer signal for a safer world.<br />© 2025 Aegis Systems, Inc.</p></div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {[["Explore",["Technology","Simulator","Specifications"]],["Company",["About Aegis","Enterprise","Contact"]],["Connect",["LinkedIn","Privacy","Terms"]]].map(([heading, items]) => <div key={heading as string}><div className="mono text-[8px] uppercase tracking-[.16em] text-white/35">{heading}</div><div className="mt-4 space-y-3">{(items as string[]).map((item) => <a key={item} href={item === "Technology" ? "#technology" : item === "Simulator" ? "#simulator" : item === "Specifications" ? "#specs" : "#enterprise"} className="block text-[10px] text-white/55 transition hover:text-white">{item}</a>)}</div></div>)}
          </div>
        </div>
        <div className="flex flex-col gap-4 border-t border-white/[.08] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">{["UL LISTED", "CE CERTIFIED", "ISO 27001"].map(b => <span key={b} className="mono flex items-center gap-1.5 rounded border border-white/[.09] px-2.5 py-1.5 text-[7px] tracking-[.1em] text-white/40"><Check size={9} className="text-[#66e4ed]" />{b}</span>)}</div>
          <span className="mono text-[8px] uppercase tracking-[.12em] text-white/25">Built for the moments that matter.</span>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  const [mode, setMode] = useState<SensorMode>("vapor");
  const [buzzerPlaying, setBuzzerPlaying] = useState(false);
  const buzzerRef = useRef<{ context: AudioContext; oscillator: OscillatorNode; intervalId: number } | null>(null);

  const stopBuzzer = () => {
    const buzzer = buzzerRef.current;
    if (!buzzer) return;
    window.clearInterval(buzzer.intervalId);
    buzzer.oscillator.stop();
    void buzzer.context.close();
    buzzerRef.current = null;
    setBuzzerPlaying(false);
  };

  const startBuzzer = () => {
    if (buzzerRef.current || typeof window.AudioContext === "undefined") return;
    const context = new window.AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "square";
    oscillator.frequency.value = 740;
    gain.gain.value = 0.025;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    let highTone = false;
    const intervalId = window.setInterval(() => {
      highTone = !highTone;
      oscillator.frequency.setTargetAtTime(highTone ? 880 : 660, context.currentTime, 0.025);
    }, 420);
    buzzerRef.current = { context, oscillator, intervalId };
    setBuzzerPlaying(true);
    void context.resume();
  };

  const selectMode = (nextMode: SensorMode) => {
    setMode(nextMode);
    if (nextMode === "gas") startBuzzer();
    else stopBuzzer();
  };

  useEffect(() => () => {
    const buzzer = buzzerRef.current;
    if (!buzzer) return;
    window.clearInterval(buzzer.intervalId);
    buzzer.oscillator.stop();
    void buzzer.context.close();
  }, []);

  return <main><Header /><Hero mode={mode} onModeChange={selectMode} buzzerPlaying={buzzerPlaying} onSilence={stopBuzzer} /><Metrics /><Simulator mode={mode} onModeChange={selectMode} /><Exploded mode={mode} onModeChange={selectMode} buzzerPlaying={buzzerPlaying} onSilence={stopBuzzer} /><Comparison /><Footer /></main>;
}
