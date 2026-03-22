import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useGameStore } from '../stores/gameStore';
import { POKEDEX, SKILLS, getTypeEffectiveness } from '@gatchamon/shared';
import type { BattleState, BattleMon, BattleLogEntry, BattleResult, PokemonType } from '@gatchamon/shared';
import './BattlePage.css';

type Phase = 'player_turn' | 'animating' | 'victory' | 'defeat';

const LEVEL_BACKGROUNDS: Record<number, string> = {
  1: '/backgrounds/forest-arena.png',
};

export function BattlePage() {
  const { battleId } = useParams();
  const navigate = useNavigate();
  const { player, loadPlayer } = useGameStore();
  const [state, setState] = useState<BattleState | null>(null);
  const [phase, setPhase] = useState<Phase>('animating');
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [logEntries, setLogEntries] = useState<BattleLogEntry[]>([]);
  const [animatingLog, setAnimatingLog] = useState<BattleLogEntry | null>(null);
  const [rewards, setRewards] = useState<BattleResult['rewards']>(undefined);

  const getTemplate = (templateId: number) => POKEDEX.find(p => p.id === templateId);

  const loadBattle = useCallback(async () => {
    if (!battleId) return;
    const data = await api.get<{ state: BattleState }>(`/battle/${battleId}`);
    setState(data.state);
    setLogEntries(data.state.log);
    if (data.state.status === 'victory') setPhase('victory');
    else if (data.state.status === 'defeat') setPhase('defeat');
    else setPhase('player_turn');
  }, [battleId]);

  useEffect(() => {
    loadBattle();
  }, [loadBattle]);

  const handleAction = async (skillId: string, targetId: string) => {
    if (!battleId || !state) return;
    setPhase('animating');
    setSelectedSkill(null);

    try {
      const result = await api.post<BattleResult>(`/battle/${battleId}/action`, {
        actorInstanceId: state.currentActorId,
        skillId,
        targetInstanceId: targetId,
      });

      // Animate log entries one by one
      const newEntries = result.state.log;
      for (let i = logEntries.length; i < newEntries.length; i++) {
        setAnimatingLog(newEntries[i]);
        await new Promise(r => setTimeout(r, 600));
      }
      setAnimatingLog(null);

      setState(result.state);
      setLogEntries(result.state.log);

      if (result.state.status === 'victory') {
        setRewards(result.rewards);
        setPhase('victory');
      } else if (result.state.status === 'defeat') {
        setPhase('defeat');
      } else {
        setPhase('player_turn');
      }
    } catch (err: any) {
      alert(err.message);
      setPhase('player_turn');
    }
  };

  const handleSkillSelect = (skillId: string) => {
    if (!state) return;
    const skill = SKILLS[skillId];
    if (!skill) return;

    if (skill.target === 'self' || skill.target === 'single_ally' || skill.target === 'all_allies') {
      handleAction(skillId, state.currentActorId!);
      return;
    }

    if (skill.target === 'all_enemies') {
      const firstAlive = state.enemyTeam.find(e => e.isAlive);
      if (firstAlive) handleAction(skillId, firstAlive.instanceId);
      return;
    }

    // single_enemy — need target selection
    setSelectedSkill(skillId);
  };

  if (!state) {
    return <div className="page battle-page"><p>Loading battle...</p></div>;
  }

  const currentActor = state.currentActorId
    ? [...state.playerTeam, ...state.enemyTeam].find(m => m.instanceId === state.currentActorId)
    : null;

  const isPlayerTurn = phase === 'player_turn' && currentActor?.isPlayerOwned;

  const backgroundUrl = LEVEL_BACKGROUNDS[state.floor.level] ?? LEVEL_BACKGROUNDS[1];

  return (
    <div
      className="battle-page"
      style={{ backgroundImage: `url(${backgroundUrl})` }}
    >
      {/* Turn order bar */}
      <div className="turn-bar">
        {[...state.playerTeam, ...state.enemyTeam]
          .filter(m => m.isAlive)
          .sort((a, b) => b.actionGauge - a.actionGauge)
          .slice(0, 6)
          .map(mon => {
            const tmpl = getTemplate(mon.templateId);
            return (
              <div
                key={mon.instanceId}
                className={`turn-portrait ${mon.instanceId === state.currentActorId ? 'active' : ''} ${mon.isPlayerOwned ? 'player' : 'enemy'}`}
              >
                <img src={tmpl?.spriteUrl} alt="" width={28} height={28} />
              </div>
            );
          })}
      </div>

      {/* Arena area */}
      <div className="battle-arena">
        {/* Floating damage/log */}
        {animatingLog && (
          <div className="floating-log">
            <span className={`log-text ${animatingLog.isCrit ? 'crit' : ''}`}>
              {animatingLog.actorName} → {animatingLog.skillName} → {animatingLog.targetName}
              {' '}{animatingLog.damage > 0 ? `-${animatingLog.damage}` : ''}
              {animatingLog.isCrit ? ' CRIT!' : ''}
              {animatingLog.effectiveness > 1 ? ' Super effective!' : ''}
              {animatingLog.effectiveness < 1 && animatingLog.effectiveness > 0 ? ' Not effective...' : ''}
            </span>
          </div>
        )}

        {/* Enemy team */}
        <div className="battle-field enemy-field">
          {state.enemyTeam.map(mon => {
            const skill = selectedSkill ? SKILLS[selectedSkill] : null;
            return (
              <BattleMonSprite
                key={mon.instanceId}
                mon={mon}
                isTargetable={isPlayerTurn && selectedSkill !== null}
                onClick={() => selectedSkill && handleAction(selectedSkill, mon.instanceId)}
                skillType={skill?.type}
              />
            );
          })}
        </div>

        {/* Player team */}
        <div className="battle-field player-field">
          {state.playerTeam.map(mon => (
            <BattleMonSprite
              key={mon.instanceId}
              mon={mon}
              isActive={mon.instanceId === state.currentActorId}
            />
          ))}
        </div>
      </div>

      {/* Skill panel */}
      {isPlayerTurn && currentActor && (
        <div className="skill-panel">
          {selectedSkill ? (
            <>
              <p className="target-hint">Tap an enemy</p>
              <button className="cancel-btn" onClick={() => setSelectedSkill(null)}>X</button>
            </>
          ) : (
            Object.entries(currentActor.skillCooldowns).map(([skillId, cd]) => {
              const skill = SKILLS[skillId];
              if (!skill) return null;
              const isReady = cd === 0;
              return (
                <button
                  key={skillId}
                  className={`skill-btn ${!isReady ? 'on-cd' : ''}`}
                  disabled={!isReady}
                  onClick={() => handleSkillSelect(skillId)}
                >
                  <span className="skill-name">{skill.name}</span>
                  {!isReady && <span className="cd-overlay">{cd}</span>}
                </button>
              );
            })
          )}
        </div>
      )}

      {phase === 'animating' && !animatingLog && (
        <div className="skill-panel">
          <p className="waiting-text">...</p>
        </div>
      )}

      {/* Victory / Defeat overlay */}
      {(phase === 'victory' || phase === 'defeat') && (
        <div className="battle-overlay">
          <div className="overlay-content">
            <h2 className={phase}>{phase === 'victory' ? 'Victory!' : 'Defeat'}</h2>
            {rewards && (
              <div className="rewards">
                <p>+ {rewards.pokeballs} Pokeballs</p>
                <p>+ {rewards.xpPerMon} XP per monster</p>
                {rewards.levelUps.length > 0 && (
                  <p className="level-ups">
                    {rewards.levelUps.length} monster(s) leveled up!
                  </p>
                )}
              </div>
            )}
            <button
              className="return-btn"
              onClick={() => {
                if (player) loadPlayer(player.id);
                navigate('/story');
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function EffectivenessArrow({ effectiveness }: { effectiveness: number }) {
  if (effectiveness >= 2) {
    return <span className="eff-arrow eff-super">▼</span>;
  } else if (effectiveness > 1) {
    return <span className="eff-arrow eff-advantage">▼</span>;
  } else if (effectiveness === 1) {
    return <span className="eff-arrow eff-neutral">▶</span>;
  } else if (effectiveness > 0) {
    return <span className="eff-arrow eff-resist">▲</span>;
  } else {
    return <span className="eff-arrow eff-immune">✕</span>;
  }
}

function BattleMonSprite({
  mon,
  isTargetable,
  isActive,
  onClick,
  skillType,
}: {
  mon: BattleMon;
  isTargetable?: boolean;
  isActive?: boolean;
  onClick?: () => void;
  skillType?: PokemonType;
}) {
  const tmpl = POKEDEX.find(p => p.id === mon.templateId);
  if (!tmpl) return null;

  const hpPct = mon.maxHp > 0 ? (mon.currentHp / mon.maxHp) * 100 : 0;
  const hpColor = hpPct > 50 ? '#4ade80' : hpPct > 20 ? '#fbbf24' : '#ef4444';

  const spriteDir = mon.isPlayerOwned ? 'ani-back' : 'ani';
  const animatedSpriteUrl = `/monsters/${spriteDir}/${tmpl.name.toLowerCase()}.gif`;

  const effectiveness = skillType
    ? getTypeEffectiveness(skillType, tmpl.types as PokemonType[])
    : null;

  return (
    <div
      className={`battle-mon ${!mon.isAlive ? 'dead' : ''} ${isTargetable ? 'targetable' : ''} ${isActive ? 'active-mon' : ''}`}
      onClick={mon.isAlive && isTargetable ? onClick : undefined}
    >
      {effectiveness !== null && mon.isAlive && (
        <EffectivenessArrow effectiveness={effectiveness} />
      )}
      <div className="mon-hp-bar-bg">
        <div className="mon-hp-bar" style={{ width: `${hpPct}%`, background: hpColor }} />
      </div>
      <span className="mon-hp-text">{mon.currentHp}/{mon.maxHp}</span>
      <img
        src={animatedSpriteUrl}
        alt={tmpl.name}
        className="battle-sprite"
      />
      <span className="mon-name">{tmpl.name}</span>
    </div>
  );
}
