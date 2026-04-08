import { useState, useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import { trainerXpToNextLevel, MAX_TRAINER_LEVEL, TRAINER_SKILL_MAX, DUNGEONS, ITEM_DUNGEONS, REGIONS, getFloorCount } from '@gatchamon/shared';
import type { TrainerSkills, Difficulty } from '@gatchamon/shared';
import { clearAll, loadDungeonRecords as loadDungeonRecordsLocal } from '../services/storage';
import { signOut } from '../services/auth.service';
import { resetPlayer, getDungeonRecords as getDungeonRecordsServer } from '../services/server-api.service';
import { USE_SERVER, clearAuth } from '../config';
import type { DungeonRecords } from '../services/storage';
import { EssenceBag } from '../components/EssenceBag';
import './TrainerPage.css';

interface SkillDef {
  key: keyof TrainerSkills;
  name: string;
  desc: string;
  unit: string;
}

const ENERGY_SKILLS: SkillDef[] = [
  { key: 'energyRegenSpeed', name: 'Regen Speed', desc: 'Energy regenerates faster', unit: '-10% interval / lv' },
  { key: 'maxEnergyPool', name: 'Max Energy', desc: 'Increases maximum energy', unit: '+10 / lv' },
];

const COMBAT_SKILLS: SkillDef[] = [
  { key: 'globalAtkBonus', name: 'ATK Boost', desc: 'All monsters gain ATK', unit: '+2% / lv' },
  { key: 'globalDefBonus', name: 'DEF Boost', desc: 'All monsters gain DEF', unit: '+2% / lv' },
  { key: 'globalHpBonus', name: 'HP Boost', desc: 'All monsters gain HP', unit: '+2% / lv' },
  { key: 'globalSpdBonus', name: 'SPD Boost', desc: 'All monsters gain SPD', unit: '+2% / lv' },
];

const ECONOMY_SKILLS: SkillDef[] = [
  { key: 'pokedollarBonus', name: 'Pokedollar+', desc: 'Earn more pokedollars', unit: '+10% / lv' },
  { key: 'xpBonus', name: 'XP+', desc: 'Monsters earn more XP', unit: '+10% / lv' },
  { key: 'pokeballBonus', name: 'Pokeball+', desc: 'Earn more pokeballs', unit: '+10% / lv' },
  { key: 'essenceBonus', name: 'Essence+', desc: 'Earn more essences', unit: '+10% / lv' },
];

const CATEGORIES = [
  { title: 'Energy', skills: ENERGY_SKILLS },
  { title: 'Combat', skills: COMBAT_SKILLS },
  { title: 'Economy', skills: ECONOMY_SKILLS },
];

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const DIFFICULTIES: Difficulty[] = ['normal', 'hard', 'hell'];

function DungeonRecordsModal({ onClose }: { onClose: () => void }) {
  const [records, setRecords] = useState<DungeonRecords>(() =>
    USE_SERVER ? {} : loadDungeonRecordsLocal()
  );

  useEffect(() => {
    if (USE_SERVER) {
      getDungeonRecordsServer().then((r: any) => setRecords(r ?? {})).catch(() => {});
    }
  }, []);

  const sections: { title: string; rows: { label: string; floor: string; time: string }[] }[] = [];

  // Battle Tower
  const towerRec = records['tower'];
  if (towerRec) {
    sections.push({
      title: 'Battle Tower',
      rows: [{ label: 'Tower', floor: `${towerRec.maxFloor} / 100`, time: formatTime(towerRec.bestTimeSec) }],
    });
  }

  // Story
  const storyRows: { label: string; floor: string; time: string }[] = [];
  for (const diff of DIFFICULTIES) {
    for (const region of REGIONS) {
      const rec = records[`story:${region.id}:${diff}`];
      if (!rec) continue;
      const total = getFloorCount(region.id);
      storyRows.push({
        label: `${region.name} (${diff})`,
        floor: `${rec.maxFloor} / ${total}`,
        time: formatTime(rec.bestTimeSec),
      });
    }
  }
  if (storyRows.length > 0) sections.push({ title: 'Story', rows: storyRows });

  // Essence Dungeons
  const essenceRows: { label: string; floor: string; time: string }[] = [];
  for (const d of DUNGEONS) {
    const rec = records[`dungeon:${d.id}`];
    if (!rec) continue;
    essenceRows.push({
      label: d.name,
      floor: `${rec.maxFloor} / ${d.floors.length}`,
      time: formatTime(rec.bestTimeSec),
    });
  }
  if (essenceRows.length > 0) sections.push({ title: 'Essence Dungeons', rows: essenceRows });

  // Item Dungeons
  const itemRows: { label: string; floor: string; time: string }[] = [];
  for (const d of ITEM_DUNGEONS) {
    const rec = records[`item-dungeon:${d.id}`];
    if (!rec) continue;
    itemRows.push({
      label: d.name,
      floor: `${rec.maxFloor} / ${d.floors.length}`,
      time: formatTime(rec.bestTimeSec),
    });
  }
  if (itemRows.length > 0) sections.push({ title: 'Item Dungeons', rows: itemRows });

  // Mystery Dungeon
  const mysteryRec = records['mystery-dungeon'];
  if (mysteryRec) {
    sections.push({
      title: 'Mystery Dungeon',
      rows: [{ label: 'Mystery', floor: `${mysteryRec.maxFloor}`, time: formatTime(mysteryRec.bestTimeSec) }],
    });
  }

  return (
    <div className="records-overlay-backdrop" onClick={onClose}>
      <div className="records-overlay" onClick={e => e.stopPropagation()}>
        <div className="records-overlay-header">
          <h3 className="records-heading">Dungeon Records</h3>
          <button className="records-close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="records-overlay-body">
          {sections.length === 0 && (
            <p className="records-empty">No records yet. Win some battles!</p>
          )}
          {sections.map(sec => (
            <div key={sec.title} className="records-category">
              <h4 className="trainer-category-title">{sec.title}</h4>
              {sec.rows.map((row, i) => (
                <div key={i} className="records-row">
                  <span className="records-label">{row.label}</span>
                  <span className="records-floor">{row.floor}</span>
                  <span className="records-time">⏱ {row.time}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TrainerPage() {
  const { player, allocateTrainerSkill } = useGameStore();
  const [showRecords, setShowRecords] = useState(false);
  if (!player) return null;

  const { trainerLevel, trainerExp, trainerSkillPoints, trainerSkills } = player;
  const isMaxLevel = trainerLevel >= MAX_TRAINER_LEVEL;
  const xpNeeded = isMaxLevel ? 0 : trainerXpToNextLevel(trainerLevel);
  const xpPct = isMaxLevel ? 100 : Math.min(100, Math.floor((trainerExp / xpNeeded) * 100));

  return (
    <div className="page trainer-page">
      <div className="trainer-left-panel" data-nested-scroll>
        {/* Header */}
        <div className="trainer-header">
          <div className="trainer-level-row">
            <div className="trainer-level-badge">
              Trainer Lv.{trainerLevel}
            </div>
            <button className="records-btn" onClick={() => setShowRecords(true)}>
              ⏱ Records
            </button>
          </div>
          {!isMaxLevel && (
            <div className="trainer-xp-info">
              {trainerExp} / {xpNeeded} XP
            </div>
          )}
          <div className="trainer-xp-bar">
            <div className="trainer-xp-fill" style={{ width: `${xpPct}%` }} />
          </div>
          <div className="trainer-sp">
            {trainerSkillPoints > 0
              ? `${trainerSkillPoints} Skill Point${trainerSkillPoints > 1 ? 's' : ''} Available`
              : 'No Skill Points'}
          </div>
        </div>

        {/* Skill Categories */}
        {CATEGORIES.map(cat => (
          <div key={cat.title} className="trainer-category">
            <h4 className="trainer-category-title">{cat.title}</h4>
            {cat.skills.map(skill => {
              const current = trainerSkills[skill.key];
              const max = TRAINER_SKILL_MAX[skill.key];
              const isMax = current >= max;
              const canAllocate = trainerSkillPoints > 0 && !isMax;

              return (
                <div key={skill.key} className="trainer-skill-row">
                  <div className="trainer-skill-info">
                    <div className="trainer-skill-name">{skill.name}</div>
                    <div className="trainer-skill-desc">{skill.desc} ({skill.unit})</div>
                  </div>
                  <div className="trainer-skill-pips">
                    {Array.from({ length: max }, (_, i) => (
                      <div
                        key={i}
                        className={`trainer-skill-pip ${i < current ? (isMax ? 'filled maxed' : 'filled') : ''}`}
                      />
                    ))}
                  </div>
                  <div className="trainer-skill-level">
                    {isMax ? <span className="maxed">MAX</span> : `${current}/${max}`}
                  </div>
                  <button
                    className="trainer-alloc-btn"
                    disabled={!canAllocate}
                    onClick={() => allocateTrainerSkill(skill.key)}
                  >
                    +
                  </button>
                </div>
              );
            })}
          </div>
        ))}
        {USE_SERVER && player.googleEmail && (
          <div style={{ marginTop: 24, textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
            Signed in as {player.googleEmail}
          </div>
        )}
        <div style={{ marginTop: USE_SERVER ? 12 : 40, textAlign: 'center', display: 'flex', gap: 16, justifyContent: 'center' }}>
          {USE_SERVER && (
            <button
              style={{ fontSize: '0.65rem', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.4 }}
              onClick={() => {
                if (window.confirm('Sign out?')) {
                  signOut();
                }
              }}
            >
              Sign Out
            </button>
          )}
          <button
            style={{ fontSize: '0.65rem', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.4 }}
            onClick={async () => {
              if (window.confirm('Reset ALL data? This cannot be undone. You will need to register again.')) {
                if (USE_SERVER) {
                  await resetPlayer();
                  clearAll();
                  clearAuth();
                } else {
                  clearAll();
                }
                window.location.reload();
              }
            }}
          >
            Reset Account
          </button>
        </div>
      </div>

      <div className="trainer-right-panel" data-nested-scroll>
        <EssenceBag />
      </div>

      {showRecords && <DungeonRecordsModal onClose={() => setShowRecords(false)} />}
    </div>
  );
}
