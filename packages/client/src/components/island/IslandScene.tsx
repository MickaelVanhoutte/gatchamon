import { useRef, useCallback, useState, useEffect } from 'react';
import type { OwnedPokemon } from '../../stores/gameStore';
import { IslandMonster } from './IslandMonster';
import './IslandScene.css';

// World size in px (the pannable area)
const WORLD_W = 1200;
const WORLD_H = 800;
const MAX_ZOOM = 1.5;

interface IslandSceneProps {
  monsters: OwnedPokemon[];
  onNavigate: (path: string) => void;
}

/* ── Coordinate helpers ─────────────────────────────────────────────
   In portrait mode the .app container is CSS-rotated 90° CW so the
   game appears landscape.  Pointer events still report in screen
   (portrait) coordinates, but translate() operates in local (rotated)
   space.  These helpers convert between the two systems.
   ────────────────────────────────────────────────────────────────── */
function isPortrait() {
  return window.innerHeight > window.innerWidth;
}

/** Convert a screen-space delta to local element delta */
function screenDeltaToLocal(sdx: number, sdy: number) {
  if (isPortrait()) return { dx: sdy, dy: -sdx };
  return { dx: sdx, dy: sdy };
}

/** Convert a screen point to local coordinates relative to the element */
function screenPointToLocal(sx: number, sy: number, rect: DOMRect) {
  if (isPortrait()) {
    return { x: sy - rect.top, y: rect.width - (sx - rect.left) };
  }
  return { x: sx - rect.left, y: sy - rect.top };
}

function touchDist(a: React.Touch, b: React.Touch) {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

function touchCenter(a: React.Touch, b: React.Touch) {
  return { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 };
}

export function IslandScene({ monsters, onNavigate }: IslandSceneProps) {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const sceneRef = useRef<HTMLDivElement>(null);

  // Refs for gesture tracking
  const dragging = useRef(false);
  const lastPt = useRef({ x: 0, y: 0 });
  const pinching = useRef(false);
  const lastDist = useRef(0);
  const lastZoom = useRef(1);
  const lastPinchCenter = useRef({ x: 0, y: 0 });

  /** Min zoom so the world always fills the viewport (no outside visible) */
  const getMinZoom = useCallback(() => {
    const el = sceneRef.current;
    if (!el) return 1;
    return Math.max(el.clientWidth / WORLD_W, el.clientHeight / WORLD_H);
  }, []);

  const clampPan = useCallback((x: number, y: number, z: number) => {
    const el = sceneRef.current;
    if (!el) return { x, y };
    const vw = el.clientWidth;
    const vh = el.clientHeight;
    const scaledW = WORLD_W * z;
    const scaledH = WORLD_H * z;
    // If world is smaller than viewport at this zoom, center it
    const minX = scaledW <= vw ? (vw - scaledW) / 2 : -(scaledW - vw);
    const maxX = scaledW <= vw ? (vw - scaledW) / 2 : 0;
    const minY = scaledH <= vh ? (vh - scaledH) / 2 : -(scaledH - vh);
    const maxY = scaledH <= vh ? (vh - scaledH) / 2 : 0;
    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y)),
    };
  }, []);

  // Set initial zoom to fill viewport & center the view
  useEffect(() => {
    const minZ = getMinZoom();
    setZoom(minZ);
    lastZoom.current = minZ;
    const el = sceneRef.current;
    if (el) {
      const cx = -(WORLD_W * minZ - el.clientWidth) / 2;
      const cy = -(WORLD_H * minZ - el.clientHeight) / 2;
      setPan(clampPan(cx, cy, minZ));
    }
  }, [getMinZoom, clampPan]);

  // Re-clamp on orientation / resize changes
  useEffect(() => {
    const onResize = () => {
      const minZ = getMinZoom();
      setZoom(prev => {
        const z = Math.max(minZ, prev);
        lastZoom.current = z;
        return z;
      });
      setPan(prev => clampPan(prev.x, prev.y, lastZoom.current));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [getMinZoom, clampPan]);

  // --- Mouse / single-finger drag (pointer events) ---
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (pinching.current) return;
    dragging.current = true;
    lastPt.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current || pinching.current) return;
    const { dx, dy } = screenDeltaToLocal(
      e.clientX - lastPt.current.x,
      e.clientY - lastPt.current.y,
    );
    lastPt.current = { x: e.clientX, y: e.clientY };
    setPan(prev => clampPan(prev.x + dx, prev.y + dy, lastZoom.current));
  }, [clampPan]);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  // --- Pinch-to-zoom (touch events) ---
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      pinching.current = true;
      dragging.current = false;
      lastDist.current = touchDist(e.touches[0], e.touches[1]);
      lastPinchCenter.current = touchCenter(e.touches[0], e.touches[1]);
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pinching.current || e.touches.length < 2) return;
    const dist = touchDist(e.touches[0], e.touches[1]);
    const center = touchCenter(e.touches[0], e.touches[1]);
    const scaleFactor = dist / lastDist.current;
    const minZ = getMinZoom();
    const newZoom = Math.max(minZ, Math.min(MAX_ZOOM, lastZoom.current * scaleFactor));

    // Adjust pan so the pinch center stays fixed
    const el = sceneRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      // Convert screen pinch center → local element coords
      const local = screenPointToLocal(center.x, center.y, rect);
      // Convert screen movement → local delta
      const { dx, dy } = screenDeltaToLocal(
        center.x - lastPinchCenter.current.x,
        center.y - lastPinchCenter.current.y,
      );

      setPan(prev => {
        const r = newZoom / lastZoom.current;
        const px = prev.x * r + local.x * (1 - r) + dx;
        const py = prev.y * r + local.y * (1 - r) + dy;
        return clampPan(px, py, newZoom);
      });
    }

    setZoom(newZoom);
    lastZoom.current = newZoom;
    lastDist.current = dist;
    lastPinchCenter.current = center;
  }, [clampPan, getMinZoom]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      pinching.current = false;
    }
  }, []);

  // Wheel zoom for desktop testing
  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const minZ = getMinZoom();
      const factor = e.deltaY > 0 ? 0.95 : 1.05;
      const newZoom = Math.max(minZ, Math.min(MAX_ZOOM, lastZoom.current * factor));
      const rect = el.getBoundingClientRect();
      const local = screenPointToLocal(e.clientX, e.clientY, rect);
      setPan(prev => {
        const r = newZoom / lastZoom.current;
        return clampPan(
          prev.x * r + local.x * (1 - r),
          prev.y * r + local.y * (1 - r),
          newZoom,
        );
      });
      setZoom(newZoom);
      lastZoom.current = newZoom;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [clampPan, getMinZoom]);

  // Keep lastZoom ref in sync
  useEffect(() => { lastZoom.current = zoom; }, [zoom]);

  return (
    <div
      className="meadow-scene"
      ref={sceneRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      <div
        className="meadow-world"
        style={{
          width: WORLD_W,
          height: WORLD_H,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {/* SVG Ground — all static decorations */}
        <svg className="meadow-ground" viewBox="0 0 1200 800" preserveAspectRatio="none">
          <defs>
            {/* Pond gradients */}
            <radialGradient id="pondFill" cx="50%" cy="40%" r="52%">
              <stop offset="0%" stopColor="#68c0d8" />
              <stop offset="50%" stopColor="#58b0c8" />
              <stop offset="85%" stopColor="#4da0b8" />
              <stop offset="100%" stopColor="#60b0c4" />
            </radialGradient>
            <radialGradient id="pondShore" cx="50%" cy="50%" r="55%">
              <stop offset="70%" stopColor="transparent" />
              <stop offset="90%" stopColor="rgba(90,160,60,0.25)" />
              <stop offset="100%" stopColor="rgba(106,170,72,0.5)" />
            </radialGradient>
            <radialGradient id="pondDepth" cx="55%" cy="55%" r="45%">
              <stop offset="0%" stopColor="#4090a8" opacity="0.3" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            {/* Organic noise texture */}
            <filter id="groundNoise" x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise" />
              <feColorMatrix type="saturate" values="0" in="noise" result="grey" />
              <feBlend in="SourceGraphic" in2="grey" mode="soft-light" />
            </filter>
            {/* Tree shadow */}
            <radialGradient id="treeShadow">
              <stop offset="0%" stopColor="rgba(0,0,0,0.18)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            {/* Dirt path texture */}
            <linearGradient id="dirtPath" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#b8a070" />
              <stop offset="50%" stopColor="#a89060" />
              <stop offset="100%" stopColor="#b8a070" />
            </linearGradient>
          </defs>

          {/* ===== BASE GROUND ===== */}
          <rect width="1200" height="800" fill="#6aaa48" filter="url(#groundNoise)" />

          {/* Lighter grass patches — large soft areas */}
          <ellipse cx="300" cy="200" rx="200" ry="120" fill="#72b852" opacity="0.45" />
          <ellipse cx="850" cy="550" rx="220" ry="130" fill="#70b450" opacity="0.35" />
          <ellipse cx="600" cy="130" rx="170" ry="90" fill="#78c058" opacity="0.3" />
          <ellipse cx="150" cy="600" rx="160" ry="100" fill="#6eb44e" opacity="0.35" />
          <ellipse cx="1000" cy="180" rx="170" ry="110" fill="#74b854" opacity="0.28" />
          <ellipse cx="700" cy="700" rx="180" ry="80" fill="#72b450" opacity="0.3" />

          {/* Darker grass patches */}
          <ellipse cx="500" cy="650" rx="130" ry="75" fill="#5a9a3c" opacity="0.25" />
          <ellipse cx="900" cy="700" rx="110" ry="65" fill="#5a9838" opacity="0.2" />
          <ellipse cx="100" cy="300" rx="100" ry="80" fill="#5e9e40" opacity="0.25" />
          <ellipse cx="400" cy="400" rx="90" ry="60" fill="#5c9c3e" opacity="0.2" />
          <ellipse cx="1050" cy="400" rx="80" ry="50" fill="#5e9e40" opacity="0.2" />

          {/* ===== DIRT PATH (winding) ===== */}
          <path d="M0,350 C80,340 120,310 200,320 C300,335 350,370 450,360 C500,355 520,340 480,320 C460,310 440,350 450,360"
                fill="none" stroke="#a89060" strokeWidth="18" strokeLinecap="round" opacity="0.35" />
          <path d="M800,800 C810,740 830,700 860,680 C900,650 920,620 910,580 C900,550 870,540 860,560"
                fill="none" stroke="#a89060" strokeWidth="16" strokeLinecap="round" opacity="0.3" />
          {/* Path pebbles */}
          <ellipse cx="120" cy="325" rx="3" ry="2" fill="#c0a878" opacity="0.5" />
          <ellipse cx="250" cy="330" rx="2.5" ry="1.5" fill="#c0a878" opacity="0.45" />
          <ellipse cx="380" cy="360" rx="2" ry="1.5" fill="#c0a878" opacity="0.4" />
          <ellipse cx="850" cy="690" rx="2.5" ry="2" fill="#c0a878" opacity="0.4" />
          <ellipse cx="880" cy="640" rx="2" ry="1.5" fill="#c0a878" opacity="0.35" />

          {/* ===== POND ===== */}
          {/* Mud rim */}
          <ellipse cx="580" cy="425" rx="155" ry="98" fill="#5a8a3a" opacity="0.4" />
          {/* Main water */}
          <ellipse cx="580" cy="420" rx="145" ry="90" fill="url(#pondFill)" />
          {/* Depth shading */}
          <ellipse cx="590" cy="430" rx="100" ry="60" fill="url(#pondDepth)" />
          {/* Shore blend */}
          <ellipse cx="580" cy="420" rx="145" ry="90" fill="url(#pondShore)" />
          {/* Surface highlights */}
          <ellipse cx="545" cy="390" rx="45" ry="18" fill="white" opacity="0.08" />
          <ellipse cx="620" cy="405" rx="25" ry="10" fill="white" opacity="0.06" />
          {/* Ripple rings */}
          <ellipse cx="560" cy="430" rx="18" ry="8" fill="none" stroke="white" strokeWidth="0.5" opacity="0.15" />
          <ellipse cx="610" cy="410" rx="12" ry="5" fill="none" stroke="white" strokeWidth="0.5" opacity="0.12" />

          {/* Lily pads */}
          <g>
            <ellipse cx="530" cy="440" rx="12" ry="8" fill="#3a8828" opacity="0.7" />
            <path d="M530,440 L530,432" stroke="#3a8828" strokeWidth="1" opacity="0.5" />
            <circle cx="532" cy="436" r="2" fill="#e880a0" opacity="0.8" />

            <ellipse cx="625" cy="445" rx="10" ry="7" fill="#408a2c" opacity="0.65" />
            <path d="M625,445 L625,438" stroke="#408a2c" strokeWidth="1" opacity="0.5" />

            <ellipse cx="570" cy="455" rx="9" ry="6" fill="#3c8a2a" opacity="0.6" />
            <circle cx="572" cy="451" r="1.5" fill="#f0d850" opacity="0.7" />

            <ellipse cx="500" cy="415" rx="8" ry="5" fill="#3a8828" opacity="0.55" />
            <ellipse cx="645" cy="425" rx="7" ry="5" fill="#408a2c" opacity="0.5" />
          </g>

          {/* Cattails / reeds at pond edge */}
          <g>
            <line x1="465" y1="390" x2="462" y2="360" stroke="#5a7a30" strokeWidth="1.5" />
            <ellipse cx="462" cy="358" rx="2.5" ry="6" fill="#7a5830" />
            <line x1="472" y1="385" x2="470" y2="358" stroke="#5a7a30" strokeWidth="1.5" />
            <ellipse cx="470" cy="356" rx="2" ry="5" fill="#7a5830" />
            <line x1="458" y1="393" x2="455" y2="368" stroke="#5a7a30" strokeWidth="1" />
            <ellipse cx="455" cy="366" rx="2" ry="5" fill="#7a5830" />

            <line x1="700" y1="448" x2="704" y2="420" stroke="#5a7a30" strokeWidth="1.5" />
            <ellipse cx="704" cy="418" rx="2.5" ry="6" fill="#7a5830" />
            <line x1="708" y1="452" x2="711" y2="426" stroke="#5a7a30" strokeWidth="1" />
            <ellipse cx="711" cy="424" rx="2" ry="5" fill="#7a5830" />
          </g>

          {/* Stepping stones */}
          <ellipse cx="505" cy="412" rx="13" ry="7" fill="#90836a" />
          <ellipse cx="505" cy="410" rx="12" ry="6" fill="#a09478" />
          <ellipse cx="548" cy="398" rx="11" ry="6" fill="#90836a" />
          <ellipse cx="548" cy="396" rx="10" ry="5" fill="#a09478" />
          <ellipse cx="600" cy="402" rx="12" ry="6" fill="#90836a" />
          <ellipse cx="600" cy="400" rx="11" ry="5" fill="#a09478" />
          <ellipse cx="648" cy="418" rx="11" ry="6" fill="#90836a" />
          <ellipse cx="648" cy="416" rx="10" ry="5" fill="#a09478" />

          {/* Shore pebbles */}
          <ellipse cx="475" cy="382" rx="5" ry="3" fill="#a09070" opacity="0.5" />
          <ellipse cx="690" cy="455" rx="4" ry="2.5" fill="#a09070" opacity="0.4" />
          <ellipse cx="525" cy="485" rx="6" ry="3" fill="#a09070" opacity="0.4" />
          <ellipse cx="630" cy="480" rx="4" ry="2.5" fill="#a09070" opacity="0.35" />
          <ellipse cx="500" cy="370" rx="3" ry="2" fill="#a09070" opacity="0.4" />

          {/* ===== ROCKS — detailed clusters with highlights ===== */}
          {/* Cluster top-right */}
          <g>
            <ellipse cx="918" cy="282" rx="30" ry="20" fill="#8a4830" />
            <ellipse cx="918" cy="278" rx="28" ry="18" fill="#a85838" />
            <ellipse cx="912" cy="274" rx="10" ry="6" fill="#c08060" opacity="0.5" />
            <ellipse cx="948" cy="274" rx="20" ry="15" fill="#7a4028" />
            <ellipse cx="948" cy="270" rx="18" ry="13" fill="#b86848" />
            <ellipse cx="944" cy="266" rx="7" ry="4" fill="#d09070" opacity="0.4" />
            <ellipse cx="908" cy="268" rx="15" ry="11" fill="#904830" />
            <ellipse cx="908" cy="265" rx="14" ry="10" fill="#c07850" />
            <ellipse cx="905" cy="262" rx="5" ry="3" fill="#d8a080" opacity="0.35" />
          </g>

          {/* Cluster left */}
          <g>
            <ellipse cx="178" cy="444" rx="24" ry="16" fill="#8a4428" />
            <ellipse cx="178" cy="440" rx="22" ry="14" fill="#a05030" />
            <ellipse cx="174" cy="436" rx="8" ry="5" fill="#c07048" opacity="0.4" />
            <ellipse cx="200" cy="438" rx="16" ry="12" fill="#7a3820" />
            <ellipse cx="200" cy="434" rx="14" ry="10" fill="#b86040" />
            <ellipse cx="197" cy="430" rx="5" ry="3" fill="#d08858" opacity="0.35" />
            {/* Tiny moss on rocks */}
            <ellipse cx="185" cy="443" rx="4" ry="2" fill="#5a8a30" opacity="0.4" />
          </g>

          {/* Cluster bottom center */}
          <g>
            <ellipse cx="648" cy="624" rx="22" ry="14" fill="#8a4830" />
            <ellipse cx="648" cy="620" rx="20" ry="12" fill="#a85838" />
            <ellipse cx="644" cy="616" rx="7" ry="4" fill="#c08060" opacity="0.4" />
            <ellipse cx="672" cy="618" rx="14" ry="11" fill="#7a4028" />
            <ellipse cx="672" cy="614" rx="12" ry="9" fill="#b86848" />
            <ellipse cx="669" cy="610" rx="4" ry="2.5" fill="#d09070" opacity="0.35" />
            <ellipse cx="638" cy="615" rx="8" ry="6" fill="#905038" />
            <ellipse cx="638" cy="612" rx="7" ry="5" fill="#b86848" />
          </g>

          {/* Small scattered rocks with highlights */}
          <ellipse cx="350" cy="522" rx="9" ry="6" fill="#8a4830" />
          <ellipse cx="350" cy="520" rx="8" ry="5" fill="#a05838" />
          <ellipse cx="348" cy="518" rx="3" ry="2" fill="#c08060" opacity="0.4" />

          <ellipse cx="1050" cy="452" rx="11" ry="7" fill="#8a4830" />
          <ellipse cx="1050" cy="450" rx="10" ry="6" fill="#a85838" />
          <ellipse cx="1048" cy="448" rx="4" ry="2.5" fill="#c08060" opacity="0.35" />

          <ellipse cx="250" cy="702" rx="8" ry="5" fill="#8a4428" />
          <ellipse cx="250" cy="700" rx="7" ry="4" fill="#a05030" />

          <ellipse cx="780" cy="160" rx="6" ry="4" fill="#8a4830" />
          <ellipse cx="780" cy="158" rx="5" ry="3" fill="#a85838" />

          <ellipse cx="1100" cy="580" rx="7" ry="5" fill="#8a4428" />
          <ellipse cx="1100" cy="578" rx="6" ry="4" fill="#a85838" />

          {/* ===== FALLEN LOG ===== */}
          <g>
            {/* Shadow on ground */}
            <ellipse cx="850" cy="604" rx="38" ry="6" fill="rgba(0,0,0,0.1)" />
            {/* Main log body — slightly curved */}
            <path d="M818,600 Q850,592 882,598" stroke="#5a3418" strokeWidth="13" strokeLinecap="round" fill="none" />
            <path d="M818,600 Q850,592 882,598" stroke="#6a4420" strokeWidth="11" strokeLinecap="round" fill="none" />
            {/* Bark texture lines */}
            <path d="M825,596 Q830,594 835,595" stroke="#5a3418" strokeWidth="0.8" fill="none" opacity="0.5" />
            <path d="M845,593 Q852,591 858,593" stroke="#5a3418" strokeWidth="0.8" fill="none" opacity="0.4" />
            <path d="M865,594 Q870,593 876,595" stroke="#5a3418" strokeWidth="0.8" fill="none" opacity="0.4" />
            {/* Lighter top highlight */}
            <path d="M822,597 Q850,590 878,595" stroke="#7a5830" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5" />
            {/* Cut end rings */}
            <ellipse cx="882" cy="598" rx="5.5" ry="6.5" fill="#5a3418" />
            <ellipse cx="882" cy="598" rx="4" ry="5" fill="#6a4420" />
            <ellipse cx="882" cy="598" rx="2.5" ry="3" fill="#7a5430" />
            <ellipse cx="882" cy="598" rx="1" ry="1.2" fill="#8a6840" />
            {/* Broken branch stub */}
            <line x1="840" y1="594" x2="836" y2="586" stroke="#5a3418" strokeWidth="3" strokeLinecap="round" />
            <line x1="840" y1="594" x2="836" y2="586" stroke="#6a4420" strokeWidth="2" strokeLinecap="round" />
            {/* Moss patches on top */}
            <ellipse cx="830" cy="594" rx="8" ry="3" fill="#3a7a22" opacity="0.55" />
            <ellipse cx="832" cy="593" rx="5" ry="2" fill="#4a8a30" opacity="0.5" />
            <ellipse cx="858" cy="592" rx="6" ry="2.5" fill="#3a7a22" opacity="0.45" />
            <ellipse cx="860" cy="591" rx="4" ry="1.5" fill="#58a040" opacity="0.4" />
            {/* Small fern growing from log */}
            <g stroke="#3a8828" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.6">
              <path d="M848,593 L845,583 M848,593 L848,582 M848,593 L851,584" />
            </g>
          </g>

          {/* ===== MUSHROOMS ===== */}
          {/* Near log */}
          <g>
            <rect x="812" y="598" width="2" height="6" fill="#d8c8a0" />
            <ellipse cx="813" cy="597" rx="5" ry="3.5" fill="#cc4444" />
            <circle cx="811" cy="596" r="1" fill="white" opacity="0.7" />
            <circle cx="815" cy="595.5" r="0.7" fill="white" opacity="0.6" />
          </g>
          <g>
            <rect x="806" y="600" width="1.5" height="4.5" fill="#d8c8a0" />
            <ellipse cx="807" cy="599.5" rx="3.5" ry="2.5" fill="#cc5544" />
            <circle cx="806" cy="599" r="0.6" fill="white" opacity="0.6" />
          </g>
          {/* Near tree */}
          <g>
            <rect x="108" y="135" width="2" height="5" fill="#d8c8a0" />
            <ellipse cx="109" cy="134" rx="4.5" ry="3" fill="#dda040" />
            <ellipse cx="109" cy="133" rx="3" ry="1.5" fill="#eeb850" opacity="0.4" />
          </g>

          {/* ===== GRASS TUFTS — blades fanning upward from base ===== */}
          {/* Thick multi-blade tufts */}
          <g stroke="#4a8830" strokeLinecap="round" fill="none" opacity="0.55">
            <g strokeWidth="2">
              <path d="M122,180 L119,164 M125,180 L126,161 M128,180 L131,165" />
              <path d="M117,182 L115,168" />
              <path d="M782,300 L779,284 M785,300 L786,281 M788,300 L791,285" />
              <path d="M777,302 L775,288" />
            </g>
            <g strokeWidth="1.5">
              <path d="M322,350 L319,336 M325,350 L325,333 M328,350 L331,336" />
              <path d="M318,352 L316,340" />
              <path d="M452,150 L449,136 M455,150 L455,133 M458,150 L461,136" />
              <path d="M448,152 L446,140" />
              <path d="M1002,550 L999,536 M1005,550 L1005,533 M1008,550 L1011,536" />
              <path d="M998,552 L996,540" />
              <path d="M852,650 L849,636 M855,650 L855,633 M858,650 L861,636" />
              <path d="M202,550 L199,536 M205,550 L205,533 M208,550 L211,536" />
              <path d="M702,180 L699,166 M705,180 L705,163 M708,180 L711,166" />
              <path d="M698,182 L696,170" />
              <path d="M402,700 L399,686 M405,700 L405,683 M408,700 L411,686" />
              <path d="M1102,350 L1099,336 M1105,350 L1105,333 M1108,350 L1111,336" />
              <path d="M552,250 L549,236 M555,250 L555,233 M558,250 L561,236" />
              <path d="M102,700 L99,686 M105,700 L105,683 M108,700 L111,686" />
              <path d="M962,150 L959,136 M965,150 L965,133 M968,150 L971,136" />
              <path d="M752,700 L749,686 M755,700 L755,683 M758,700 L761,686" />
            </g>
          </g>
          {/* Additional scattered grass — lighter color, more coverage */}
          <g stroke="#5a9838" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4">
            <path d="M262,300 L259,288 M264,300 L264,286 M266,300 L269,288" />
            <path d="M502,200 L499,188 M504,200 L504,186 M506,200 L509,188" />
            <path d="M652,550 L649,538 M654,550 L654,536 M656,550 L659,538" />
            <path d="M382,480 L379,468 M384,480 L384,466 M386,480 L389,468" />
            <path d="M1072,250 L1069,238 M1074,250 L1074,236 M1076,250 L1079,238" />
            <path d="M172,170 L169,158 M174,170 L174,156 M176,170 L179,158" />
            <path d="M932,400 L929,388 M934,400 L934,386 M936,400 L939,388" />
            <path d="M522,730 L519,718 M524,730 L524,716 M526,730 L529,718" />
            <path d="M312,600 L309,588 M314,600 L314,586 M316,600 L319,588" />
            <path d="M1022,680 L1019,668 M1024,680 L1024,666 M1026,680 L1029,668" />
            <path d="M82,500 L79,488 M84,500 L84,486 M86,500 L89,488" />
            <path d="M682,120 L679,108 M684,120 L684,106 M686,120 L689,108" />
          </g>

          {/* ===== FLOWERS — with petals and stems ===== */}
          {/* Purple flower cluster */}
          <g>
            <line x1="280" y1="480" x2="280" y2="470" stroke="#3a7a22" strokeWidth="1" />
            <circle cx="280" cy="469" r="4" fill="#8866cc" />
            <circle cx="277" cy="467" r="1.5" fill="#a088dd" opacity="0.6" />
            <circle cx="283" cy="467" r="1.5" fill="#a088dd" opacity="0.6" />
            <circle cx="280" cy="465" r="1.5" fill="#a088dd" opacity="0.6" />
            <circle cx="280" cy="469" r="1.5" fill="#f0d850" />

            <line x1="290" y1="478" x2="290" y2="470" stroke="#3a7a22" strokeWidth="1" />
            <circle cx="290" cy="469" r="3.5" fill="#9976dd" />
            <circle cx="290" cy="469" r="1.2" fill="#f0d850" />

            <line x1="274" y1="476" x2="274" y2="468" stroke="#3a7a22" strokeWidth="1" />
            <circle cx="274" cy="467" r="3" fill="#7756bb" />
            <circle cx="274" cy="467" r="1" fill="#f0d850" />

            <line x1="296" y1="482" x2="296" y2="475" stroke="#3a7a22" strokeWidth="1" />
            <circle cx="296" cy="474" r="2.5" fill="#8866cc" />
            <circle cx="296" cy="474" r="0.8" fill="#f0d850" />
            {/* Leaves */}
            <ellipse cx="278" cy="475" rx="3" ry="1.5" fill="#4a8a30" opacity="0.6" transform="rotate(-20 278 475)" />
            <ellipse cx="292" cy="474" rx="2.5" ry="1.2" fill="#4a8a30" opacity="0.6" transform="rotate(15 292 474)" />
          </g>

          {/* Yellow daisy cluster */}
          <g>
            <line x1="820" y1="380" x2="820" y2="370" stroke="#3a7a22" strokeWidth="1" />
            <circle cx="817" cy="369" r="2" fill="#f0d850" />
            <circle cx="823" cy="369" r="2" fill="#f0d850" />
            <circle cx="820" cy="366" r="2" fill="#f0d850" />
            <circle cx="820" cy="372" r="2" fill="#f0d850" />
            <circle cx="820" cy="369" r="2" fill="#e8a020" />

            <line x1="830" y1="376" x2="830" y2="368" stroke="#3a7a22" strokeWidth="1" />
            <circle cx="828" cy="367" r="1.5" fill="#f0d850" />
            <circle cx="832" cy="367" r="1.5" fill="#f0d850" />
            <circle cx="830" cy="365" r="1.5" fill="#f0d850" />
            <circle cx="830" cy="367" r="1.5" fill="#e8a020" />

            <line x1="813" y1="374" x2="813" y2="368" stroke="#3a7a22" strokeWidth="1" />
            <circle cx="813" cy="367" r="2.5" fill="#e8c840" />
            <circle cx="813" cy="367" r="1" fill="#e8a020" />
          </g>

          {/* Pink flower cluster near pond */}
          <g>
            <line x1="720" y1="475" x2="720" y2="466" stroke="#3a7a22" strokeWidth="1" />
            <circle cx="718" cy="465" r="1.8" fill="#f5a0b8" />
            <circle cx="722" cy="465" r="1.8" fill="#f5a0b8" />
            <circle cx="720" cy="463" r="1.8" fill="#f5a0b8" />
            <circle cx="720" cy="467" r="1.8" fill="#f5a0b8" />
            <circle cx="720" cy="465" r="1.5" fill="#ffcc00" />

            <line x1="730" y1="470" x2="730" y2="463" stroke="#3a7a22" strokeWidth="1" />
            <circle cx="730" cy="462" r="2.5" fill="#e880a0" />
            <circle cx="730" cy="462" r="1" fill="#ffcc00" />

            <line x1="714" y1="478" x2="714" y2="472" stroke="#3a7a22" strokeWidth="1" />
            <circle cx="714" cy="471" r="2" fill="#d87090" />
            <circle cx="714" cy="471" r="0.8" fill="#ffcc00" />
          </g>

          {/* Scattered individual flowers */}
          <g>
            <line x1="150" y1="250" x2="150" y2="244" stroke="#3a7a22" strokeWidth="0.8" />
            <circle cx="150" cy="243" r="2.5" fill="#e8c840" />
            <circle cx="150" cy="243" r="1" fill="#e8a020" />

            <line x1="1050" y1="600" x2="1050" y2="593" stroke="#3a7a22" strokeWidth="0.8" />
            <circle cx="1050" cy="592" r="3" fill="#8866cc" />
            <circle cx="1050" cy="592" r="1.2" fill="#f0d850" />

            <line x1="400" y1="320" x2="400" y2="314" stroke="#3a7a22" strokeWidth="0.8" />
            <circle cx="400" cy="313" r="2.5" fill="#e880a0" />
            <circle cx="400" cy="313" r="1" fill="#ffcc00" />

            <line x1="950" y1="450" x2="950" y2="444" stroke="#3a7a22" strokeWidth="0.8" />
            <circle cx="950" cy="443" r="2" fill="#f0d850" />
            <circle cx="950" cy="443" r="0.8" fill="#e8a020" />

            <line x1="300" y1="680" x2="300" y2="673" stroke="#3a7a22" strokeWidth="0.8" />
            <circle cx="300" cy="672" r="3" fill="#8866cc" />
            <circle cx="300" cy="672" r="1.2" fill="#f0d850" />

            <line x1="560" y1="300" x2="560" y2="294" stroke="#3a7a22" strokeWidth="0.8" />
            <circle cx="560" cy="293" r="2" fill="#e880a0" />
            <circle cx="560" cy="293" r="0.8" fill="#ffcc00" />

            <line x1="1000" y1="320" x2="1000" y2="314" stroke="#3a7a22" strokeWidth="0.8" />
            <circle cx="1000" cy="313" r="2.5" fill="#f0d850" />
            <circle cx="1000" cy="313" r="1" fill="#e8a020" />

            <line x1="140" y1="450" x2="140" y2="444" stroke="#3a7a22" strokeWidth="0.8" />
            <circle cx="140" cy="443" r="2" fill="#9976dd" />
            <circle cx="140" cy="443" r="0.8" fill="#f0d850" />
          </g>

          {/* ===== BUSHES — layered with berries/flowers ===== */}
          {/* Bush near pond */}
          <g>
            <ellipse cx="440" cy="372" rx="18" ry="12" fill="#3a7822" />
            <ellipse cx="440" cy="368" rx="16" ry="10" fill="#4a8a30" />
            <ellipse cx="436" cy="364" rx="12" ry="8" fill="#58a040" />
            <ellipse cx="443" cy="362" rx="6" ry="5" fill="#68b050" opacity="0.5" />
            <circle cx="434" cy="360" r="2.5" fill="#8866cc" />
            <circle cx="434" cy="360" r="0.8" fill="#f0d850" />
            <circle cx="442" cy="358" r="2" fill="#9976dd" />
            <circle cx="442" cy="358" r="0.7" fill="#f0d850" />
            <circle cx="447" cy="362" r="1.5" fill="#8866cc" />
          </g>

          {/* Berry bush right side */}
          <g>
            <ellipse cx="1020" cy="344" rx="20" ry="13" fill="#3a7822" />
            <ellipse cx="1020" cy="340" rx="18" ry="11" fill="#4a8a30" />
            <ellipse cx="1016" cy="336" rx="14" ry="9" fill="#58a040" />
            <ellipse cx="1022" cy="334" rx="7" ry="5" fill="#68b050" opacity="0.5" />
            {/* Berries */}
            <circle cx="1010" cy="336" r="2.5" fill="#dd3838" />
            <circle cx="1010" cy="335" r="1" fill="#ff6060" opacity="0.5" />
            <circle cx="1016" cy="333" r="2" fill="#cc2828" />
            <circle cx="1025" cy="335" r="2.5" fill="#dd3838" />
            <circle cx="1025" cy="334" r="1" fill="#ff6060" opacity="0.5" />
            <circle cx="1030" cy="338" r="1.8" fill="#cc2828" />
          </g>

          {/* Bush bottom */}
          <g>
            <ellipse cx="550" cy="704" rx="16" ry="11" fill="#3a7822" />
            <ellipse cx="550" cy="700" rx="14" ry="9" fill="#4a8a30" />
            <ellipse cx="547" cy="696" rx="10" ry="7" fill="#58a040" />
            <ellipse cx="553" cy="694" rx="5" ry="4" fill="#68b050" opacity="0.5" />
          </g>

          {/* Small plant tufts */}
          <g>
            <ellipse cx="340" cy="242" rx="10" ry="6" fill="#428a28" opacity="0.6" />
            <ellipse cx="340" cy="239" rx="8" ry="5" fill="#50922e" opacity="0.7" />
            <ellipse cx="337" cy="237" rx="4" ry="3" fill="#60a238" opacity="0.5" />

            <ellipse cx="760" cy="562" rx="9" ry="6" fill="#428a28" opacity="0.5" />
            <ellipse cx="760" cy="559" rx="7" ry="5" fill="#50922e" opacity="0.6" />

            <ellipse cx="130" cy="660" rx="7" ry="4" fill="#428a28" opacity="0.5" />
            <ellipse cx="130" cy="658" rx="5" ry="3" fill="#50922e" opacity="0.6" />

            <ellipse cx="900" cy="350" rx="8" ry="5" fill="#428a28" opacity="0.5" />
            <ellipse cx="900" cy="348" rx="6" ry="4" fill="#50922e" opacity="0.6" />
          </g>

          {/* ===== TREES — detailed with trunks, shadows, layered canopy ===== */}
          {/* Tree top-left */}
          <g>
            <ellipse cx="65" cy="115" rx="30" ry="10" fill="url(#treeShadow)" />
            <rect x="58" y="90" width="14" height="35" rx="3" fill="#4a2810" />
            <rect x="60" y="92" width="10" height="30" rx="2" fill="#5a3818" />
            <rect x="63" y="95" width="4" height="12" rx="1" fill="#6a4822" opacity="0.4" />
            <circle cx="65" cy="75" r="52" fill="#2e6a1a" />
            <circle cx="40" cy="55" r="38" fill="#3a7a22" />
            <circle cx="85" cy="48" r="32" fill="#348020" />
            <circle cx="55" cy="40" r="28" fill="#48922e" />
            <circle cx="78" cy="35" r="22" fill="#3e8426" />
            <circle cx="48" cy="32" r="18" fill="#52a034" opacity="0.6" />
            {/* Leaf highlights */}
            <circle cx="38" cy="42" r="8" fill="#5aaa3a" opacity="0.3" />
            <circle cx="75" cy="30" r="6" fill="#5aaa3a" opacity="0.25" />
          </g>

          {/* Tree top-right */}
          <g>
            <ellipse cx="1140" cy="135" rx="32" ry="10" fill="url(#treeShadow)" />
            <rect x="1133" y="105" width="14" height="38" rx="3" fill="#4a2810" />
            <rect x="1135" y="107" width="10" height="33" rx="2" fill="#5a3818" />
            <rect x="1138" y="110" width="4" height="14" rx="1" fill="#6a4822" opacity="0.4" />
            <circle cx="1140" cy="90" r="58" fill="#2e6a1a" />
            <circle cx="1165" cy="65" r="42" fill="#3a7a22" />
            <circle cx="1118" cy="60" r="35" fill="#348020" />
            <circle cx="1148" cy="48" r="30" fill="#48922e" />
            <circle cx="1125" cy="45" r="25" fill="#3e8426" />
            <circle cx="1155" cy="40" r="20" fill="#52a034" opacity="0.6" />
            <circle cx="1130" cy="38" r="10" fill="#5aaa3a" opacity="0.3" />
          </g>

          {/* Tree bottom-left */}
          <g>
            <ellipse cx="80" cy="755" rx="25" ry="8" fill="url(#treeShadow)" />
            <rect x="73" y="730" width="14" height="30" rx="3" fill="#4a2810" />
            <rect x="75" y="732" width="10" height="26" rx="2" fill="#5a3818" />
            <circle cx="80" cy="720" r="48" fill="#2e6a1a" />
            <circle cx="58" cy="703" r="34" fill="#3a7a22" />
            <circle cx="95" cy="698" r="28" fill="#348020" />
            <circle cx="72" cy="695" r="24" fill="#48922e" />
            <circle cx="90" cy="690" r="18" fill="#3e8426" />
            <circle cx="65" cy="692" r="12" fill="#5aaa3a" opacity="0.3" />
          </g>

          {/* Tree bottom-right */}
          <g>
            <ellipse cx="1130" cy="755" rx="28" ry="9" fill="url(#treeShadow)" />
            <rect x="1123" y="728" width="14" height="32" rx="3" fill="#4a2810" />
            <rect x="1125" y="730" width="10" height="28" rx="2" fill="#5a3818" />
            <circle cx="1130" cy="712" r="50" fill="#2e6a1a" />
            <circle cx="1155" cy="692" r="38" fill="#3a7a22" />
            <circle cx="1108" cy="695" r="30" fill="#348020" />
            <circle cx="1138" cy="685" r="26" fill="#48922e" />
            <circle cx="1115" cy="688" r="20" fill="#3e8426" />
            <circle cx="1145" cy="680" r="14" fill="#52a034" opacity="0.5" />
          </g>

          {/* Mid-edge trees */}
          <g>
            <ellipse cx="1165" cy="445" rx="20" ry="7" fill="url(#treeShadow)" />
            <rect x="1158" y="420" width="12" height="28" rx="3" fill="#4a2810" />
            <rect x="1160" y="422" width="8" height="24" rx="2" fill="#5a3818" />
            <circle cx="1162" cy="410" r="38" fill="#2e6a1a" />
            <circle cx="1172" cy="395" r="28" fill="#3a7a22" />
            <circle cx="1155" cy="392" r="22" fill="#348020" />
            <circle cx="1168" cy="388" r="18" fill="#48922e" />
            <circle cx="1158" cy="385" r="10" fill="#5aaa3a" opacity="0.3" />
          </g>

          <g>
            <ellipse cx="35" cy="430" rx="22" ry="8" fill="url(#treeShadow)" />
            <rect x="28" y="405" width="12" height="28" rx="3" fill="#4a2810" />
            <rect x="30" y="407" width="8" height="24" rx="2" fill="#5a3818" />
            <circle cx="32" cy="395" r="40" fill="#2e6a1a" />
            <circle cx="18" cy="378" r="30" fill="#3a7a22" />
            <circle cx="45" cy="375" r="24" fill="#348020" />
            <circle cx="28" cy="370" r="20" fill="#48922e" />
            <circle cx="40" cy="367" r="12" fill="#5aaa3a" opacity="0.3" />
          </g>

          {/* Extra tree: mid-top */}
          <g>
            <ellipse cx="600" cy="48" rx="18" ry="6" fill="url(#treeShadow)" />
            <rect x="594" y="28" width="10" height="24" rx="2" fill="#4a2810" />
            <rect x="596" y="30" width="7" height="20" rx="2" fill="#5a3818" />
            <circle cx="598" cy="18" r="34" fill="#2e6a1a" />
            <circle cx="610" cy="5" r="25" fill="#3a7a22" />
            <circle cx="588" cy="8" r="20" fill="#348020" />
            <circle cx="600" cy="2" r="16" fill="#48922e" />
          </g>

          {/* ===== CLOVERS / GROUND DETAIL ===== */}
          <g fill="#4a9030" opacity="0.35">
            <circle cx="220" cy="260" r="2.5" />
            <circle cx="224" cy="258" r="2.5" />
            <circle cx="222" cy="255" r="2.5" />

            <circle cx="680" cy="650" r="2" />
            <circle cx="683" cy="648" r="2" />
            <circle cx="681" cy="645" r="2" />

            <circle cx="480" cy="180" r="2" />
            <circle cx="483" cy="178" r="2" />
            <circle cx="481" cy="175" r="2" />

            <circle cx="940" cy="620" r="2.5" />
            <circle cx="943" cy="618" r="2.5" />
            <circle cx="941" cy="615" r="2.5" />
          </g>

          {/* ===== DANDELION PUFFS — wispy white seed heads ===== */}
          <g>
            {/* Puff 1 */}
            <line x1="370" y1="560" x2="370" y2="550" stroke="#5a8a30" strokeWidth="0.8" />
            <circle cx="370" cy="548" r="4" fill="white" opacity="0.3" />
            <circle cx="368" cy="546" r="1" fill="white" opacity="0.5" />
            <circle cx="372" cy="546" r="1" fill="white" opacity="0.5" />
            <circle cx="370" cy="544" r="1" fill="white" opacity="0.5" />
            <circle cx="370" cy="550" r="1" fill="white" opacity="0.4" />
            <circle cx="367" cy="549" r="0.8" fill="white" opacity="0.4" />
            <circle cx="373" cy="549" r="0.8" fill="white" opacity="0.4" />
            {/* Puff 2 */}
            <line x1="1060" y1="480" x2="1060" y2="471" stroke="#5a8a30" strokeWidth="0.8" />
            <circle cx="1060" cy="469" r="3.5" fill="white" opacity="0.25" />
            <circle cx="1058" cy="468" r="0.8" fill="white" opacity="0.5" />
            <circle cx="1062" cy="467" r="0.8" fill="white" opacity="0.5" />
            <circle cx="1060" cy="466" r="0.8" fill="white" opacity="0.5" />
            <circle cx="1060" cy="470" r="0.8" fill="white" opacity="0.4" />
          </g>

          {/* ===== WILDFLOWER SCATTER — tiny dots across meadow ===== */}
          <g>
            {/* White wildflowers */}
            <circle cx="160" cy="340" r="1.5" fill="white" opacity="0.5" />
            <circle cx="165" cy="345" r="1.2" fill="white" opacity="0.4" />
            <circle cx="420" cy="230" r="1.3" fill="white" opacity="0.45" />
            <circle cx="750" cy="520" r="1.5" fill="white" opacity="0.4" />
            <circle cx="1080" cy="300" r="1.2" fill="white" opacity="0.45" />
            <circle cx="880" cy="750" r="1.4" fill="white" opacity="0.4" />
            <circle cx="340" cy="740" r="1.3" fill="white" opacity="0.45" />
            <circle cx="620" cy="260" r="1.2" fill="white" opacity="0.4" />
            {/* Blue wildflowers */}
            <circle cx="190" cy="420" r="1.5" fill="#6688cc" opacity="0.5" />
            <circle cx="830" cy="230" r="1.3" fill="#6688cc" opacity="0.45" />
            <circle cx="480" cy="720" r="1.4" fill="#6688cc" opacity="0.5" />
            <circle cx="1020" cy="560" r="1.2" fill="#6688cc" opacity="0.45" />
            <circle cx="680" cy="340" r="1.3" fill="#6688cc" opacity="0.4" />
            {/* Orange wildflowers */}
            <circle cx="240" cy="580" r="1.3" fill="#e8a040" opacity="0.5" />
            <circle cx="860" cy="460" r="1.2" fill="#e8a040" opacity="0.45" />
            <circle cx="150" cy="700" r="1.4" fill="#e8a040" opacity="0.45" />
            <circle cx="970" cy="260" r="1.3" fill="#e8a040" opacity="0.5" />
          </g>

          {/* ===== SMALL PEBBLES scattered across ground ===== */}
          <g opacity="0.3">
            <ellipse cx="300" cy="420" rx="2" ry="1.2" fill="#8a8070" />
            <ellipse cx="720" cy="240" rx="1.8" ry="1" fill="#8a8070" />
            <ellipse cx="540" cy="580" rx="2.2" ry="1.3" fill="#908878" />
            <ellipse cx="180" cy="480" rx="1.5" ry="1" fill="#8a8070" />
            <ellipse cx="1000" cy="640" rx="2" ry="1.2" fill="#908878" />
            <ellipse cx="430" cy="130" rx="1.8" ry="1" fill="#8a8070" />
            <ellipse cx="830" cy="540" rx="1.5" ry="1" fill="#908878" />
            <ellipse cx="620" cy="760" rx="2" ry="1.2" fill="#8a8070" />
          </g>

          {/* ===== EXTRA GRASS PATCHES — filler tufts for density ===== */}
          <g stroke="#4a8830" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.35">
            <path d="M472,280 L470,270 M474,280 L474,268 M476,280 L478,270" />
            <path d="M142,550 L140,540 M144,550 L144,538 M146,550 L148,540" />
            <path d="M892,480 L890,470 M894,480 L894,468 M896,480 L898,470" />
            <path d="M352,660 L350,650 M354,660 L354,648 M356,660 L358,650" />
            <path d="M1042,180 L1040,170 M1044,180 L1044,168 M1046,180 L1048,170" />
            <path d="M582,160 L580,150 M584,160 L584,148 M586,160 L588,150" />
            <path d="M772,630 L770,620 M774,630 L774,618 M776,630 L778,620" />
            <path d="M242,130 L240,120 M244,130 L244,118 M246,130 L248,120" />
          </g>
        </svg>

        {/* Atmospheric overlays */}
        <div className="meadow-vignette" />
        <div className="meadow-light-rays" />
        <div className="meadow-fog meadow-fog-1" />
        <div className="meadow-fog meadow-fog-2" />
        <div className="meadow-particles">
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              className="meadow-firefly"
              style={{
                left: `${8 + ((i * 37 + 13) % 84)}%`,
                animationDuration: `${6 + (i % 5) * 1.4}s`,
                animationDelay: `${(i * 1.3) % 8}s`,
              }}
            />
          ))}
        </div>

        {/* Monsters */}
        <div className="meadow-monsters">
          {monsters.map((mon, i) => (
            <IslandMonster
              key={mon.instance.instanceId}
              owned={mon}
              positionIndex={i}
            />
          ))}
          {monsters.length === 0 && (
            <div className="meadow-empty-prompt">
              Tap Summon to get your first monster!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
