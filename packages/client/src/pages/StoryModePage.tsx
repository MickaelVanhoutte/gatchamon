import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { GameIcon, StarRating } from '../components/icons';
import { getTemplate, REGIONS, getFloorCount, getGymLeader, getLeagueChampion, isLeagueRegion, STORY_ENERGY_COST, STORY_ARCS, getArcForRegion } from '@gatchamon/shared';
import type { Difficulty, StoryArc, Player } from '@gatchamon/shared';
import { getFloorDefsForRegion } from '../services/floor.service';
import { getFloorRewardPreview } from '../services/reward.service';
import type { FloorRewardPreview } from '../services/reward.service';
import { loadStoryDifficulty, saveStoryDifficulty } from '../services/storage';
import { assetUrl } from '../utils/asset-url';
import { useRotatedScroll } from '../hooks/useRotatedScroll';
import { useRotatedHorizontalScroll } from '../hooks/useRotatedHorizontalScroll';
import { useTutorialStore } from '../stores/tutorialStore';
import './StoryModePage.css';

interface FloorEnemy {
  templateId: number;
  level: number;
  stars: number;
}

interface FloorInfo {
  region: number;
  floor: number;
  difficulty: Difficulty;
  enemyCount: number;
  isBoss: boolean;
  enemies: FloorEnemy[];
  rewardPreview: FloorRewardPreview;
}

const DIFFICULTIES: { key: Difficulty; label: string; color: string }[] = [
  { key: 'normal', label: 'Normal', color: '#78c850' },
  { key: 'hard', label: 'Hard', color: '#f08030' },
  { key: 'hell', label: 'Hell', color: '#e94560' },
];

const MAP_W = 1800;
const MAP_H = 600;

function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  const t = 1 / 6;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) * t;
    const cp1y = p1.y + (p2.y - p0.y) * t;
    const cp2x = p2.x - (p3.x - p1.x) * t;
    const cp2y = p2.y - (p3.y - p1.y) * t;
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return d;
}

function getMonsterName(templateId: number): string {
  return getTemplate(templateId)?.name ?? `#${templateId}`;
}

function isArcUnlocked(arc: StoryArc, player: Player | null): boolean {
  if (!arc.prerequisite) return true;
  if (!player) return false;
  const prereqArc = STORY_ARCS.find(a => a.id === arc.prerequisite!.arcId);
  if (!prereqArc) return false;
  const progress = player.storyProgress[arc.prerequisite.difficulty];
  return prereqArc.regionIds.every(rId => {
    const floorCount = getFloorCount(rId);
    return progress[rId] === floorCount + 1;
  });
}

export function StoryModePage() {
  const { player } = useGameStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [floors, setFloors] = useState<FloorInfo[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>(() => {
    const saved = loadStoryDifficulty();
    if (['normal', 'hard', 'hell'].includes(saved)) return saved as Difficulty;
    return 'normal';
  });
  const [selectedArc, setSelectedArc] = useState<string>('kanto');
  const floorListRef = useRef<HTMLDivElement>(null);
  const worldMapRef = useRef<HTMLDivElement>(null);
  useRotatedScroll(floorListRef);
  useRotatedHorizontalScroll(worldMapRef);

  const tutorialStep = useTutorialStore(s => s.step);
  const advanceTutorial = useTutorialStore(s => s.advanceStep);

  // Tutorial: auto-select region 1 when arriving at step 8
  useEffect(() => {
    if (tutorialStep === 8 && !selectedRegionId) {
      setSelectedRegionId(1);
      advanceTutorial(); // advance to step 9 (floor GO spotlight)
    }
  }, [tutorialStep]);

  const currentArc = STORY_ARCS.find(a => a.id === selectedArc);
  const arcRegions = currentArc ? REGIONS.filter(r => currentArc.regionIds.includes(r.id)) : REGIONS;

  // Reset selected region when switching arcs
  useEffect(() => {
    setSelectedRegionId(null);
  }, [selectedArc]);

  // Auto-open region from query params (e.g. returning from battle)
  useEffect(() => {
    const regionParam = searchParams.get('region');
    const diffParam = searchParams.get('difficulty') as Difficulty | null;
    if (regionParam) {
      if (diffParam && ['normal', 'hard', 'hell'].includes(diffParam)) {
        setDifficulty(diffParam);
        saveStoryDifficulty(diffParam);
      }
      const regionId = Number(regionParam);
      const arc = getArcForRegion(regionId);
      if (arc) setSelectedArc(arc.id);
      setSelectedRegionId(regionId);
      // Clean up query params
      setSearchParams({}, { replace: true });
    }
  }, []);

  useEffect(() => {
    if (selectedRegionId) {
      const defs = getFloorDefsForRegion(selectedRegionId, difficulty);
      const floorList: FloorInfo[] = Object.entries(defs).map(([floorNum, def]) => {
        const fn = Number(floorNum);
        const enemies = def.enemies.map(e => ({ templateId: e.templateId, level: e.level, stars: e.stars }));
        return {
          region: selectedRegionId,
          floor: fn,
          difficulty,
          enemyCount: def.enemies.length,
          isBoss: def.isBoss,
          enemies,
          rewardPreview: getFloorRewardPreview(selectedRegionId, fn, difficulty, def.enemies),
        };
      });
      setFloors(floorList);
    }
  }, [selectedRegionId, difficulty]);

  // Auto-scroll to first non-finished level when opening a region
  useEffect(() => {
    if (!floorListRef.current || floors.length === 0 || !selectedRegionId) return;
    setTimeout(() => {
      const currentEl = floorListRef.current?.querySelector('.floor-entry.current');
      if (currentEl) {
        currentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  }, [floors, selectedRegionId]);

  // Fall back to 'normal' if saved difficulty is not unlocked
  useEffect(() => {
    if (!player) return;
    const rp = player.storyProgress[difficulty];
    if (!rp || Object.keys(rp).length === 0) {
      if (difficulty !== 'normal') {
        setDifficulty('normal');
        saveStoryDifficulty('normal');
      }
    }
  }, [player]);

  // Auto-scroll map to the furthest available (non-completed) region on mount
  useEffect(() => {
    if (!player || !worldMapRef.current) return;
    const rp = player.storyProgress[difficulty] ?? {};
    // Find the last region that is 'available' (not completed, not locked)
    let targetRegion: typeof REGIONS[number] | null = null;
    for (const region of arcRegions) {
      const floor = rp[region.id];
      if (floor === undefined) continue; // locked
      if (floor <= getFloorCount(region.id)) {
        targetRegion = region; // available — keep going to find the furthest one
      }
    }
    // If all are completed, scroll to the last region
    if (!targetRegion) {
      for (let i = arcRegions.length - 1; i >= 0; i--) {
        if (rp[arcRegions[i].id] !== undefined) { targetRegion = arcRegions[i]; break; }
      }
    }
    if (!targetRegion) return;
    const container = worldMapRef.current;
    const scrollTarget = (targetRegion.mapPosition.x / MAP_W) * container.scrollWidth - container.clientWidth / 2;
    setTimeout(() => {
      container.scrollLeft = Math.max(0, scrollTarget);
    }, 50);
  }, [player, difficulty, selectedArc]);

  if (!player) return null;

  const progress = player.storyProgress;
  const regionProgress = progress[difficulty] ?? {};
  const selectedRegion = arcRegions.find(r => r.id === selectedRegionId);
  const selectedFloors = selectedRegion
    ? floors.filter(f => f.region === selectedRegion.id)
    : [];

  function isDifficultyUnlocked(diff: Difficulty): boolean {
    if (!currentArc) return diff === 'normal';
    const rp = progress[diff];
    return rp && rp[currentArc.regionIds[0]] !== undefined;
  }

  function getRegionStatus(regionId: number) {
    const floor = regionProgress[regionId];
    if (floor === undefined) return 'locked';
    if (floor === getFloorCount(regionId) + 1) return 'completed';
    return 'available';
  }

  function getRegionStars(regionId: number) {
    const floor = regionProgress[regionId] ?? 0;
    const total = getFloorCount(regionId);
    const completed = floor === total + 1 ? total : Math.max(0, floor - 1);
    return { completed, total };
  }

  function handleDifficultyChange(diff: Difficulty) {
    if (!isDifficultyUnlocked(diff)) return;
    setDifficulty(diff);
    saveStoryDifficulty(diff);
    setSelectedRegionId(null);
    setFloors([]);
  }

  // Waypoints between regions to break the regular zigzag into organic curves
  const kantoWaypoints = [
    { x: 100, y: 380 },    // Pewter Passage
    { x: 175, y: 355 },    // drift right, barely rise
    { x: 235, y: 275 },    // then steeper rise
    { x: 280, y: 220 },    // Cerulean Cove
    { x: 320, y: 235 },    // linger high, slight dip
    { x: 375, y: 340 },    // swing down
    { x: 430, y: 400 },    // continue
    { x: 460, y: 420 },    // Vermilion Docks
    { x: 500, y: 410 },    // stay low, drift right
    { x: 560, y: 345 },    // gradual rise
    { x: 610, y: 280 },    // continue
    { x: 650, y: 250 },    // Celadon Gardens
    { x: 700, y: 265 },    // linger, slight dip
    { x: 760, y: 355 },    // then drop
    { x: 810, y: 415 },    // approach low
    { x: 840, y: 440 },    // Fuchsia Marsh
    { x: 875, y: 425 },    // stay low
    { x: 935, y: 340 },    // rise
    { x: 985, y: 245 },    // continue rising
    { x: 1020, y: 200 },   // Saffron Towers
    { x: 1060, y: 215 },   // linger high
    { x: 1110, y: 295 },   // then drop
    { x: 1155, y: 355 },   // continue
    { x: 1180, y: 380 },   // Cinnabar Volcano
    { x: 1215, y: 370 },   // stay level
    { x: 1260, y: 295 },   // then rise
    { x: 1305, y: 220 },   // continue
    { x: 1340, y: 180 },   // Viridian Fortress
    { x: 1385, y: 195 },   // linger high
    { x: 1440, y: 275 },   // then drop
    { x: 1480, y: 330 },   // continue
    { x: 1500, y: 350 },   // Victory Road
    { x: 1545, y: 345 },   // almost flat
    { x: 1615, y: 300 },   // gentle rise
    { x: 1680, y: 260 },   // Pokemon League
  ];
  const johtoWaypoints = [
    { x: 100, y: 300 },    // Violet Skies
    { x: 155, y: 325 },    // drift down
    { x: 215, y: 395 },    // swing low
    { x: 280, y: 440 },    // Azalea Woods
    { x: 330, y: 420 },    // linger low
    { x: 380, y: 350 },    // rise
    { x: 425, y: 290 },    // continue
    { x: 460, y: 260 },    // Goldenrod City
    { x: 505, y: 275 },    // slight dip
    { x: 560, y: 335 },    // drop
    { x: 610, y: 370 },    // continue
    { x: 640, y: 380 },    // Ecruteak Shrine
    { x: 685, y: 395 },    // stay low
    { x: 740, y: 435 },    // drop further
    { x: 790, y: 455 },    // approach low
    { x: 820, y: 460 },    // Cianwood Shore
    { x: 860, y: 445 },    // stay low
    { x: 920, y: 380 },    // rise
    { x: 965, y: 330 },    // continue
    { x: 1000, y: 300 },   // Olivine Harbor
    { x: 1040, y: 315 },   // slight dip
    { x: 1095, y: 375 },   // drop
    { x: 1145, y: 405 },   // continue
    { x: 1180, y: 420 },   // Mahogany Frost
    { x: 1220, y: 405 },   // stay level
    { x: 1275, y: 340 },   // rise
    { x: 1325, y: 280 },   // continue
    { x: 1360, y: 250 },   // Blackthorn Peak
    { x: 1400, y: 265 },   // linger
    { x: 1450, y: 325 },   // drop
    { x: 1490, y: 365 },   // continue
    { x: 1520, y: 380 },   // Johto Victory Road
    { x: 1560, y: 370 },   // drift
    { x: 1620, y: 310 },   // rise
    { x: 1680, y: 260 },   // Johto Pokemon League
  ];
  const pathWaypoints = selectedArc === 'johto' ? johtoWaypoints : kantoWaypoints;
  const smoothPath = buildSmoothPath(pathWaypoints);

  return (
    <div className="page story-page">
      {/* World Map — horizontal scroll */}
      <div className="world-map" ref={worldMapRef} data-horizontal-scroll>
        <div className="map-scroll">
          {/* SVG Map background */}
          <svg className="map-svg" viewBox={`0 0 ${MAP_W} ${MAP_H}`} preserveAspectRatio="xMidYMid slice">
            <defs>
              <radialGradient id="treeShadow">
                <stop offset="0%" stopColor="rgba(0,0,0,0.15)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              <filter id="mapGroundNoise" x="0" y="0" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
                <feColorMatrix type="saturate" values="0" in="noise" result="grey" />
                <feBlend in="SourceGraphic" in2="grey" mode="soft-light" />
              </filter>
              <filter id="pathGlow">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
              </filter>
            </defs>

            {/* ===== BASE GROUND ===== */}
            <rect width={MAP_W} height={MAP_H} fill="#78aa52" filter="url(#mapGroundNoise)" />

            {/* Lighter grass patches — ambient variation */}
            <ellipse cx="190" cy="150" rx="130" ry="85" fill="#82b858" opacity={0.25} />
            <ellipse cx="560" cy="520" rx="140" ry="90" fill="#80b454" opacity={0.2} />
            <ellipse cx="920" cy="130" rx="120" ry="80" fill="#7cb256" opacity={0.18} />
            <ellipse cx="1300" cy="500" rx="130" ry="85" fill="#7aae52" opacity={0.15} />
            {/* Darker grass patches */}
            <ellipse cx="380" cy="100" rx="100" ry="65" fill="#5a9a3c" opacity={0.18} />
            <ellipse cx="750" cy="530" rx="110" ry="70" fill="#5c9c40" opacity={0.15} />
            <ellipse cx="1100" cy="520" rx="100" ry="60" fill="#5a9838" opacity={0.12} />

            {/* Biome identity comes from decorations, no colored background circles */}

            {/* ===== BIOME DECORATIONS ===== */}

            {/* --- Verdant Woods (100,380): Trees, bushes, lush foliage --- */}
            <g>
              <ellipse cx="55" cy="320" rx="25" ry="8" fill="url(#treeShadow)" />
              <rect x="49" y="295" width="12" height="30" rx="3" fill="#4a2810" />
              <rect x="51" y="297" width="8" height="26" rx="2" fill="#5a3818" />
              <circle cx="55" cy="280" r="42" fill="#2e6a1a" />
              <circle cx="35" cy="265" r="30" fill="#3a7a22" />
              <circle cx="70" cy="260" r="26" fill="#348020" />
              <circle cx="50" cy="255" r="22" fill="#48922e" />
              <circle cx="65" cy="250" r="16" fill="#52a034" opacity={0.5} />
            </g>
            <g>
              <ellipse cx="140" cy="480" rx="22" ry="7" fill="url(#treeShadow)" />
              <rect x="134" y="458" width="11" height="26" rx="2" fill="#4a2810" />
              <rect x="136" y="460" width="7" height="22" rx="2" fill="#5a3818" />
              <circle cx="140" cy="445" r="36" fill="#2e6a1a" />
              <circle cx="122" cy="432" r="26" fill="#3a7a22" />
              <circle cx="155" cy="428" r="22" fill="#348020" />
              <circle cx="138" cy="425" r="18" fill="#48922e" />
            </g>
            <g>
              <ellipse cx="170" cy="310" rx="16" ry="5" fill="url(#treeShadow)" />
              <rect x="165" y="292" width="9" height="22" rx="2" fill="#4a2810" />
              <circle cx="170" cy="280" r="26" fill="#2e6a1a" />
              <circle cx="158" cy="270" r="18" fill="#3a7a22" />
              <circle cx="180" cy="268" r="16" fill="#348020" />
              <circle cx="168" cy="265" r="13" fill="#48922e" />
            </g>
            <g>
              <ellipse cx="30" cy="210" rx="14" ry="5" fill="url(#treeShadow)" />
              <rect x="25" y="192" width="8" height="20" rx="2" fill="#4a2810" />
              <circle cx="30" cy="182" r="22" fill="#2e6a1a" />
              <circle cx="20" cy="174" r="16" fill="#3a7a22" />
              <circle cx="38" cy="172" r="14" fill="#348020" />
              <circle cx="28" cy="170" r="11" fill="#48922e" />
            </g>
            {/* Bushes */}
            <g>
              <ellipse cx="90" cy="430" rx="16" ry="10" fill="#3a7822" />
              <ellipse cx="90" cy="426" rx="14" ry="8" fill="#4a8a30" />
              <ellipse cx="87" cy="423" rx="10" ry="6" fill="#58a040" />
              <circle cx="84" cy="420" r="2" fill="#8866cc" />
              <circle cx="94" cy="419" r="1.5" fill="#9976dd" />
            </g>
            <g>
              <ellipse cx="60" cy="510" rx="14" ry="9" fill="#3a7822" />
              <ellipse cx="60" cy="507" rx="12" ry="7" fill="#4a8a30" />
              <ellipse cx="57" cy="504" rx="8" ry="5" fill="#58a040" />
            </g>
            {/* Mushrooms */}
            <g>
              <rect x="118" y="395" width="2" height="5" fill="#d8c8a0" />
              <ellipse cx="119" cy="394" rx="4" ry="3" fill="#cc4444" />
              <circle cx="117" cy="393" r="0.8" fill="white" opacity={0.6} />
              <rect x="126" y="397" width="1.5" height="4" fill="#d8c8a0" />
              <ellipse cx="127" cy="396.5" rx="3" ry="2.2" fill="#cc5544" />
            </g>
            {/* Fallen log */}
            <g>
              <ellipse cx="190" cy="540" rx="22" ry="4" fill="rgba(0,0,0,0.08)" />
              <path d="M174,538 Q190,532 206,536" stroke="#5a3418" strokeWidth="8" strokeLinecap="round" fill="none" />
              <path d="M174,538 Q190,532 206,536" stroke="#6a4420" strokeWidth="6" strokeLinecap="round" fill="none" />
              <path d="M177,535 Q190,530 203,534" stroke="#7a5830" strokeWidth="2" strokeLinecap="round" fill="none" opacity={0.4} />
              <ellipse cx="206" cy="536" rx="3.5" ry="4" fill="#5a3418" />
              <ellipse cx="206" cy="536" rx="2.5" ry="3" fill="#6a4420" />
              <ellipse cx="180" cy="535" rx="5" ry="2" fill="#3a7a22" opacity={0.4} />
            </g>
            {/* Rocks, flowers, grass */}
            <g>
              <ellipse cx="130" cy="340" rx="10" ry="6" fill="#7a6850" />
              <ellipse cx="130" cy="338" rx="8" ry="5" fill="#8a7860" />
            </g>
            <g>
              <line x1="60" y1="470" x2="60" y2="462" stroke="#3a7a22" strokeWidth="1" />
              <circle cx="60" cy="461" r="3.5" fill="#8866cc" />
              <circle cx="60" cy="461" r="1.3" fill="#f0d850" />
              <line x1="68" y1="468" x2="68" y2="461" stroke="#3a7a22" strokeWidth="0.8" />
              <circle cx="68" cy="460" r="2.5" fill="#9976dd" />
              <circle cx="68" cy="460" r="0.8" fill="#f0d850" />
            </g>
            <g stroke="#3a7828" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity={0.5}>
              <path d="M40,440 L37,426 M43,440 L43,423 M46,440 L49,427" />
              <path d="M160,400 L157,388 M163,400 L163,385 M166,400 L169,388" />
              <path d="M100,350 L97,338 M103,350 L103,335 M106,350 L109,338" />
              <path d="M70,500 L67,488 M73,500 L73,485 M76,500 L79,488" />
              <path d="M130,260 L128,248 M132,260 L132,246 M134,260 L136,248" />
              <path d="M50,150 L48,140 M52,150 L52,138 M54,150 L56,140" />
              <path d="M180,530 L178,520 M182,530 L182,518 M184,530 L186,520" />
              <path d="M120,440 L118,430 M122,440 L122,428 M124,440 L126,430" />
            </g>
            <line x1="170" y1="480" x2="170" y2="472" stroke="#5a8a30" strokeWidth="0.8" />
            <circle cx="170" cy="470" r="3.5" fill="white" opacity={0.25} />
            <circle cx="168" cy="468" r="0.8" fill="white" opacity={0.45} />
            <circle cx="172" cy="468" r="0.8" fill="white" opacity={0.45} />

            {/* --- Windswept Plains (280,220): Wheat, grass, windswept details --- */}
            {/* Wheat stalks */}
            <g stroke="#b89848" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity={0.55}>
              <path d="M240,195 L237,175 M243,195 L243,172 M246,195 L249,176" />
              <path d="M260,175 L257,155 M263,175 L263,152 M266,175 L269,156" />
              <path d="M290,205 L287,185 M293,205 L293,182 M296,205 L299,186" />
              <path d="M315,190 L312,170 M318,190 L318,167 M321,190 L324,171" />
              <path d="M350,210 L347,190 M353,210 L353,187 M356,210 L359,191" />
              <path d="M275,240 L272,220 M278,240 L278,217 M281,240 L284,221" />
              <path d="M230,250 L228,232 M233,250 L233,229 M236,250 L238,232" />
              <path d="M305,155 L303,138 M308,155 L308,135 M311,155 L313,138" />
            </g>
            <g fill="#c8a850" opacity={0.6}>
              <ellipse cx="237" cy="173" rx="2.5" ry="4" />
              <ellipse cx="243" cy="170" rx="2.5" ry="4" />
              <ellipse cx="249" cy="174" rx="2.5" ry="4" />
              <ellipse cx="257" cy="153" rx="2" ry="3.5" />
              <ellipse cx="263" cy="150" rx="2" ry="3.5" />
              <ellipse cx="269" cy="154" rx="2" ry="3.5" />
              <ellipse cx="287" cy="183" rx="2.5" ry="4" />
              <ellipse cx="293" cy="180" rx="2.5" ry="4" />
              <ellipse cx="299" cy="184" rx="2.5" ry="4" />
              <ellipse cx="312" cy="168" rx="2" ry="3.5" />
              <ellipse cx="318" cy="165" rx="2" ry="3.5" />
              <ellipse cx="347" cy="188" rx="2.5" ry="4" />
              <ellipse cx="353" cy="185" rx="2.5" ry="4" />
              <ellipse cx="272" cy="218" rx="2" ry="3.5" />
              <ellipse cx="278" cy="215" rx="2" ry="3.5" />
              <ellipse cx="228" cy="230" rx="2" ry="3.5" />
              <ellipse cx="233" cy="227" rx="2" ry="3.5" />
              <ellipse cx="303" cy="136" rx="2" ry="3.5" />
              <ellipse cx="308" cy="133" rx="2" ry="3.5" />
            </g>
            {/* Bush */}
            <g>
              <ellipse cx="310" cy="150" rx="12" ry="8" fill="#6a8a32" />
              <ellipse cx="310" cy="147" rx="10" ry="6" fill="#7a9a40" />
              <ellipse cx="308" cy="145" rx="6" ry="4" fill="#8aaa50" opacity={0.5} />
            </g>
            {/* Rocks */}
            <ellipse cx="340" cy="180" rx="8" ry="5" fill="#9a8868" />
            <ellipse cx="340" cy="178" rx="6" ry="4" fill="#aa9878" />
            <ellipse cx="250" cy="260" rx="5" ry="3" fill="#a09478" opacity={0.3} />
            {/* Hay bale */}
            <ellipse cx="320" cy="260" rx="10" ry="7" fill="#c0a050" opacity={0.4} />
            <ellipse cx="320" cy="258" rx="8" ry="5" fill="#d0b060" opacity={0.35} />
            <path d="M312,258 L328,258" stroke="#b09040" strokeWidth="0.5" opacity={0.3} />
            {/* Fence posts */}
            <rect x="355" y="165" width="2" height="12" fill="#8a7050" opacity={0.4} />
            <rect x="370" y="170" width="2" height="12" fill="#8a7050" opacity={0.35} />
            <line x1="356" y1="170" x2="371" y2="175" stroke="#8a7050" strokeWidth="1" opacity={0.3} />
            {/* Flowers and grass */}
            <g>
              <line x1="330" y1="235" x2="330" y2="228" stroke="#7a8a30" strokeWidth="0.8" />
              <circle cx="330" cy="227" r="2.5" fill="#e8c840" />
              <circle cx="330" cy="227" r="1" fill="#e8a020" />
              <line x1="220" y1="230" x2="220" y2="223" stroke="#7a8a30" strokeWidth="0.8" />
              <circle cx="220" cy="222" r="2" fill="#f0d850" />
              <circle cx="220" cy="222" r="0.8" fill="#e8a020" />
              <line x1="300" y1="260" x2="300" y2="252" stroke="#7a8a30" strokeWidth="0.8" />
              <circle cx="297" cy="251" r="1.8" fill="#f0d850" />
              <circle cx="303" cy="251" r="1.8" fill="#f0d850" />
              <circle cx="300" cy="251" r="1.5" fill="#e8a020" />
            </g>
            <g stroke="#b89848" strokeWidth="1" strokeLinecap="round" fill="none" opacity={0.4}>
              <path d="M230,280 L228,268 M232,280 L232,266 M234,280 L236,268" />
              <path d="M320,270 L318,258 M322,270 L322,256 M324,270 L326,258" />
              <path d="M260,160 L258,148 M262,160 L262,146 M264,160 L266,148" />
              <path d="M290,300 L288,288 M292,300 L292,286 M294,300 L296,288" />
            </g>
            {/* Mushroom */}
            <rect x="295" y="285" width="1.5" height="4" fill="#d8c8a0" />
            <ellipse cx="296" cy="284.5" rx="3.5" ry="2.5" fill="#dda040" />

            {/* --- Toxic Marsh (460,420): Murky pools, dead stumps, toxic mushrooms --- */}
            <ellipse cx="440" cy="440" rx="50" ry="30" fill="#4a3848" opacity={0.3} />
            <ellipse cx="440" cy="438" rx="42" ry="24" fill="#5a486a" opacity={0.35} />
            <ellipse cx="435" cy="435" rx="20" ry="12" fill="#6a5878" opacity={0.25} />
            <ellipse cx="490" cy="395" rx="35" ry="20" fill="#4a3848" opacity={0.25} />
            <ellipse cx="490" cy="393" rx="28" ry="15" fill="#5a486a" opacity={0.3} />
            <ellipse cx="420" cy="480" rx="25" ry="14" fill="#4a3848" opacity={0.2} />
            <ellipse cx="420" cy="478" rx="18" ry="10" fill="#5a486a" opacity={0.25} />
            {/* Bubbles */}
            <circle cx="432" cy="432" r="2" fill="#7a6888" opacity={0.4} />
            <circle cx="445" cy="436" r="1.5" fill="#7a6888" opacity={0.35} />
            <circle cx="488" cy="390" r="1.5" fill="#7a6888" opacity={0.35} />
            <circle cx="425" cy="475" r="1.2" fill="#7a6888" opacity={0.3} />
            {/* Dead tree stumps */}
            <g>
              <rect x="420" y="370" width="8" height="18" rx="1" fill="#4a3020" />
              <rect x="422" y="372" width="4" height="14" rx="1" fill="#5a4028" />
              <line x1="424" y1="370" x2="418" y2="360" stroke="#4a3020" strokeWidth="2" strokeLinecap="round" />
              <line x1="424" y1="375" x2="430" y2="366" stroke="#4a3020" strokeWidth="1.5" strokeLinecap="round" />
            </g>
            <g>
              <rect x="480" y="445" width="6" height="14" rx="1" fill="#4a3020" />
              <line x1="483" y1="445" x2="478" y2="437" stroke="#4a3020" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="483" y1="448" x2="488" y2="440" stroke="#4a3020" strokeWidth="1" strokeLinecap="round" />
            </g>
            <g>
              <rect x="505" y="420" width="5" height="12" rx="1" fill="#4a3020" />
              <line x1="507" y1="420" x2="512" y2="413" stroke="#4a3020" strokeWidth="1.5" strokeLinecap="round" />
            </g>
            {/* Toxic mushrooms */}
            <g>
              <rect x="455" y="460" width="2" height="5" fill="#a898a0" />
              <ellipse cx="456" cy="459" rx="4.5" ry="3" fill="#8a4a8a" />
              <circle cx="454" cy="458" r="0.8" fill="#c88ac8" opacity={0.5} />
              <rect x="465" y="462" width="1.5" height="4" fill="#a898a0" />
              <ellipse cx="466" cy="461.5" rx="3.5" ry="2.2" fill="#9a5a9a" />
              <rect x="435" y="410" width="1.5" height="4" fill="#a898a0" />
              <ellipse cx="436" cy="409" rx="3" ry="2" fill="#7a3a7a" />
            </g>
            {/* Cattails / reeds */}
            <g>
              <line x1="450" y1="430" x2="448" y2="412" stroke="#5a6a30" strokeWidth="1.5" />
              <ellipse cx="448" cy="410" rx="2.5" ry="5" fill="#6a5030" />
              <line x1="458" y1="432" x2="456" y2="416" stroke="#5a6a30" strokeWidth="1" />
              <ellipse cx="456" cy="414" rx="2" ry="4" fill="#6a5030" />
              <line x1="495" y1="400" x2="493" y2="384" stroke="#5a6a30" strokeWidth="1.5" />
              <ellipse cx="493" cy="382" rx="2.5" ry="5" fill="#6a5030" />
            </g>
            {/* Swamp grass */}
            <g stroke="#5a6838" strokeWidth="1" strokeLinecap="round" fill="none" opacity={0.4}>
              <path d="M410,450 L408,438 M412,450 L413,435 M414,450 L417,438" />
              <path d="M500,430 L498,418 M502,430 L503,415 M504,430 L507,418" />
              <path d="M430,480 L428,468 M432,480 L432,466 M434,480 L436,468" />
              <path d="M470,350 L468,338 M472,350 L472,336 M474,350 L476,338" />
            </g>

            {/* --- Crystal Caverns (650,250): Rocky terrain, crystals, cave --- */}
            <g>
              <ellipse cx="630" cy="270" rx="28" ry="18" fill="#6a6058" />
              <ellipse cx="630" cy="266" rx="26" ry="16" fill="#7a7068" />
              <ellipse cx="626" cy="262" rx="10" ry="6" fill="#8a8078" opacity={0.4} />
              <ellipse cx="658" cy="262" rx="20" ry="14" fill="#5a5048" />
              <ellipse cx="658" cy="258" rx="18" ry="12" fill="#706860" />
            </g>
            <g>
              <ellipse cx="680" cy="230" rx="18" ry="12" fill="#6a6058" />
              <ellipse cx="680" cy="227" rx="16" ry="10" fill="#7a7068" />
            </g>
            <g>
              <ellipse cx="700" cy="310" rx="14" ry="8" fill="#5a5048" />
              <ellipse cx="700" cy="307" rx="12" ry="6" fill="#6a6058" />
              <ellipse cx="715" cy="305" rx="8" ry="5" fill="#5a5048" />
              <ellipse cx="715" cy="303" rx="6" ry="4" fill="#6a6058" />
            </g>
            <g>
              <ellipse cx="610" cy="220" rx="12" ry="7" fill="#6a6058" />
              <ellipse cx="610" cy="218" rx="10" ry="5" fill="#7a7068" />
            </g>
            {/* Crystal formations */}
            <g>
              <polygon points="640,240 644,215 648,240" fill="#7890b0" opacity={0.5} />
              <polygon points="644,240 647,220 650,240" fill="#88a0c0" opacity={0.35} />
              <polygon points="650,242 653,225 656,242" fill="#7088a8" opacity={0.45} />
              <polygon points="670,205 673,185 676,205" fill="#7890b0" opacity={0.4} />
              <polygon points="675,207 677,192 679,207" fill="#88a0c0" opacity={0.3} />
              <polygon points="695,275 697,260 699,275" fill="#7890b0" opacity={0.35} />
              <polygon points="698,277 699,265 700,277" fill="#88a0c0" opacity={0.25} />
            </g>
            {/* Cave entrance */}
            <ellipse cx="620" cy="290" rx="25" ry="15" fill="#3a3430" opacity={0.4} />
            <ellipse cx="620" cy="288" rx="20" ry="10" fill="#2a2420" opacity={0.3} />
            {/* Stalactite hints */}
            <g fill="#5a5048" opacity={0.3}>
              <polygon points="614,278 616,270 618,278" />
              <polygon points="622,280 623,273 624,280" />
              <polygon points="628,279 629,272 630,279" />
            </g>
            {/* Pebbles scatter */}
            <ellipse cx="660" cy="285" rx="3" ry="2" fill="#8a8070" opacity={0.35} />
            <ellipse cx="645" cy="295" rx="2.5" ry="1.5" fill="#8a8070" opacity={0.3} />
            <ellipse cx="675" cy="268" rx="2" ry="1.2" fill="#8a8070" opacity={0.3} />
            <ellipse cx="640" cy="205" rx="2" ry="1.2" fill="#7a7068" opacity={0.25} />
            <ellipse cx="690" cy="245" rx="2.5" ry="1.5" fill="#7a7068" opacity={0.25} />
            {/* Sparse gray grass */}
            <g stroke="#5a5a50" strokeWidth="1" strokeLinecap="round" fill="none" opacity={0.3}>
              <path d="M610,310 L608,298 M612,310 L612,296 M614,310 L616,298" />
              <path d="M690,330 L688,318 M692,330 L692,316 M694,330 L696,318" />
              <path d="M655,200 L653,190 M657,200 L657,188 M659,200 L661,190" />
            </g>

            {/* --- Azure Coast (840,440): Water, sand, shells, palms --- */}
            <ellipse cx="840" cy="445" rx="100" ry="60" fill="#d0c090" opacity={0.3} />
            <ellipse cx="860" cy="455" rx="70" ry="40" fill="#d8c898" opacity={0.25} />
            {/* Tidal pools */}
            <ellipse cx="820" cy="435" rx="40" ry="25" fill="#4898b0" opacity={0.35} />
            <ellipse cx="820" cy="433" rx="34" ry="20" fill="#58a8c0" opacity={0.3} />
            <ellipse cx="815" cy="430" rx="15" ry="8" fill="white" opacity={0.06} />
            <ellipse cx="870" cy="410" rx="22" ry="14" fill="#4898b0" opacity={0.25} />
            <ellipse cx="870" cy="408" rx="16" ry="10" fill="#58a8c0" opacity={0.2} />
            {/* Ripples */}
            <ellipse cx="810" cy="438" rx="12" ry="6" fill="none" stroke="white" strokeWidth="0.5" opacity={0.15} />
            <ellipse cx="828" cy="430" rx="8" ry="4" fill="none" stroke="white" strokeWidth="0.5" opacity={0.12} />
            {/* Shore waves */}
            <path d="M780,470 C800,468 820,472 840,468 C860,464 880,468 900,466" fill="none" stroke="#58a0b8" strokeWidth="1.5" opacity={0.3} strokeLinecap="round" />
            <path d="M790,480 C810,478 830,482 850,478 C870,474 890,478 910,476" fill="none" stroke="#58a0b8" strokeWidth="1" opacity={0.2} strokeLinecap="round" />
            {/* Palm-like tree */}
            <g>
              <rect x="796" y="400" width="5" height="20" rx="1" fill="#6a5030" />
              <ellipse cx="798" cy="395" rx="14" ry="6" fill="#3a8830" opacity={0.6} transform="rotate(-20 798 395)" />
              <ellipse cx="798" cy="395" rx="14" ry="6" fill="#3a8830" opacity={0.6} transform="rotate(25 798 395)" />
              <ellipse cx="798" cy="393" rx="12" ry="5" fill="#4a9838" opacity={0.4} transform="rotate(-5 798 393)" />
            </g>
            {/* Shells, coral */}
            <ellipse cx="870" cy="465" rx="3" ry="2" fill="#e0d0b0" opacity={0.5} />
            <ellipse cx="810" cy="460" rx="2.5" ry="1.8" fill="#e0d0b0" opacity={0.45} />
            <ellipse cx="855" cy="475" rx="2" ry="1.5" fill="#e8c0a0" opacity={0.4} />
            <circle cx="885" cy="458" r="2" fill="#e08080" opacity={0.3} />
            <circle cx="887" cy="456" r="1.5" fill="#d07070" opacity={0.25} />
            {/* Seaweed */}
            <g stroke="#3a7848" strokeWidth="1" strokeLinecap="round" fill="none" opacity={0.3}>
              <path d="M795,455 C793,448 796,442 794,435" />
              <path d="M798,455 C800,448 797,442 799,435" />
              <path d="M850,460 C848,453 851,447 849,440" />
            </g>
            {/* Stepping stones */}
            <ellipse cx="850" cy="490" rx="7" ry="4" fill="#90836a" />
            <ellipse cx="850" cy="489" rx="6" ry="3" fill="#a09478" />
            <ellipse cx="838" cy="485" rx="6" ry="3.5" fill="#90836a" />
            <ellipse cx="838" cy="484" rx="5" ry="2.5" fill="#a09478" />
            {/* Rocks on shore */}
            <g>
              <ellipse cx="880" cy="480" rx="11" ry="7" fill="#8a8070" />
              <ellipse cx="880" cy="477" rx="9" ry="5" fill="#9a9080" />
              <ellipse cx="877" cy="475" rx="3.5" ry="2" fill="#b0a890" opacity={0.4} />
            </g>
            {/* Beach grass */}
            <g stroke="#3a7858" strokeWidth="1" strokeLinecap="round" fill="none" opacity={0.3}>
              <path d="M810,510 L808,498 M812,510 L812,496 M814,510 L816,498" />
              <path d="M870,400 L868,388 M872,400 L872,386 M874,400 L876,388" />
              <path d="M900,510 L898,498 M902,510 L902,496 M904,510 L906,498" />
            </g>
            {/* Pink flowers near shore */}
            <g>
              <line x1="900" y1="490" x2="900" y2="483" stroke="#3a7848" strokeWidth="0.8" />
              <circle cx="900" cy="482" r="3" fill="#e880a0" />
              <circle cx="900" cy="482" r="1.2" fill="#ffcc00" />
              <line x1="910" y1="488" x2="910" y2="482" stroke="#3a7848" strokeWidth="0.8" />
              <circle cx="910" cy="481" r="2.5" fill="#f5a0b8" />
            </g>

            {/* --- Thunderpeak Ridge (1020,200): Mountains, lightning, rocks --- */}
            <g>
              <polygon points="990,220 1020,140 1050,220" fill="#4a4a52" opacity={0.4} />
              <polygon points="1000,220 1020,155 1040,220" fill="#5a5a62" opacity={0.3} />
              <polygon points="1015,220 1020,165 1025,220" fill="#6a6a72" opacity={0.2} />
            </g>
            <g>
              <polygon points="1040,230 1060,165 1080,230" fill="#4a4a52" opacity={0.35} />
              <polygon points="1048,230 1060,175 1072,230" fill="#5a5a62" opacity={0.25} />
            </g>
            <g>
              <polygon points="965,240 985,180 1005,240" fill="#3a3a42" opacity={0.3} />
              <polygon points="972,240 985,190 998,240" fill="#5a5a62" opacity={0.2} />
            </g>
            <g>
              <polygon points="1070,210 1085,160 1100,210" fill="#3a3a42" opacity={0.25} />
              <polygon points="1076,210 1085,170 1094,210" fill="#5a5a62" opacity={0.18} />
            </g>
            {/* Lightning bolts */}
            <g stroke="#f0c030" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity={0.4}>
              <path d="M1025,158 L1020,170 L1028,168 L1022,182" />
              <path d="M1065,173 L1062,182 L1067,180 L1063,190" />
              <path d="M988,188 L986,196 L990,194 L987,204" />
            </g>
            {/* Dark rocks */}
            <ellipse cx="1000" cy="230" rx="14" ry="9" fill="#3a3a40" opacity={0.35} />
            <ellipse cx="1000" cy="228" rx="12" ry="7" fill="#4a4a50" opacity={0.3} />
            <ellipse cx="1045" cy="238" rx="10" ry="6" fill="#3a3a40" opacity={0.3} />
            <ellipse cx="1045" cy="236" rx="8" ry="5" fill="#4a4a50" opacity={0.25} />
            <ellipse cx="1060" cy="250" rx="12" ry="8" fill="#3a3a42" />
            <ellipse cx="1060" cy="247" rx="10" ry="6" fill="#4a4a52" />
            <ellipse cx="1075" cy="252" rx="8" ry="5" fill="#3a3a42" />
            {/* Sparse dark tree */}
            <g>
              <ellipse cx="960" cy="310" rx="13" ry="4" fill="url(#treeShadow)" />
              <rect x="956" y="293" width="8" height="20" rx="2" fill="#3a2010" />
              <circle cx="960" cy="284" r="20" fill="#2a5a16" />
              <circle cx="950" cy="277" r="14" fill="#34701e" />
              <circle cx="968" cy="276" r="12" fill="#2e6418" />
            </g>
            {/* Sparse grass */}
            <g stroke="#4a5040" strokeWidth="1" strokeLinecap="round" fill="none" opacity={0.25}>
              <path d="M980,260 L978,248 M982,260 L982,246 M984,260 L986,248" />
              <path d="M1040,200 L1038,188 M1042,200 L1042,186 M1044,200 L1046,188" />
              <path d="M1010,260 L1008,248 M1012,260 L1012,246 M1014,260 L1016,248" />
            </g>

            {/* --- Ember Highlands (1180,380): Lava pools, scorched earth, fire --- */}
            <ellipse cx="1180" cy="385" rx="80" ry="50" fill="#4a2018" opacity={0.25} />
            <ellipse cx="1200" cy="370" rx="50" ry="35" fill="#3a1810" opacity={0.2} />
            {/* Lava pools */}
            <ellipse cx="1165" cy="400" rx="30" ry="18" fill="#c04020" opacity={0.35} />
            <ellipse cx="1165" cy="398" rx="24" ry="14" fill="#e06030" opacity={0.25} />
            <ellipse cx="1160" cy="395" rx="10" ry="5" fill="#f0a040" opacity={0.2} />
            <ellipse cx="1210" cy="360" rx="20" ry="12" fill="#b03818" opacity={0.3} />
            <ellipse cx="1210" cy="358" rx="15" ry="8" fill="#d05030" opacity={0.2} />
            <ellipse cx="1195" cy="420" rx="15" ry="8" fill="#b03818" opacity={0.25} />
            <ellipse cx="1195" cy="418" rx="10" ry="5" fill="#d05030" opacity={0.15} />
            {/* Hot rocks */}
            <g>
              <ellipse cx="1150" cy="365" rx="16" ry="10" fill="#5a2818" />
              <ellipse cx="1150" cy="362" rx="14" ry="8" fill="#6a3820" />
              <ellipse cx="1147" cy="359" rx="5" ry="3" fill="#8a5030" opacity={0.4} />
              <ellipse cx="1170" cy="358" rx="10" ry="7" fill="#5a2818" />
              <ellipse cx="1170" cy="356" rx="8" ry="5" fill="#7a4028" />
            </g>
            <g>
              <ellipse cx="1220" cy="410" rx="10" ry="6" fill="#5a2818" />
              <ellipse cx="1220" cy="408" rx="8" ry="5" fill="#6a3820" />
            </g>
            {/* Dead trees */}
            <g>
              <rect x="1130" y="340" width="6" height="22" rx="1" fill="#3a2010" />
              <line x1="1133" y1="345" x2="1125" y2="335" stroke="#3a2010" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="1133" y1="350" x2="1140" y2="340" stroke="#3a2010" strokeWidth="2" strokeLinecap="round" />
            </g>
            <g>
              <rect x="1215" y="335" width="5" height="18" rx="1" fill="#3a2010" />
              <line x1="1217" y1="338" x2="1222" y2="330" stroke="#3a2010" strokeWidth="1.5" strokeLinecap="round" />
            </g>
            {/* Ember particles */}
            <g fill="#f0a040" opacity={0.35}>
              <circle cx="1175" cy="388" r="1.5" />
              <circle cx="1162" cy="392" r="1" />
              <circle cx="1185" cy="395" r="1.2" />
              <circle cx="1205" cy="353" r="1" />
              <circle cx="1198" cy="415" r="1" />
            </g>
            {/* Scorched bush */}
            <g>
              <ellipse cx="1200" cy="420" rx="10" ry="6" fill="#5a3820" />
              <ellipse cx="1200" cy="418" rx="8" ry="5" fill="#6a4828" />
            </g>
            {/* Scorched grass */}
            <g stroke="#6a4020" strokeWidth="1" strokeLinecap="round" fill="none" opacity={0.35}>
              <path d="M1140,410 L1138,398 M1142,410 L1143,395 M1144,410 L1147,398" />
              <path d="M1220,390 L1218,378 M1222,390 L1223,375 M1224,390 L1227,378" />
              <path d="M1190,430 L1188,418 M1192,430 L1193,415 M1194,430 L1197,418" />
            </g>

            {/* --- Phantom Ruins (1340,180): Ruined pillars, ghost wisps, dark vegetation --- */}
            <g>
              <rect x="1320" y="155" width="12" height="35" rx="1" fill="#5a4870" opacity={0.5} />
              <rect x="1318" y="152" width="16" height="5" rx="1" fill="#6a5880" opacity={0.45} />
              <rect x="1318" y="188" width="16" height="5" rx="1" fill="#6a5880" opacity={0.45} />
              <polygon points="1318,152 1322,145 1330,148 1334,152" fill="#5a4870" opacity={0.4} />
            </g>
            <g>
              <rect x="1355" y="165" width="10" height="25" rx="1" fill="#5a4870" opacity={0.45} />
              <rect x="1353" y="162" width="14" height="4" rx="1" fill="#6a5880" opacity={0.4} />
              <rect x="1353" y="188" width="14" height="4" rx="1" fill="#6a5880" opacity={0.4} />
            </g>
            {/* Third pillar */}
            <g>
              <rect x="1375" y="148" width="9" height="20" rx="1" fill="#5a4870" opacity={0.4} />
              <rect x="1373" y="145" width="13" height="4" rx="1" fill="#6a5880" opacity={0.35} />
            </g>
            {/* Fallen pillar */}
            <g>
              <ellipse cx="1370" cy="210" rx="25" ry="5" fill="rgba(0,0,0,0.08)" />
              <rect x="1350" y="204" width="40" height="8" rx="2" fill="#5a4870" opacity={0.35} transform="rotate(-8 1370 208)" />
            </g>
            {/* Broken wall */}
            <g opacity={0.35}>
              <rect x="1305" y="165" width="6" height="14" rx="1" fill="#4a3860" />
              <rect x="1308" y="170" width="4" height="10" rx="1" fill="#4a3860" />
              <rect x="1313" y="168" width="3" height="8" rx="1" fill="#4a3860" />
            </g>
            {/* Ghost wisps */}
            <g fill="#8a78b0" opacity={0.15}>
              <ellipse cx="1330" cy="170" rx="8" ry="12" />
              <ellipse cx="1360" cy="175" rx="6" ry="10" />
              <ellipse cx="1345" cy="195" rx="10" ry="6" />
              <ellipse cx="1375" cy="165" rx="5" ry="8" />
            </g>
            {/* Spooky tree */}
            <g>
              <rect x="1295" y="225" width="7" height="22" rx="1" fill="#2a1830" />
              <circle cx="1298" cy="216" r="16" fill="#1e1228" opacity={0.6} />
              <circle cx="1290" cy="210" r="11" fill="#2a1838" opacity={0.5} />
              <circle cx="1305" cy="209" r="10" fill="#221430" opacity={0.5} />
            </g>
            {/* Dark bush */}
            <g>
              <ellipse cx="1320" cy="230" rx="10" ry="7" fill="#2a1838" />
              <ellipse cx="1320" cy="228" rx="8" ry="5" fill="#3a2848" />
            </g>
            {/* Phantom rocks */}
            <ellipse cx="1370" cy="200" rx="8" ry="5" fill="#4a3860" />
            <ellipse cx="1370" cy="198" rx="6" ry="4" fill="#5a4870" />
            {/* Dark grass */}
            <g stroke="#3a2848" strokeWidth="1" strokeLinecap="round" fill="none" opacity={0.3}>
              <path d="M1310,200 L1308,188 M1312,200 L1313,185 M1314,200 L1317,188" />
              <path d="M1380,195 L1378,183 M1382,195 L1383,180 M1384,195 L1387,183" />
              <path d="M1350,220 L1348,208 M1352,220 L1352,206 M1354,220 L1356,208" />
            </g>

            {/* --- Frozen Tundra (1500,350): Snow, ice, pine trees --- */}
            <ellipse cx="1490" cy="365" rx="60" ry="30" fill="#e0eef8" opacity={0.5} />
            <ellipse cx="1520" cy="340" rx="45" ry="25" fill="#d8e8f4" opacity={0.4} />
            <ellipse cx="1470" cy="380" rx="40" ry="20" fill="#e8f2fa" opacity={0.35} />
            <ellipse cx="1540" cy="370" rx="35" ry="18" fill="#e0eef8" opacity={0.3} />
            {/* Ice crystals */}
            <g>
              <polygon points="1480,320 1483,302 1486,320" fill="#a0c8e8" opacity={0.45} />
              <polygon points="1484,322 1486,308 1488,322" fill="#b0d8f0" opacity={0.3} />
              <polygon points="1530,315 1532,300 1534,315" fill="#90b8d8" opacity={0.4} />
              <polygon points="1533,317 1534,305 1535,317" fill="#a0c8e8" opacity={0.25} />
              <polygon points="1460,340 1462,328 1464,340" fill="#a0c8e8" opacity={0.35} />
              <polygon points="1463,342 1464,332 1465,342" fill="#b0d8f0" opacity={0.2} />
            </g>
            {/* Frost-covered rocks */}
            <g>
              <ellipse cx="1510" cy="368" rx="14" ry="9" fill="#8898a0" />
              <ellipse cx="1510" cy="365" rx="12" ry="7" fill="#98a8b0" />
              <ellipse cx="1507" cy="362" rx="5" ry="3" fill="#c8d8e0" opacity={0.5} />
            </g>
            <g>
              <ellipse cx="1470" cy="400" rx="10" ry="6" fill="#8898a0" />
              <ellipse cx="1470" cy="398" rx="8" ry="5" fill="#98a8b0" />
            </g>
            {/* Pine trees */}
            <g>
              <rect x="1446" y="300" width="6" height="18" rx="1" fill="#3a2810" />
              <polygon points="1440,305 1458,305 1449,280" fill="#2a5a3a" opacity={0.6} />
              <polygon points="1442,295 1456,295 1449,274" fill="#3a6a48" opacity={0.5} />
              <polygon points="1444,286 1454,286 1449,268" fill="#4a7a58" opacity={0.4} />
            </g>
            <g>
              <rect x="1538" y="310" width="5" height="16" rx="1" fill="#3a2810" />
              <polygon points="1532,315 1548,315 1540,292" fill="#2a5a3a" opacity={0.55} />
              <polygon points="1534,306 1546,306 1540,287" fill="#3a6a48" opacity={0.45} />
              <polygon points="1536,298 1544,298 1540,282" fill="#4a7a58" opacity={0.35} />
            </g>
            <g>
              <rect x="1471" y="340" width="4" height="14" rx="1" fill="#3a2810" />
              <polygon points="1466,345 1480,345 1473,326" fill="#2a5a3a" opacity={0.5} />
              <polygon points="1468,338 1478,338 1473,322" fill="#3a6a48" opacity={0.4} />
            </g>
            {/* Snowflakes */}
            <g fill="white" opacity={0.35}>
              <circle cx="1475" cy="330" r="1.5" />
              <circle cx="1505" cy="325" r="1" />
              <circle cx="1540" cy="340" r="1.2" />
              <circle cx="1490" cy="355" r="1" />
              <circle cx="1525" cy="355" r="1.3" />
              <circle cx="1460" cy="360" r="1" />
              <circle cx="1550" cy="360" r="0.8" />
            </g>
            {/* Icy puddle */}
            <ellipse cx="1495" cy="375" rx="18" ry="10" fill="#90c0d8" opacity={0.25} />
            <ellipse cx="1495" cy="374" rx="14" ry="7" fill="#a0d0e4" opacity={0.2} />
            {/* Frosted bush */}
            <g>
              <ellipse cx="1540" cy="390" rx="11" ry="7" fill="#6a8a78" />
              <ellipse cx="1540" cy="388" rx="9" ry="5" fill="#8aaa98" />
              <ellipse cx="1538" cy="386" rx="4" ry="2.5" fill="#c0d8d0" opacity={0.4} />
            </g>

            {/* --- Pokemon League (1680,260): Grand Castle --- */}
            {/* Castle shadow */}
            <ellipse cx="1680" cy="310" rx="80" ry="18" fill="rgba(0,0,0,0.1)" />

            {/* Castle base / main body */}
            <rect x="1645" y="230" width="70" height="80" rx="2" fill="#6858a8" />
            <rect x="1647" y="232" width="66" height="76" rx="1" fill="#7868b8" />
            {/* Stone texture lines */}
            <line x1="1650" y1="250" x2="1712" y2="250" stroke="#6050a0" strokeWidth="0.8" opacity={0.3} />
            <line x1="1650" y1="268" x2="1712" y2="268" stroke="#6050a0" strokeWidth="0.8" opacity={0.3} />
            <line x1="1650" y1="286" x2="1712" y2="286" stroke="#6050a0" strokeWidth="0.8" opacity={0.3} />

            {/* Gate / entrance */}
            <rect x="1668" y="278" width="24" height="32" rx="12" fill="#3a2860" />
            <rect x="1670" y="280" width="20" height="30" rx="10" fill="#2a1848" />
            {/* Gate door lines */}
            <line x1="1680" y1="280" x2="1680" y2="310" stroke="#3a2860" strokeWidth="1" />
            {/* Gate arch highlight */}
            <path d="M1670,290 Q1680,275 1690,290" fill="none" stroke="#8a78c8" strokeWidth="0.8" opacity={0.4} />

            {/* Left tower */}
            <rect x="1630" y="200" width="24" height="110" rx="1" fill="#5848a0" />
            <rect x="1632" y="202" width="20" height="106" rx="1" fill="#6858b0" />
            {/* Left tower top / battlement */}
            <rect x="1628" y="195" width="28" height="8" rx="1" fill="#5848a0" />
            <rect x="1630" y="190" width="4" height="8" fill="#5848a0" />
            <rect x="1638" y="190" width="4" height="8" fill="#5848a0" />
            <rect x="1646" y="190" width="4" height="8" fill="#5848a0" />
            {/* Left tower window */}
            <rect x="1638" y="218" width="8" height="12" rx="4" fill="#2a1848" />
            <rect x="1639" y="219" width="6" height="10" rx="3" fill="#3a2860" />
            <circle cx="1642" cy="222" r="1.2" fill="#f0c040" opacity={0.6} />
            {/* Left tower second window */}
            <rect x="1638" y="248" width="8" height="10" rx="2" fill="#2a1848" opacity={0.7} />

            {/* Right tower */}
            <rect x="1706" y="200" width="24" height="110" rx="1" fill="#5848a0" />
            <rect x="1708" y="202" width="20" height="106" rx="1" fill="#6858b0" />
            {/* Right tower top / battlement */}
            <rect x="1704" y="195" width="28" height="8" rx="1" fill="#5848a0" />
            <rect x="1706" y="190" width="4" height="8" fill="#5848a0" />
            <rect x="1714" y="190" width="4" height="8" fill="#5848a0" />
            <rect x="1722" y="190" width="4" height="8" fill="#5848a0" />
            {/* Right tower window */}
            <rect x="1714" y="218" width="8" height="12" rx="4" fill="#2a1848" />
            <rect x="1715" y="219" width="6" height="10" rx="3" fill="#3a2860" />
            <circle cx="1718" cy="222" r="1.2" fill="#f0c040" opacity={0.6} />
            {/* Right tower second window */}
            <rect x="1714" y="248" width="8" height="10" rx="2" fill="#2a1848" opacity={0.7} />

            {/* Center tower (tallest) */}
            <rect x="1665" y="170" width="30" height="62" rx="1" fill="#5040a0" />
            <rect x="1667" y="172" width="26" height="58" rx="1" fill="#6050b0" />
            {/* Center battlement */}
            <rect x="1663" y="165" width="34" height="8" rx="1" fill="#5040a0" />
            <rect x="1665" y="160" width="5" height="8" fill="#5040a0" />
            <rect x="1674" y="160" width="5" height="8" fill="#5040a0" />
            <rect x="1683" y="160" width="5" height="8" fill="#5040a0" />
            <rect x="1692" y="160" width="5" height="8" fill="#5040a0" />
            {/* Center spire */}
            <polygon points="1680,135 1674,160 1686,160" fill="#4838a0" />
            <polygon points="1680,138 1676,158 1684,158" fill="#5848b0" />
            {/* Gold finial on spire */}
            <circle cx="1680" cy="134" r="3" fill="#d0a030" />
            <circle cx="1680" cy="134" r="2" fill="#e8c050" />
            {/* Center window (large) */}
            <rect x="1674" y="182" width="12" height="16" rx="6" fill="#2a1848" />
            <rect x="1675" y="183" width="10" height="14" rx="5" fill="#3a2860" />
            <circle cx="1680" cy="187" r="2" fill="#f0c040" opacity={0.7} />
            {/* Center small window */}
            <rect x="1676" y="208" width="8" height="8" rx="2" fill="#2a1848" opacity={0.7} />

            {/* Main wall battlement */}
            <rect x="1645" y="226" width="70" height="6" rx="1" fill="#5848a0" />
            <rect x="1654" y="222" width="4" height="6" fill="#5848a0" />
            <rect x="1662" y="222" width="4" height="6" fill="#5848a0" />
            <rect x="1694" y="222" width="4" height="6" fill="#5848a0" />
            <rect x="1702" y="222" width="4" height="6" fill="#5848a0" />

            {/* Side walls extending out */}
            <rect x="1620" y="270" width="28" height="40" rx="1" fill="#5a4898" opacity={0.6} />
            <rect x="1712" y="270" width="28" height="40" rx="1" fill="#5a4898" opacity={0.6} />
            {/* Side wall battlements */}
            <rect x="1620" y="266" width="28" height="5" rx="1" fill="#5040a0" opacity={0.5} />
            <rect x="1622" y="262" width="3" height="6" fill="#5040a0" opacity={0.5} />
            <rect x="1630" y="262" width="3" height="6" fill="#5040a0" opacity={0.5} />
            <rect x="1638" y="262" width="3" height="6" fill="#5040a0" opacity={0.5} />
            <rect x="1712" y="266" width="28" height="5" rx="1" fill="#5040a0" opacity={0.5} />
            <rect x="1714" y="262" width="3" height="6" fill="#5040a0" opacity={0.5} />
            <rect x="1722" y="262" width="3" height="6" fill="#5040a0" opacity={0.5} />
            <rect x="1730" y="262" width="3" height="6" fill="#5040a0" opacity={0.5} />

            {/* Gold banner across front */}
            <path d="M1642,238 C1655,244 1665,244 1680,238 C1695,244 1705,244 1718,238" fill="none" stroke="#d0a030" strokeWidth="1.5" opacity={0.5} />
            {/* Hanging pennants */}
            <polygon points="1655,244 1658,254 1652,254" fill="#d04060" opacity={0.4} />
            <polygon points="1680,238 1683,248 1677,248" fill="#d0a030" opacity={0.45} />
            <polygon points="1705,244 1708,254 1702,254" fill="#d04060" opacity={0.4} />

            {/* Pokeball emblem above gate */}
            <circle cx="1680" cy="270" r="6" fill="#d04040" opacity={0.6} />
            <rect x="1674" y="269" width="12" height="2" fill="#2a1848" opacity={0.5} />
            <circle cx="1680" cy="270" r="2.5" fill="white" opacity={0.5} />
            <circle cx="1680" cy="270" r="1.5" fill="#2a1848" opacity={0.4} />

            {/* Torch flames on towers */}
            <g>
              <ellipse cx="1632" cy="240" rx="2" ry="4" fill="#f0a020" opacity={0.5} />
              <ellipse cx="1632" cy="238" rx="1.5" ry="2.5" fill="#f0d040" opacity={0.4} />
              <ellipse cx="1728" cy="240" rx="2" ry="4" fill="#f0a020" opacity={0.5} />
              <ellipse cx="1728" cy="238" rx="1.5" ry="2.5" fill="#f0d040" opacity={0.4} />
            </g>

            {/* Stone path leading to gate */}
            <ellipse cx="1680" cy="320" rx="14" ry="5" fill="#6a5898" opacity={0.3} />
            <ellipse cx="1680" cy="330" rx="18" ry="5" fill="#6a5898" opacity={0.2} />
            <ellipse cx="1680" cy="340" rx="22" ry="5" fill="#6a5898" opacity={0.15} />

            {/* Ornamental trees flanking castle */}
            <g>
              <ellipse cx="1612" cy="310" rx="10" ry="3" fill="url(#treeShadow)" />
              <rect x="1608" y="296" width="6" height="16" rx="1" fill="#3a2010" />
              <circle cx="1612" cy="288" r="14" fill="#2a5a2a" />
              <circle cx="1605" cy="283" r="10" fill="#346a32" />
              <circle cx="1618" cy="282" r="9" fill="#2e6028" />
            </g>
            <g>
              <ellipse cx="1748" cy="310" rx="10" ry="3" fill="url(#treeShadow)" />
              <rect x="1744" y="296" width="6" height="16" rx="1" fill="#3a2010" />
              <circle cx="1748" cy="288" r="14" fill="#2a5a2a" />
              <circle cx="1741" cy="283" r="10" fill="#346a32" />
              <circle cx="1754" cy="282" r="9" fill="#2e6028" />
            </g>

            {/* ===== SCATTERED DETAILS across transitions ===== */}
            {/* Transition trees */}
            <g>
              <ellipse cx="360" cy="490" rx="16" ry="5" fill="url(#treeShadow)" />
              <rect x="355" y="470" width="9" height="24" rx="2" fill="#4a2810" />
              <circle cx="360" cy="458" r="26" fill="#3a7a22" />
              <circle cx="348" cy="448" r="18" fill="#48922e" />
              <circle cx="370" cy="446" r="16" fill="#348020" />
            </g>
            <g>
              <ellipse cx="590" cy="180" rx="14" ry="5" fill="url(#treeShadow)" />
              <rect x="585" y="162" width="8" height="20" rx="2" fill="#4a2810" />
              <circle cx="590" cy="152" r="22" fill="#2e6a1a" />
              <circle cx="580" cy="144" r="15" fill="#3a7a22" />
              <circle cx="598" cy="142" r="13" fill="#348020" />
            </g>
            <g>
              <ellipse cx="780" cy="380" rx="12" ry="4" fill="url(#treeShadow)" />
              <rect x="776" y="365" width="7" height="18" rx="2" fill="#4a2810" />
              <circle cx="780" cy="356" r="18" fill="#2e6a1a" />
              <circle cx="772" cy="349" r="12" fill="#3a7a22" />
            </g>
            {/* Wildflowers everywhere */}
            <g>
              <circle cx="80" cy="280" r="1.5" fill="white" opacity={0.45} />
              <circle cx="150" cy="450" r="1.2" fill="white" opacity={0.4} />
              <circle cx="220" cy="180" r="1.3" fill="white" opacity={0.4} />
              <circle cx="350" cy="350" r="1.5" fill="white" opacity={0.35} />
              <circle cx="520" cy="300" r="1.2" fill="white" opacity={0.3} />
              <circle cx="680" cy="340" r="1" fill="white" opacity={0.25} />
              <circle cx="820" cy="380" r="1.3" fill="white" opacity={0.3} />
              <circle cx="1000" cy="260" r="1" fill="white" opacity={0.25} />
              <circle cx="1480" cy="420" r="1.5" fill="white" opacity={0.35} />
              <circle cx="1700" cy="300" r="1.2" fill="white" opacity={0.3} />
              <circle cx="120" cy="360" r="1.5" fill="#e8c840" opacity={0.45} />
              <circle cx="260" cy="290" r="1.3" fill="#f0d850" opacity={0.4} />
              <circle cx="440" cy="350" r="1.5" fill="#7a58b0" opacity={0.35} />
              <circle cx="730" cy="300" r="1.5" fill="#6688cc" opacity={0.35} />
              <circle cx="850" cy="420" r="1.3" fill="#5a80c0" opacity={0.3} />
              <circle cx="1100" cy="350" r="1.3" fill="#e88040" opacity={0.3} />
              <circle cx="1350" cy="240" r="1.3" fill="#7a58b0" opacity={0.3} />
              <circle cx="1510" cy="370" r="1.2" fill="#80a8d0" opacity={0.3} />
              <circle cx="1690" cy="240" r="1" fill="#c0a050" opacity={0.3} />
            </g>
            {/* Pebbles */}
            <g opacity={0.3}>
              <ellipse cx="80" cy="400" rx="2" ry="1.2" fill="#8a7860" />
              <ellipse cx="230" cy="240" rx="2.2" ry="1.3" fill="#9a8868" />
              <ellipse cx="420" cy="500" rx="2" ry="1.2" fill="#7a6858" />
              <ellipse cx="620" cy="200" rx="2" ry="1.2" fill="#6a6860" />
              <ellipse cx="830" cy="350" rx="1.5" ry="0.9" fill="#7a8878" />
              <ellipse cx="1060" cy="310" rx="1.8" ry="1" fill="#4a4a50" />
              <ellipse cx="1240" cy="280" rx="1.5" ry="0.9" fill="#5a3828" />
              <ellipse cx="1430" cy="300" rx="2" ry="1.2" fill="#7a8890" />
              <ellipse cx="1620" cy="300" rx="1.5" ry="0.9" fill="#6a58a0" />
              <ellipse cx="1750" cy="350" rx="2" ry="1.2" fill="#5a4880" />
            </g>

            {/* ===== FOREST CLUSTERS + SCATTERED TREES ===== */}

            {/* --- Forest cluster: top-left (x~30-120, y~40-130) --- */}
            <g>
              <rect x="38" y="78" width="8" height="20" rx="2" fill="#4a2810" />
              <circle cx="42" cy="65" r="22" fill="#2e6a1a" />
              <circle cx="32" cy="57" r="15" fill="#3a7a22" />
              <circle cx="50" cy="56" r="13" fill="#348020" />
            </g>
            <g>
              <rect x="76" y="60" width="7" height="18" rx="2" fill="#4a2810" />
              <circle cx="80" cy="48" r="19" fill="#3a7a22" />
              <circle cx="71" cy="42" r="13" fill="#2e6a1a" />
              <circle cx="88" cy="40" r="11" fill="#48922e" />
            </g>
            <g>
              <rect x="58" y="108" width="6" height="14" rx="1" fill="#4a2810" />
              <circle cx="61" cy="100" r="14" fill="#2e6a1a" />
              <circle cx="54" cy="95" r="10" fill="#3a7a22" />
              <circle cx="67" cy="94" r="9" fill="#348020" />
            </g>
            <g>
              <rect x="108" y="90" width="5" height="12" rx="1" fill="#4a2810" />
              <circle cx="110" cy="83" r="12" fill="#3a7a22" />
              <circle cx="105" cy="79" r="8" fill="#2e6a1a" />
            </g>

            {/* --- Forest cluster: upper-mid (x~380-460, y~50-120) --- */}
            <g>
              <rect x="388" y="68" width="8" height="20" rx="2" fill="#4a2810" />
              <circle cx="392" cy="55" r="21" fill="#2e6a1a" />
              <circle cx="382" cy="48" r="14" fill="#3a7a22" />
              <circle cx="400" cy="46" r="12" fill="#348020" />
            </g>
            <g>
              <rect x="418" y="82" width="7" height="16" rx="2" fill="#4a2810" />
              <circle cx="422" cy="72" r="17" fill="#3a7a22" />
              <circle cx="414" cy="66" r="12" fill="#2e6a1a" />
              <circle cx="429" cy="65" r="10" fill="#48922e" />
            </g>
            <g>
              <rect x="445" y="58" width="6" height="14" rx="1" fill="#4a2810" />
              <circle cx="448" cy="50" r="14" fill="#2e6a1a" />
              <circle cx="441" cy="45" r="10" fill="#3a7a22" />
              <circle cx="454" cy="44" r="9" fill="#348020" />
            </g>

            {/* --- Forest cluster: mid-left (x~200-260, y~480-560) --- */}
            <g>
              <rect x="206" y="518" width="8" height="20" rx="2" fill="#4a2810" />
              <circle cx="210" cy="505" r="22" fill="#2e6a1a" />
              <circle cx="200" cy="498" r="15" fill="#3a7a22" />
              <circle cx="218" cy="496" r="13" fill="#348020" />
            </g>
            <g>
              <rect x="236" y="535" width="7" height="18" rx="2" fill="#4a2810" />
              <circle cx="240" cy="523" r="18" fill="#3a7a22" />
              <circle cx="232" cy="517" r="12" fill="#2e6a1a" />
              <circle cx="247" cy="516" r="11" fill="#48922e" />
            </g>
            <g>
              <rect x="255" y="502" width="6" height="14" rx="1" fill="#4a2810" />
              <circle cx="258" cy="494" r="14" fill="#2e6a1a" />
              <circle cx="252" cy="489" r="10" fill="#3a7a22" />
            </g>
            <g>
              <rect x="186" y="548" width="6" height="14" rx="1" fill="#4a2810" />
              <circle cx="189" cy="540" r="13" fill="#3a7a22" />
              <circle cx="183" cy="536" r="9" fill="#2e6a1a" />
              <circle cx="195" cy="535" r="8" fill="#348020" />
            </g>

            {/* --- Forest cluster: right of Azure Coast (x~700-780, y~500-570) --- */}
            <g>
              <rect x="708" y="538" width="8" height="20" rx="2" fill="#4a2810" />
              <circle cx="712" cy="525" r="20" fill="#2e6a1a" />
              <circle cx="703" cy="518" r="14" fill="#3a7a22" />
              <circle cx="720" cy="516" r="12" fill="#348020" />
            </g>
            <g>
              <rect x="738" y="520" width="7" height="18" rx="2" fill="#4a2810" />
              <circle cx="742" cy="508" r="18" fill="#3a7a22" />
              <circle cx="734" cy="502" r="12" fill="#2e6a1a" />
              <circle cx="749" cy="501" r="10" fill="#48922e" />
            </g>
            <g>
              <rect x="765" y="545" width="6" height="14" rx="1" fill="#4a2810" />
              <circle cx="768" cy="537" r="14" fill="#2e6a1a" />
              <circle cx="762" cy="532" r="10" fill="#3a7a22" />
            </g>

            {/* --- Forest cluster: upper-right (x~860-940, y~50-120) --- */}
            <g>
              <rect x="868" y="62" width="7" height="18" rx="2" fill="#4a2810" />
              <circle cx="872" cy="50" r="19" fill="#2e6a1a" />
              <circle cx="863" cy="43" r="13" fill="#3a7a22" />
              <circle cx="879" cy="42" r="11" fill="#348020" />
            </g>
            <g>
              <rect x="898" y="78" width="7" height="16" rx="2" fill="#4a2810" />
              <circle cx="902" cy="68" r="16" fill="#3a7a22" />
              <circle cx="894" cy="63" r="11" fill="#2e6a1a" />
              <circle cx="909" cy="62" r="10" fill="#48922e" />
            </g>
            <g>
              <rect x="928" y="56" width="6" height="14" rx="1" fill="#4a2810" />
              <circle cx="931" cy="48" r="14" fill="#2e6a1a" />
              <circle cx="925" cy="43" r="10" fill="#3a7a22" />
              <circle cx="937" cy="42" r="9" fill="#348020" />
            </g>

            {/* --- Forest cluster: bottom-mid (x~960-1050, y~520-590) --- */}
            <g>
              <rect x="968" y="558" width="8" height="20" rx="2" fill="#4a2810" />
              <circle cx="972" cy="545" r="21" fill="#2e6a1a" />
              <circle cx="963" cy="538" r="14" fill="#3a7a22" />
              <circle cx="980" cy="537" r="12" fill="#348020" />
            </g>
            <g>
              <rect x="1000" y="540" width="7" height="18" rx="2" fill="#4a2810" />
              <circle cx="1004" cy="528" r="18" fill="#3a7a22" />
              <circle cx="996" cy="522" r="13" fill="#2e6a1a" />
              <circle cx="1011" cy="521" r="10" fill="#48922e" />
            </g>
            <g>
              <rect x="1035" y="562" width="6" height="14" rx="1" fill="#4a2810" />
              <circle cx="1038" cy="554" r="14" fill="#2e6a1a" />
              <circle cx="1032" cy="549" r="10" fill="#3a7a22" />
            </g>

            {/* --- Forest cluster: bottom-right (x~1350-1430, y~460-540) --- */}
            <g>
              <rect x="1358" y="498" width="8" height="20" rx="2" fill="#4a2810" />
              <circle cx="1362" cy="485" r="20" fill="#2e6a1a" />
              <circle cx="1353" cy="478" r="14" fill="#3a7a22" />
              <circle cx="1370" cy="477" r="12" fill="#348020" />
            </g>
            <g>
              <rect x="1390" y="480" width="7" height="18" rx="2" fill="#4a2810" />
              <circle cx="1394" cy="468" r="18" fill="#3a7a22" />
              <circle cx="1386" cy="462" r="12" fill="#2e6a1a" />
              <circle cx="1401" cy="461" r="11" fill="#48922e" />
            </g>
            <g>
              <rect x="1418" y="505" width="6" height="14" rx="1" fill="#4a2810" />
              <circle cx="1421" cy="497" r="14" fill="#2e6a1a" />
              <circle cx="1415" cy="492" r="10" fill="#3a7a22" />
            </g>

            {/* --- Forest cluster: far-right (x~1680-1770, y~420-500) --- */}
            <g>
              <rect x="1688" y="458" width="8" height="20" rx="2" fill="#4a2810" />
              <circle cx="1692" cy="445" r="20" fill="#2e6a1a" />
              <circle cx="1683" cy="438" r="14" fill="#3a7a22" />
              <circle cx="1700" cy="436" r="12" fill="#348020" />
            </g>
            <g>
              <rect x="1718" y="440" width="7" height="18" rx="2" fill="#4a2810" />
              <circle cx="1722" cy="428" r="18" fill="#3a7a22" />
              <circle cx="1714" cy="422" r="12" fill="#2e6a1a" />
              <circle cx="1729" cy="421" r="10" fill="#48922e" />
            </g>
            <g>
              <rect x="1748" y="468" width="6" height="14" rx="1" fill="#4a2810" />
              <circle cx="1751" cy="460" r="14" fill="#2e6a1a" />
              <circle cx="1745" cy="455" r="10" fill="#3a7a22" />
            </g>

            {/* --- Forest cluster: upper far-right (x~1560-1640, y~60-130) --- */}
            <g>
              <rect x="1568" y="80" width="7" height="18" rx="2" fill="#4a2810" />
              <circle cx="1572" cy="68" r="18" fill="#2e6a1a" />
              <circle cx="1563" cy="61" r="12" fill="#3a7a22" />
              <circle cx="1579" cy="60" r="11" fill="#348020" />
            </g>
            <g>
              <rect x="1598" y="96" width="7" height="16" rx="2" fill="#4a2810" />
              <circle cx="1602" cy="86" r="16" fill="#3a7a22" />
              <circle cx="1594" cy="80" r="11" fill="#2e6a1a" />
              <circle cx="1609" cy="79" r="10" fill="#48922e" />
            </g>
            <g>
              <rect x="1628" y="68" width="6" height="14" rx="1" fill="#4a2810" />
              <circle cx="1631" cy="60" r="14" fill="#2e6a1a" />
              <circle cx="1625" cy="55" r="10" fill="#3a7a22" />
            </g>

            {/* --- Scattered solo trees (fill gaps) --- */}
            <g>
              <rect x="176" y="158" width="6" height="16" rx="1" fill="#4a2810" />
              <circle cx="179" cy="148" r="15" fill="#2e6a1a" />
              <circle cx="172" cy="143" r="10" fill="#3a7a22" />
              <circle cx="185" cy="142" r="9" fill="#348020" />
            </g>
            <g>
              <rect x="548" y="538" width="6" height="16" rx="1" fill="#4a2810" />
              <circle cx="551" cy="528" r="15" fill="#3a7a22" />
              <circle cx="544" cy="523" r="10" fill="#2e6a1a" />
              <circle cx="557" cy="522" r="9" fill="#348020" />
            </g>
            <g>
              <rect x="648" y="100" width="6" height="16" rx="1" fill="#4a2810" />
              <circle cx="651" cy="90" r="15" fill="#2e6a1a" />
              <circle cx="644" cy="85" r="10" fill="#3a7a22" />
              <circle cx="657" cy="84" r="9" fill="#348020" />
            </g>
            <g>
              <rect x="1098" y="130" width="6" height="16" rx="1" fill="#4a2810" />
              <circle cx="1101" cy="120" r="15" fill="#3a7a22" />
              <circle cx="1094" cy="115" r="10" fill="#2e6a1a" />
              <circle cx="1107" cy="114" r="9" fill="#348020" />
            </g>
            <g>
              <rect x="1248" y="530" width="6" height="16" rx="1" fill="#4a2810" />
              <circle cx="1251" cy="520" r="15" fill="#2e6a1a" />
              <circle cx="1244" cy="515" r="10" fill="#3a7a22" />
              <circle cx="1257" cy="514" r="9" fill="#348020" />
            </g>
            <g>
              <rect x="1758" y="170" width="6" height="16" rx="1" fill="#4a2810" />
              <circle cx="1761" cy="160" r="15" fill="#3a7a22" />
              <circle cx="1754" cy="155" r="10" fill="#2e6a1a" />
              <circle cx="1767" cy="154" r="9" fill="#348020" />
            </g>
            <g>
              <rect x="498" y="520" width="5" height="12" rx="1" fill="#4a2810" />
              <circle cx="500" cy="513" r="12" fill="#2e6a1a" />
              <circle cx="495" cy="509" r="8" fill="#3a7a22" />
            </g>
            <g>
              <rect x="1158" y="540" width="5" height="12" rx="1" fill="#4a2810" />
              <circle cx="1160" cy="533" r="12" fill="#3a7a22" />
              <circle cx="1155" cy="529" r="8" fill="#2e6a1a" />
            </g>

            {/* ===== GRASS, FLOWERS & BUSHES everywhere ===== */}
            {/* Grass tufts scattered across entire map */}
            <g stroke="#3a7828" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity={0.4}>
              <path d="M30,180 L28,168 M32,180 L32,166 M34,180 L36,168" />
              <path d="M150,50 L148,38 M152,50 L152,36 M154,50 L156,38" />
              <path d="M270,550 L268,538 M272,550 L272,536 M274,550 L276,538" />
              <path d="M350,130 L348,118 M352,130 L352,116 M354,130 L356,118" />
              <path d="M500,40 L498,28 M502,40 L502,26 M504,40 L506,28" />
              <path d="M570,490 L568,478 M572,490 L572,476 M574,490 L576,478" />
              <path d="M660,570 L658,558 M662,570 L662,556 M664,570 L666,558" />
              <path d="M810,100 L808,88 M812,100 L812,86 M814,100 L816,88" />
              <path d="M840,560 L838,548 M842,560 L842,546 M844,560 L846,548" />
              <path d="M1000,50 L998,38 M1002,50 L1002,36 M1004,50 L1006,38" />
              <path d="M1080,570 L1078,558 M1082,570 L1082,556 M1084,570 L1086,558" />
              <path d="M1200,100 L1198,88 M1202,100 L1202,86 M1204,100 L1206,88" />
              <path d="M1320,50 L1318,38 M1322,50 L1322,36 M1324,50 L1326,38" />
              <path d="M1460,560 L1458,548 M1462,560 L1462,546 M1464,560 L1466,548" />
              <path d="M1550,530 L1548,518 M1552,530 L1552,516 M1554,530 L1556,518" />
              <path d="M1700,580 L1698,568 M1702,580 L1702,566 M1704,580 L1706,568" />
              <path d="M1780,120 L1778,108 M1782,120 L1782,106 M1784,120 L1786,108" />
              <path d="M130,570 L128,558 M132,570 L132,556 M134,570 L136,558" />
              <path d="M420,560 L418,548 M422,560 L422,546 M424,560 L426,548" />
              <path d="M620,40 L618,28 M622,40 L622,26 M624,40 L626,28" />
              <path d="M760,555 L758,543 M762,555 L762,541 M764,555 L766,543" />
              <path d="M1140,45 L1138,33 M1142,45 L1142,31 M1144,45 L1146,33" />
              <path d="M1680,55 L1678,43 M1682,55 L1682,41 M1684,55 L1686,43" />
              <path d="M1770,340 L1768,328 M1772,340 L1772,326 M1774,340 L1776,328" />
            </g>
            {/* Flower clusters */}
            <g>
              {/* White daisies */}
              <circle cx="180" cy="500" r="2" fill="white" opacity={0.5} />
              <circle cx="183" cy="498" r="1.5" fill="white" opacity={0.45} />
              <circle cx="310" cy="120" r="2" fill="white" opacity={0.45} />
              <circle cx="530" cy="560" r="1.8" fill="white" opacity={0.4} />
              <circle cx="680" cy="80" r="2" fill="white" opacity={0.4} />
              <circle cx="850" cy="540" r="1.5" fill="white" opacity={0.35} />
              <circle cx="1030" cy="100" r="2" fill="white" opacity={0.4} />
              <circle cx="1150" cy="560" r="1.5" fill="white" opacity={0.35} />
              <circle cx="1280" cy="100" r="1.8" fill="white" opacity={0.4} />
              <circle cx="1450" cy="530" r="2" fill="white" opacity={0.4} />
              <circle cx="1600" cy="550" r="1.5" fill="white" opacity={0.35} />
              <circle cx="1730" cy="120" r="2" fill="white" opacity={0.4} />
              {/* Yellow wildflowers */}
              <line x1="160" y1="130" x2="160" y2="122" stroke="#3a7a22" strokeWidth="0.8" />
              <circle cx="160" cy="121" r="2.5" fill="#f0d850" />
              <circle cx="160" cy="121" r="1" fill="#e8a020" />
              <line x1="340" y1="555" x2="340" y2="547" stroke="#3a7a22" strokeWidth="0.8" />
              <circle cx="340" cy="546" r="2" fill="#f0d850" />
              <circle cx="340" cy="546" r="0.8" fill="#e8a020" />
              <line x1="520" y1="70" x2="520" y2="62" stroke="#3a7a22" strokeWidth="0.8" />
              <circle cx="520" cy="61" r="2.5" fill="#f0d850" />
              <circle cx="520" cy="61" r="1" fill="#e8a020" />
              <line x1="750" y1="560" x2="750" y2="552" stroke="#3a7a22" strokeWidth="0.8" />
              <circle cx="750" cy="551" r="2" fill="#f0d850" />
              <line x1="950" y1="80" x2="950" y2="72" stroke="#3a7a22" strokeWidth="0.8" />
              <circle cx="950" cy="71" r="2.5" fill="#f0d850" />
              <circle cx="950" cy="71" r="1" fill="#e8a020" />
              <line x1="1180" y1="555" x2="1180" y2="547" stroke="#3a7a22" strokeWidth="0.8" />
              <circle cx="1180" cy="546" r="2" fill="#f0d850" />
              <line x1="1350" y1="540" x2="1350" y2="532" stroke="#3a7a22" strokeWidth="0.8" />
              <circle cx="1350" cy="531" r="2.5" fill="#f0d850" />
              <circle cx="1350" cy="531" r="1" fill="#e8a020" />
              <line x1="1500" y1="80" x2="1500" y2="72" stroke="#3a7a22" strokeWidth="0.8" />
              <circle cx="1500" cy="71" r="2" fill="#f0d850" />
              <line x1="1760" y1="550" x2="1760" y2="542" stroke="#3a7a22" strokeWidth="0.8" />
              <circle cx="1760" cy="541" r="2.5" fill="#f0d850" />
              <circle cx="1760" cy="541" r="1" fill="#e8a020" />
              {/* Pink flowers */}
              <line x1="90" y1="560" x2="90" y2="553" stroke="#3a7a22" strokeWidth="0.8" />
              <circle cx="90" cy="552" r="2.5" fill="#e880a0" />
              <circle cx="90" cy="552" r="1" fill="#ffcc00" />
              <line x1="470" y1="70" x2="470" y2="63" stroke="#3a7a22" strokeWidth="0.8" />
              <circle cx="470" cy="62" r="2" fill="#f5a0b8" />
              <line x1="790" y1="50" x2="790" y2="43" stroke="#3a7a22" strokeWidth="0.8" />
              <circle cx="790" cy="42" r="2.5" fill="#e880a0" />
              <circle cx="790" cy="42" r="1" fill="#ffcc00" />
              <line x1="1060" y1="560" x2="1060" y2="553" stroke="#3a7a22" strokeWidth="0.8" />
              <circle cx="1060" cy="552" r="2" fill="#f5a0b8" />
              <line x1="1420" y1="60" x2="1420" y2="53" stroke="#3a7a22" strokeWidth="0.8" />
              <circle cx="1420" cy="52" r="2.5" fill="#e880a0" />
              <circle cx="1420" cy="52" r="1" fill="#ffcc00" />
              <line x1="1660" y1="560" x2="1660" y2="553" stroke="#3a7a22" strokeWidth="0.8" />
              <circle cx="1660" cy="552" r="2" fill="#f5a0b8" />
            </g>
            {/* Small bushes */}
            <g>
              <ellipse cx="310" cy="540" rx="10" ry="7" fill="#3a7822" />
              <ellipse cx="310" cy="537" rx="8" ry="5" fill="#4a8a30" />
              <ellipse cx="308" cy="534" rx="5" ry="3" fill="#58a040" opacity={0.5} />
            </g>
            <g>
              <ellipse cx="580" cy="55" rx="9" ry="6" fill="#3a7822" />
              <ellipse cx="580" cy="52" rx="7" ry="4" fill="#4a8a30" />
            </g>
            <g>
              <ellipse cx="830" cy="570" rx="10" ry="7" fill="#3a7822" />
              <ellipse cx="830" cy="567" rx="8" ry="5" fill="#4a8a30" />
              <ellipse cx="828" cy="564" rx="5" ry="3" fill="#58a040" opacity={0.5} />
            </g>
            <g>
              <ellipse cx="1100" cy="50" rx="9" ry="6" fill="#3a7822" />
              <ellipse cx="1100" cy="47" rx="7" ry="4" fill="#4a8a30" />
            </g>
            <g>
              <ellipse cx="1480" cy="55" rx="10" ry="7" fill="#3a7822" />
              <ellipse cx="1480" cy="52" rx="8" ry="5" fill="#4a8a30" />
              <ellipse cx="1478" cy="49" rx="5" ry="3" fill="#58a040" opacity={0.5} />
            </g>
            <g>
              <ellipse cx="1740" cy="540" rx="9" ry="6" fill="#3a7822" />
              <ellipse cx="1740" cy="537" rx="7" ry="4" fill="#4a8a30" />
            </g>

            {/* ===== EXTRA RIGHT-SIDE DECORATIONS (x>900) ===== */}

            {/* --- Forest cluster: mid-right interior (x~1100-1170, y~430-500) --- */}
            <g>
              <rect x="1108" y="468" width="8" height="20" rx="2" fill="#4a2810" />
              <circle cx="1112" cy="455" r="21" fill="#2e6a1a" />
              <circle cx="1103" cy="448" r="14" fill="#3a7a22" />
              <circle cx="1120" cy="446" r="12" fill="#348020" />
            </g>
            <g>
              <rect x="1138" y="484" width="7" height="18" rx="2" fill="#4a2810" />
              <circle cx="1142" cy="472" r="18" fill="#3a7a22" />
              <circle cx="1134" cy="466" r="12" fill="#2e6a1a" />
              <circle cx="1149" cy="465" r="10" fill="#48922e" />
            </g>
            <g>
              <rect x="1165" y="460" width="6" height="14" rx="1" fill="#4a2810" />
              <circle cx="1168" cy="452" r="14" fill="#2e6a1a" />
              <circle cx="1162" cy="447" r="10" fill="#3a7a22" />
              <circle cx="1174" cy="446" r="9" fill="#348020" />
            </g>

            {/* --- Forest cluster: right-center (x~1260-1330, y~340-410) --- */}
            <g>
              <rect x="1268" y="378" width="8" height="20" rx="2" fill="#4a2810" />
              <circle cx="1272" cy="365" r="20" fill="#2e6a1a" />
              <circle cx="1263" cy="358" r="14" fill="#3a7a22" />
              <circle cx="1280" cy="356" r="12" fill="#348020" />
            </g>
            <g>
              <rect x="1298" y="392" width="7" height="18" rx="2" fill="#4a2810" />
              <circle cx="1302" cy="380" r="18" fill="#3a7a22" />
              <circle cx="1294" cy="374" r="12" fill="#2e6a1a" />
              <circle cx="1309" cy="373" r="10" fill="#48922e" />
            </g>
            <g>
              <rect x="1322" y="370" width="6" height="14" rx="1" fill="#4a2810" />
              <circle cx="1325" cy="362" r="14" fill="#2e6a1a" />
              <circle cx="1319" cy="357" r="10" fill="#3a7a22" />
            </g>

            {/* --- Forest cluster: upper right gap (x~1200-1270, y~50-130) --- */}
            <g>
              <rect x="1208" y="72" width="7" height="18" rx="2" fill="#4a2810" />
              <circle cx="1212" cy="60" r="18" fill="#2e6a1a" />
              <circle cx="1203" cy="53" r="12" fill="#3a7a22" />
              <circle cx="1219" cy="52" r="11" fill="#348020" />
            </g>
            <g>
              <rect x="1238" y="88" width="7" height="16" rx="2" fill="#4a2810" />
              <circle cx="1242" cy="78" r="16" fill="#3a7a22" />
              <circle cx="1234" cy="72" r="11" fill="#2e6a1a" />
              <circle cx="1249" cy="71" r="10" fill="#48922e" />
            </g>
            <g>
              <rect x="1264" y="64" width="6" height="14" rx="1" fill="#4a2810" />
              <circle cx="1267" cy="56" r="14" fill="#2e6a1a" />
              <circle cx="1261" cy="51" r="10" fill="#3a7a22" />
            </g>

            {/* --- Forest cluster: far bottom-right (x~1560-1640, y~440-520) --- */}
            <g>
              <rect x="1568" y="478" width="8" height="20" rx="2" fill="#4a2810" />
              <circle cx="1572" cy="465" r="20" fill="#2e6a1a" />
              <circle cx="1563" cy="458" r="14" fill="#3a7a22" />
              <circle cx="1580" cy="456" r="12" fill="#348020" />
            </g>
            <g>
              <rect x="1598" y="496" width="7" height="18" rx="2" fill="#4a2810" />
              <circle cx="1602" cy="484" r="18" fill="#3a7a22" />
              <circle cx="1594" cy="478" r="12" fill="#2e6a1a" />
              <circle cx="1609" cy="477" r="10" fill="#48922e" />
            </g>
            <g>
              <rect x="1632" y="470" width="6" height="14" rx="1" fill="#4a2810" />
              <circle cx="1635" cy="462" r="14" fill="#2e6a1a" />
              <circle cx="1629" cy="457" r="10" fill="#3a7a22" />
            </g>

            {/* --- Scattered solo trees (right-side gap fillers) --- */}
            <g>
              <rect x="1048" y="418" width="6" height="16" rx="1" fill="#4a2810" />
              <circle cx="1051" cy="408" r="15" fill="#2e6a1a" />
              <circle cx="1044" cy="403" r="10" fill="#3a7a22" />
              <circle cx="1057" cy="402" r="9" fill="#348020" />
            </g>
            <g>
              <rect x="1438" y="108" width="6" height="16" rx="1" fill="#4a2810" />
              <circle cx="1441" cy="98" r="15" fill="#3a7a22" />
              <circle cx="1434" cy="93" r="10" fill="#2e6a1a" />
              <circle cx="1447" cy="92" r="9" fill="#348020" />
            </g>
            <g>
              <rect x="1528" y="188" width="5" height="12" rx="1" fill="#4a2810" />
              <circle cx="1530" cy="181" r="12" fill="#2e6a1a" />
              <circle cx="1525" cy="177" r="8" fill="#3a7a22" />
            </g>
            <g>
              <rect x="1378" y="558" width="5" height="12" rx="1" fill="#4a2810" />
              <circle cx="1380" cy="551" r="12" fill="#3a7a22" />
              <circle cx="1375" cy="547" r="8" fill="#2e6a1a" />
            </g>

            {/* --- Extra grass tufts (right side) --- */}
            <g stroke="#3a7828" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity={0.4}>
              <path d="M950,440 L948,428 M952,440 L952,426 M954,440 L956,428" />
              <path d="M1050,320 L1048,308 M1052,320 L1052,306 M1054,320 L1056,308" />
              <path d="M1150,200 L1148,188 M1152,200 L1152,186 M1154,200 L1156,188" />
              <path d="M1270,480 L1268,468 M1272,480 L1272,466 M1274,480 L1276,468" />
              <path d="M1360,130 L1358,118 M1362,130 L1362,116 M1364,130 L1366,118" />
              <path d="M1420,370 L1418,358 M1422,370 L1422,356 M1424,370 L1426,358" />
              <path d="M1520,440 L1518,428 M1522,440 L1522,426 M1524,440 L1526,428" />
              <path d="M1620,200 L1618,188 M1622,200 L1622,186 M1624,200 L1626,188" />
              <path d="M1700,130 L1698,118 M1702,130 L1702,116 M1704,130 L1706,118" />
              <path d="M1760,400 L1758,388 M1762,400 L1762,386 M1764,400 L1766,388" />
              <path d="M1040,160 L1038,148 M1042,160 L1042,146 M1044,160 L1046,148" />
              <path d="M1300,560 L1298,548 M1302,560 L1302,546 M1304,560 L1306,548" />
            </g>

            {/* --- Extra flowers (right side) --- */}
            <g>
              {/* White daisies */}
              <circle cx="980" cy="380" r="2" fill="white" opacity={0.45} />
              <circle cx="1070" cy="480" r="1.8" fill="white" opacity={0.4} />
              <circle cx="1160" cy="150" r="2" fill="white" opacity={0.4} />
              <circle cx="1250" cy="420" r="1.5" fill="white" opacity={0.35} />
              <circle cx="1330" cy="310" r="2" fill="white" opacity={0.4} />
              <circle cx="1450" cy="200" r="1.5" fill="white" opacity={0.35} />
              <circle cx="1550" cy="460" r="1.8" fill="white" opacity={0.4} />
              <circle cx="1650" cy="380" r="2" fill="white" opacity={0.4} />
              <circle cx="1740" cy="260" r="1.5" fill="white" opacity={0.35} />
              {/* Yellow wildflowers */}
              <line x1="1020" y1="440" x2="1020" y2="432" stroke="#3a7a22" strokeWidth="0.8" />
              <circle cx="1020" cy="431" r="2.5" fill="#f0d850" />
              <circle cx="1020" cy="431" r="1" fill="#e8a020" />
              <line x1="1180" y1="280" x2="1180" y2="272" stroke="#3a7a22" strokeWidth="0.8" />
              <circle cx="1180" cy="271" r="2" fill="#f0d850" />
              <circle cx="1180" cy="271" r="0.8" fill="#e8a020" />
              <line x1="1340" y1="450" x2="1340" y2="442" stroke="#3a7a22" strokeWidth="0.8" />
              <circle cx="1340" cy="441" r="2.5" fill="#f0d850" />
              <circle cx="1340" cy="441" r="1" fill="#e8a020" />
              <line x1="1540" y1="150" x2="1540" y2="142" stroke="#3a7a22" strokeWidth="0.8" />
              <circle cx="1540" cy="141" r="2" fill="#f0d850" />
              <line x1="1720" y1="480" x2="1720" y2="472" stroke="#3a7a22" strokeWidth="0.8" />
              <circle cx="1720" cy="471" r="2.5" fill="#f0d850" />
              <circle cx="1720" cy="471" r="1" fill="#e8a020" />
              {/* Pink flowers */}
              <line x1="960" y1="500" x2="960" y2="493" stroke="#3a7a22" strokeWidth="0.8" />
              <circle cx="960" cy="492" r="2.5" fill="#e880a0" />
              <circle cx="960" cy="492" r="1" fill="#ffcc00" />
              <line x1="1130" y1="340" x2="1130" y2="333" stroke="#3a7a22" strokeWidth="0.8" />
              <circle cx="1130" cy="332" r="2" fill="#f5a0b8" />
              <line x1="1290" y1="160" x2="1290" y2="153" stroke="#3a7a22" strokeWidth="0.8" />
              <circle cx="1290" cy="152" r="2.5" fill="#e880a0" />
              <circle cx="1290" cy="152" r="1" fill="#ffcc00" />
              <line x1="1480" y1="480" x2="1480" y2="473" stroke="#3a7a22" strokeWidth="0.8" />
              <circle cx="1480" cy="472" r="2" fill="#f5a0b8" />
              <line x1="1630" y1="330" x2="1630" y2="323" stroke="#3a7a22" strokeWidth="0.8" />
              <circle cx="1630" cy="322" r="2.5" fill="#e880a0" />
              <circle cx="1630" cy="322" r="1" fill="#ffcc00" />
            </g>

            {/* --- Extra bushes (right side) --- */}
            <g>
              <ellipse cx="1020" cy="480" rx="10" ry="7" fill="#3a7822" />
              <ellipse cx="1020" cy="477" rx="8" ry="5" fill="#4a8a30" />
              <ellipse cx="1018" cy="474" rx="5" ry="3" fill="#58a040" opacity={0.5} />
            </g>
            <g>
              <ellipse cx="1230" cy="160" rx="9" ry="6" fill="#3a7822" />
              <ellipse cx="1230" cy="157" rx="7" ry="4" fill="#4a8a30" />
            </g>
            <g>
              <ellipse cx="1380" cy="430" rx="10" ry="7" fill="#3a7822" />
              <ellipse cx="1380" cy="427" rx="8" ry="5" fill="#4a8a30" />
              <ellipse cx="1378" cy="424" rx="5" ry="3" fill="#58a040" opacity={0.5} />
            </g>
            <g>
              <ellipse cx="1560" cy="260" rx="9" ry="6" fill="#3a7822" />
              <ellipse cx="1560" cy="257" rx="7" ry="4" fill="#4a8a30" />
            </g>
            <g>
              <ellipse cx="1710" cy="370" rx="10" ry="7" fill="#3a7822" />
              <ellipse cx="1710" cy="367" rx="8" ry="5" fill="#4a8a30" />
              <ellipse cx="1708" cy="364" rx="5" ry="3" fill="#58a040" opacity={0.5} />
            </g>

            {/* --- Extra rocks (right side) --- */}
            <g>
              <ellipse cx="990" cy="420" rx="10" ry="6" fill="#7a6850" />
              <ellipse cx="990" cy="418" rx="8" ry="5" fill="#8a7860" />
            </g>
            <g>
              <ellipse cx="1200" cy="510" rx="8" ry="5" fill="#7a6850" />
              <ellipse cx="1200" cy="508" rx="6" ry="4" fill="#8a7860" />
            </g>
            <g>
              <ellipse cx="1450" cy="350" rx="10" ry="6" fill="#7a6850" />
              <ellipse cx="1450" cy="348" rx="8" ry="5" fill="#8a7860" />
            </g>
            <g>
              <ellipse cx="1620" cy="520" rx="8" ry="5" fill="#7a6850" />
              <ellipse cx="1620" cy="518" rx="6" ry="4" fill="#8a7860" />
            </g>

            {/* ===== CONNECTING PATH — shadow + glow + dashed line ===== */}
            <path d={smoothPath} fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" filter="url(#pathGlow)" />
            <path d={smoothPath} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <path d={smoothPath} fill="none" stroke="#3a3020" strokeWidth="3" strokeDasharray="10,8" strokeLinecap="round" strokeLinejoin="round" opacity={0.55} />
          </svg>

          {/* Atmospheric overlays */}
          <div className="map-vignette" />
          <div className="map-fog map-fog-1" />
          <div className="map-fog map-fog-2" />
          <div className="map-fog map-fog-3" />
          <div className="map-particles">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="map-firefly"
                style={{
                  left: `${5 + ((i * 41 + 7) % 90)}%`,
                  animationDuration: `${7 + (i % 4) * 1.6}s`,
                  animationDelay: `${(i * 1.7) % 9}s`,
                }}
              />
            ))}
          </div>

          {/* Region markers (HTML overlay) */}
          {arcRegions.map(region => {
          const status = getRegionStatus(region.id);
          const stars = getRegionStars(region.id);
          const isSelected = selectedRegionId === region.id;

          return (
            <button
              key={region.id}
              className={`zone-marker ${status} ${isSelected ? 'selected' : ''} ${tutorialStep === 8 && region.id === 1 ? 'tutorial-target' : ''}`}
              style={{ left: `${(region.mapPosition.x / MAP_W) * 100}%`, top: `${(region.mapPosition.y / MAP_H) * 100}%` }}
              data-tutorial-id={region.id === 1 ? 'story-region-1' : undefined}
              onClick={() => setSelectedRegionId(isSelected ? null : region.id)}
            >
              <div className="zone-pin" style={{ '--zone-color': region.color } as React.CSSProperties}>
                <span className="zone-icon"><GameIcon id={region.icon} size={16} /></span>
              </div>
              <div className="zone-label">
                <span className="zone-name">{region.name}</span>
                <span className="zone-stars">
                  {Array.from({ length: Math.min(stars.total, 10) }).map((_, i) => (
                    <span key={i} className={`zone-star ${i < stars.completed ? 'filled' : ''}`}>
                      <GameIcon id="star" size={12} />
                    </span>
                  ))}
                </span>
              </div>
              {status === 'locked' && <div className="zone-lock-icon"><GameIcon id="lock" size={14} /></div>}
              {status === 'available' && (
                <div className="zone-pulse" style={{ '--zone-color': region.color } as React.CSSProperties} />
              )}
            </button>
          );
        })}

        </div>{/* end map-scroll */}
      </div>{/* end world-map */}

      {/* Difficulty selector — fixed left over map */}
      <div className="map-header-left">
        <div className="difficulty-tabs">
          {DIFFICULTIES.map(d => {
            const unlocked = isDifficultyUnlocked(d.key);
            return (
              <button
                key={d.key}
                className={`difficulty-tab ${difficulty === d.key ? 'active' : ''} ${!unlocked ? 'locked' : ''}`}
                style={{ '--diff-color': d.color } as React.CSSProperties}
                onClick={() => handleDifficultyChange(d.key)}
                disabled={!unlocked}
              >
                {unlocked ? d.label : <><GameIcon id="lock" size={14} /> {d.label}</>}
              </button>
            );
          })}
        </div>
      </div>
      {/* Arc selector — fixed right over map */}
      <div className="map-header-right">
        <div className="arc-selector">
          {STORY_ARCS.map(arc => {
            const isUnlocked = isArcUnlocked(arc, player);
            return (
              <button
                key={arc.id}
                className={`arc-tab ${selectedArc === arc.id ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}`}
                onClick={() => isUnlocked && setSelectedArc(arc.id)}
                disabled={!isUnlocked}
              >
                {arc.name}
                {!isUnlocked && ' 🔒'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Floor selection panel */}
      {selectedRegion && (
        <div className="floor-panel">
          <div className="floor-panel-header">
            <h3><GameIcon id={selectedRegion.icon} size={16} /> {selectedRegion.name}</h3>
            <button className="floor-panel-close" onClick={() => setSelectedRegionId(null)}>
              <GameIcon id="close" size={18} />
            </button>
          </div>
          <div className="floor-panel-difficulty">
            <span className="difficulty-label">Difficulty</span>
            <span className="difficulty-value" style={{ color: DIFFICULTIES.find(d => d.key === difficulty)?.color }}>
              {DIFFICULTIES.find(d => d.key === difficulty)?.label}
            </span>
          </div>
          <div className="floor-panel-list" ref={floorListRef} data-nested-scroll>
            {selectedFloors.map(floor => {
              const currentFloor = regionProgress[selectedRegion.id] ?? 0;
              const isUnlocked = floor.floor <= currentFloor;
              const isCurrent = floor.floor === currentFloor;
              const isCompleted = floor.floor < currentFloor;

              return (
                <div
                  key={floor.floor}
                  className={`floor-entry ${isCurrent ? 'current' : ''} ${!isUnlocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''}`}
                >
                  <div className="floor-entry-info">
                    <span className="floor-entry-number">
                      {(() => {
                        if (isLeagueRegion(selectedRegion.id)) {
                          const champ = getLeagueChampion(selectedRegion.id, floor.floor);
                          return champ
                            ? `${champ.icon} ${champ.name}`
                            : `${floor.floor}. ${selectedRegion.floorNames[floor.floor - 1] ?? ''}`;
                        }
                        if (floor.isBoss) {
                          const leader = getGymLeader(selectedRegion.id);
                          return leader
                            ? `BOSS - ${leader.icon} ${leader.name}`
                            : `BOSS - ${selectedRegion.floorNames[getFloorCount(selectedRegion.id) - 1] ?? ''}`;
                        }
                        return `${floor.floor}. ${selectedRegion.floorNames[floor.floor - 1] ?? ''}`;
                      })()}
                    </span>
                    <div className="floor-entry-enemies">
                      {floor.enemies.map((enemy, i) => (
                        <div key={i} className="floor-enemy-portrait" title={`${getMonsterName(enemy.templateId)} Lv.${enemy.level}`}>
                          <img src={assetUrl(getTemplate(enemy.templateId)?.spriteUrl ?? `sprites/${enemy.templateId}.png`)} alt={getMonsterName(enemy.templateId)} />
                        </div>
                      ))}
                    </div>
                    {isUnlocked && (
                      <div className="floor-reward-preview">
                        {floor.rewardPreview.isFirstClear ? (
                          <span className="reward-tag first-clear">
                            <GameIcon id="sparkles" size={14} />
                            {floor.rewardPreview.regularPokeballs > 0 && <> +{floor.rewardPreview.regularPokeballs} <GameIcon id="pokeball" size={12} /></>}
                            {floor.rewardPreview.premiumPokeballs > 0 && <> +{floor.rewardPreview.premiumPokeballs} <GameIcon id="premiumPokeball" size={12} /></>}
                          </span>
                        ) : (
                          <span className="reward-tag replay">XP only</span>
                        )}
                        <span className="reward-tag loot-hint">
                          <GameIcon id="clover" size={14} /> Drop
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    className={`floor-go-btn ${tutorialStep === 9 && floor.floor === 1 ? 'tutorial-target' : ''}`}
                    data-tutorial-id={floor.floor === 1 ? 'story-floor-go' : undefined}
                    disabled={!isUnlocked || player.energy < STORY_ENERGY_COST}
                    onClick={() => {
                      if (!isUnlocked || player.energy < STORY_ENERGY_COST) return;
                      if (tutorialStep === 9 && floor.floor === 1) advanceTutorial(); // step 9 → 10
                      navigate(`/battle/team-select?region=${selectedRegion.id}&floor=${floor.floor}&difficulty=${difficulty}`);
                    }}
                  >
                    {!isUnlocked ? (
                      <span className="go-lock"><GameIcon id="lock" size={14} /></span>
                    ) : (
                      <>
                        <span className="go-energy"><GameIcon id="energy" size={14} />{STORY_ENERGY_COST}</span>
                        <span className="go-text">GO</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
