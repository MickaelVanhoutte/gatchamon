import { useGameStore } from '../stores/gameStore';
import { trainerXpToNextLevel, MAX_TRAINER_LEVEL, TRAINER_SKILL_MAX } from '@gatchamon/shared';
import type { TrainerSkills } from '@gatchamon/shared';
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
  { key: 'globalSpdBonus', name: 'SPD Boost', desc: 'All monsters gain SPD', unit: '+1% / lv' },
];

const ECONOMY_SKILLS: SkillDef[] = [
  { key: 'stardustBonus', name: 'Stardust+', desc: 'Earn more stardust', unit: '+10% / lv' },
  { key: 'xpBonus', name: 'XP+', desc: 'Monsters earn more XP', unit: '+10% / lv' },
  { key: 'pokeballBonus', name: 'Pokeball+', desc: 'Earn more pokeballs', unit: '+10% / lv' },
  { key: 'essenceBonus', name: 'Essence+', desc: 'Earn more essences', unit: '+10% / lv' },
];

const CATEGORIES = [
  { title: 'Energy', skills: ENERGY_SKILLS },
  { title: 'Combat', skills: COMBAT_SKILLS },
  { title: 'Economy', skills: ECONOMY_SKILLS },
];

export function TrainerPage() {
  const { player, allocateTrainerSkill } = useGameStore();
  if (!player) return null;

  const { trainerLevel, trainerExp, trainerSkillPoints, trainerSkills } = player;
  const isMaxLevel = trainerLevel >= MAX_TRAINER_LEVEL;
  const xpNeeded = isMaxLevel ? 0 : trainerXpToNextLevel(trainerLevel);
  const xpPct = isMaxLevel ? 100 : Math.min(100, Math.floor((trainerExp / xpNeeded) * 100));

  return (
    <div className="page trainer-page">
      {/* Header */}
      <div className="trainer-header">
        <div className="trainer-level-badge">
          Trainer Lv.{trainerLevel}
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
    </div>
  );
}
