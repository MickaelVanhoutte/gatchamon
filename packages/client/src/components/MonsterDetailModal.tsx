import type { BaseStats } from '@gatchamon/shared';
import { computeStats, computeStatsWithItems, getSkillsForPokemon, getItemSet, STAT_TYPE_LABELS } from '@gatchamon/shared';
import type { OwnedPokemon } from '../stores/gameStore';
import { getItemsForPokemon } from '../services/storage';
import { GameIcon, StarRating } from './icons';
import { assetUrl } from '../utils/asset-url';
import './MonsterDetailModal.css';

const STAT_LABELS: Record<keyof BaseStats, string> = {
  hp: 'HP', atk: 'ATK', def: 'DEF', spd: 'SPD',
  critRate: 'CRI%', critDmg: 'CDMG%', acc: 'ACC', res: 'RES',
};

const STAT_MAX: Record<keyof BaseStats, number> = {
  hp: 2000, atk: 300, def: 250, spd: 250,
  critRate: 100, critDmg: 300, acc: 100, res: 100,
};

const STAR_COLORS: Record<number, string> = {
  1: '#aaa', 2: '#4ade80', 3: '#60a5fa', 4: '#c084fc', 5: '#fbbf24', 6: '#ff6b6b',
};

const CATEGORY_LABELS: Record<string, string> = {
  basic: 'Basic', active: 'Active', passive: 'Passive',
};

interface MonsterDetailModalProps {
  pokemon: OwnedPokemon;
  onClose: () => void;
}

export function MonsterDetailModal({ pokemon, onClose }: MonsterDetailModalProps) {
  const { instance, template } = pokemon;
  const equippedItems = getItemsForPokemon(instance.instanceId);
  const baseStats = computeStats(template, instance.level, instance.stars);
  const totalStats = equippedItems.length > 0
    ? computeStatsWithItems(template, instance.level, instance.stars, equippedItems)
    : baseStats;
  const skills = getSkillsForPokemon(template.skillIds);
  const starColor = STAR_COLORS[instance.stars] ?? STAR_COLORS[1];
  const isShiny = instance.isShiny ?? false;
  const spriteUrl = isShiny
    ? assetUrl(`monsters/ani-shiny/${template.name.toLowerCase()}.gif`)
    : assetUrl(template.spriteUrl);

  return (
    <div className="mdm-overlay" onClick={onClose}>
      <div className="mdm-modal" onClick={e => e.stopPropagation()}>
        <button className="mdm-close" onClick={onClose}><GameIcon id="close" size={18} /></button>

        {/* Header */}
        <div className="mdm-header">
          <img src={spriteUrl} alt={template.name} className="mdm-sprite" />
          <div className="mdm-info">
            <h3 className="mdm-name">{template.name}</h3>
            <div className="mdm-stars" style={{ color: starColor }}>
              <StarRating count={instance.stars} size={10} />
            </div>
            <div className="mdm-level">Lv.{instance.level}</div>
            <div className="mdm-types">
              {template.types.map(t => (
                <span key={t} className="type-badge" style={{ background: `var(--type-${t})` }}>{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mdm-section">
          <h4>Stats</h4>
          <div className="mdm-stats">
            {(Object.keys(STAT_LABELS) as Array<keyof BaseStats>).map(key => {
              const base = baseStats[key];
              const total = totalStats[key];
              const diff = total - base;
              return (
                <div key={key} className="mdm-stat-row">
                  <span className="mdm-stat-label">{STAT_LABELS[key]}</span>
                  <div className="mdm-stat-bar-bg">
                    <div
                      className="mdm-stat-bar-fill"
                      style={{ width: `${Math.min(100, (total / STAT_MAX[key]) * 100)}%` }}
                    />
                  </div>
                  <span className="mdm-stat-value">
                    {total}
                    {diff > 0 && <span className="mdm-stat-bonus"> (+{diff})</span>}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Held Items */}
        <div className="mdm-section">
          <h4>Held Items</h4>
          <div className="mdm-items-grid">
            {([1, 2, 3, 4, 5, 6] as const).map(slot => {
              const item = equippedItems.find(i => i.slot === slot);
              const setDef = item ? getItemSet(item.setId) : null;
              return (
                <div key={slot} className={`mdm-item-slot ${item ? 'filled' : ''}`}>
                  {item && setDef ? (
                    <>
                      <span className="mdm-item-icon"><GameIcon id={setDef.icon} size={14} /></span>
                      <span className="mdm-item-level">+{item.level}</span>
                    </>
                  ) : (
                    <span className="mdm-item-empty">{slot}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Skills */}
        <div className="mdm-section">
          <h4>Skills</h4>
          <div className="mdm-skills">
            {skills.map(skill => (
              <div key={skill.id} className="mdm-skill">
                <div className="mdm-skill-header">
                  <span className="mdm-skill-name">{skill.name}</span>
                  <span className="mdm-skill-cat">{CATEGORY_LABELS[skill.category] ?? skill.category}</span>
                  <span className="type-badge" style={{ background: `var(--type-${skill.type})`, fontSize: '0.6rem', padding: '1px 5px' }}>
                    {skill.type}
                  </span>
                </div>
                <div className="mdm-skill-desc">{skill.description}</div>
                <div className="mdm-skill-meta">
                  {skill.category !== 'passive' && <span>x{skill.multiplier}</span>}
                  {skill.cooldown > 0 && <span>CD: {skill.cooldown}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
