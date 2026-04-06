import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBattleState as fetchBattleState, resolvePlayerAction, deleteBattle, getStoredRewards } from '../services/battle.service';
import { useGameStore } from '../stores/gameStore';
import { useBattleAnimation } from '../battle/useBattleAnimation';
import { useAutoBattle } from '../battle/useAutoBattle';
import { getTemplate, SKILLS, getTypeEffectiveness, ESSENCES, ITEM_SETS, getBossDialogue, EFFECT_REGISTRY, simulateTimeline } from '@gatchamon/shared';
import type { BattleState, BattleMon, BattleLogEntry, BattleResult, PokemonType, EffectId, ActiveEffect, SkillDefinition, TimelineEntry } from '@gatchamon/shared';
import { assetUrl } from '../utils/asset-url';
import { getSpriteBoost } from '../utils/sprite-scale';
import { GameIcon, StarRating } from '../components/icons';
import { BattleLoadingScreen } from '../components/BattleLoadingScreen';
import { GymLeaderDialogue } from '../components/GymLeaderDialogue';
import { useTutorialStore } from '../stores/tutorialStore';
import gsap from 'gsap';
import { loadBattleSettings, saveBattleSettings, loadPlayer, hasGrantedFlag, saveDungeonRecord } from '../services/storage';
import './BattlePage.css';

type Phase = 'player_turn' | 'animating' | 'victory' | 'defeat';

const LEVEL_BACKGROUNDS: Record<number, string> = {
  1: assetUrl('backgrounds/forest-arena.png'),
};

const PASSIVE_TRIGGER_LABELS: Record<string, string> = {
  battle_start: 'Battle Start',
  turn_start: 'Turn Start',
  on_attack: 'On Attack',
  on_hit: 'On Hit',
  on_crit: 'On Crit',
  on_kill: 'On Kill',
  on_ally_death: 'On Ally Death',
  hp_threshold: 'HP Threshold',
  always: 'Always Active',
};


function computeBattleRecap(state: BattleState) {
  const damageMap = new Map<string, number>();
  for (const entry of state.log) {
    if (!state.playerTeam.some(m => m.instanceId === entry.actorId)) continue;
    const current = damageMap.get(entry.actorId) ?? 0;
    damageMap.set(entry.actorId, current + entry.damage + (entry.shieldAbsorbed ?? 0));
  }
  return state.playerTeam.map(mon => {
    const tmpl = getTemplate(mon.templateId);
    return {
      instanceId: mon.instanceId,
      templateId: mon.templateId,
      name: tmpl?.name ?? 'Unknown',
      spriteUrl: tmpl?.spriteUrl ?? `sprites/${mon.templateId}.png`,
      damageDealt: damageMap.get(mon.instanceId) ?? 0,
      hpHealed: state.recap?.[mon.instanceId]?.hpHealed ?? 0,
    };
  });
}

function formatBattleTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getDungeonRecordKey(state: BattleState): string {
  switch (state.mode) {
    case 'tower': return 'tower';
    case 'dungeon': return `dungeon:${state.dungeonId}`;
    case 'item-dungeon': return `item-dungeon:${state.dungeonId}`;
    case 'mystery-dungeon': return 'mystery-dungeon';
    default: return `story:${state.floor.region}:${state.floor.difficulty}`;
  }
}

function SkillDetailModal({ skill, onClose }: { skill: SkillDefinition; onClose: () => void }) {
  return (
    <div className="effect-modal-backdrop" onClick={onClose}>
      <div className="skill-detail-modal" onClick={e => e.stopPropagation()}>
        <div className="skill-detail-header">
          <span className="skill-detail-name">{skill.name}</span>
          <span className="skill-detail-type" style={{ background: `var(--type-${skill.type})` }}>{skill.type}</span>
        </div>
        <span className="skill-detail-cat">{skill.category === 'passive' ? 'Ability' : skill.category}{skill.passiveTrigger ? ` \u2014 ${PASSIVE_TRIGGER_LABELS[skill.passiveTrigger] ?? skill.passiveTrigger}` : ''}</span>
        <p className="skill-detail-desc">{skill.description}</p>
        <div className="skill-detail-stats">
          {skill.multiplier > 0 && <span>Multiplier: {skill.multiplier}x</span>}
          {skill.cooldown > 0 && <span>Cooldown: {skill.cooldown} turns</span>}
          <span>Target: {skill.target.replace(/_/g, ' ')}</span>
        </div>
        {skill.effects.length > 0 && (
          <div className="skill-detail-effects">
            {skill.effects.map((eff, i) => {
              const meta = eff.id ? EFFECT_REGISTRY[eff.id] : null;
              return (
                <div key={i} className="skill-detail-eff-row">
                  <span className="skill-detail-eff-name" style={meta ? { color: meta.color } : undefined}>
                    {meta?.name ?? eff.id ?? eff.type ?? 'Effect'}
                  </span>
                  <span className="skill-detail-eff-info">
                    {eff.value !== 0 && <>{eff.value > 0 ? '+' : ''}{eff.value} &middot; </>}
                    {eff.duration}t &middot; {eff.chance}%
                  </span>
                </div>
              );
            })}
          </div>
        )}
        <button className="effect-modal-close" onClick={onClose}>OK</button>
      </div>
    </div>
  );
}

function SkillPanel({ actor, selectedSkill, onSkillSelect, onCancelSelect, onSkillDetail }: {
  actor: BattleMon;
  selectedSkill: string | null;
  onSkillSelect: (skillId: string) => void;
  onCancelSelect: () => void;
  onSkillDetail: (skill: SkillDefinition) => void;
}) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);

  const tmpl = getTemplate(actor.templateId);
  const allSkillIds = tmpl?.skillIds ?? [];

  const handlePointerDown = useCallback((skill: SkillDefinition) => {
    didLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      onSkillDetail(skill);
    }, 400);
  }, [onSkillDetail]);

  const handlePointerUp = useCallback((skillId: string) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (!didLongPress.current) {
      onSkillSelect(skillId);
    }
  }, [onSkillSelect]);

  const handlePointerLeave = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  if (selectedSkill) {
    return (
      <div className="skill-panel">
        <p className="target-hint">Tap an enemy</p>
        <button className="cancel-btn" onClick={onCancelSelect}>X</button>
      </div>
    );
  }

  return (
    <div className="skill-panel">
      {allSkillIds.map((skillId) => {
        const skill = SKILLS[skillId];
        if (!skill) return null;
        const isPassive = skill.category === 'passive';
        const cd = actor.skillCooldowns[skillId] ?? 0;
        const isReady = cd === 0 && !isPassive;
        return (
          <button
            key={skillId}
            className={`skill-btn ${!isReady && !isPassive ? 'on-cd' : ''} ${isPassive ? 'skill-passive' : ''}`}
            disabled={!isReady && !isPassive}
            onPointerDown={() => handlePointerDown(skill)}
            onPointerUp={isPassive ? () => { if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; } } : () => handlePointerUp(skillId)}
            onPointerLeave={handlePointerLeave}
            onClick={isPassive ? () => onSkillDetail(skill) : undefined}
          >
            <span className="skill-name">{skill.name}</span>
            {!isReady && !isPassive && <span className="cd-overlay">{cd}</span>}
            {isPassive && <span className="passive-label">Ability</span>}
          </button>
        );
      })}
    </div>
  );
}

export function BattlePage() {
  const { battleId } = useParams();
  const navigate = useNavigate();
  const { player, refreshPlayer, loadCollection } = useGameStore();
  const [state, setState] = useState<BattleState | null>(null);
  const [phase, setPhase] = useState<Phase>('animating');
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [focusTargetId, setFocusTargetId] = useState<string | null>(null);
  const [logEntries, setLogEntries] = useState<BattleLogEntry[]>([]);
  const [rewards, setRewards] = useState<BattleResult['rewards']>(undefined);
  const [assetsReady, setAssetsReady] = useState(false);
  const [dialogueComplete, setDialogueComplete] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState<{ id: EffectId; stacks: number; turns: number } | null>(null);
  const [detailSkill, setDetailSkill] = useState<SkillDefinition | null>(null);
  const [arenaEl, setArenaEl] = useState<HTMLDivElement | null>(null);
  const hasX3 = useMemo(() => hasGrantedFlag('speed_x3'), []);
  const savedSettings = useRef(loadBattleSettings());
  const initSpeed = (savedSettings.current.speed === 3 && !hasX3) ? 2 : savedSettings.current.speed;
  const [battleSpeed, setBattleSpeed] = useState(initSpeed);
  const battleSpeedRef = useRef(initSpeed);
  const monRefs = useRef<Map<string, HTMLElement>>(new Map());
  const isActingRef = useRef(false);
  const lastActedRef = useRef<string | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const battleStartRef = useRef<number>(0);
  const [battleDuration, setBattleDuration] = useState(0);

  const { playLogEntry, playMultiTargetEntries } = useBattleAnimation(arenaEl, monRefs);

  const toggleSpeed = useCallback(() => {
    setBattleSpeed(prev => {
      const next: 1 | 2 | 3 = prev === 1 ? 2 : prev === 2 && hasX3 ? 3 : 1;
      battleSpeedRef.current = next;
      gsap.globalTimeline.timeScale(next);
      saveBattleSettings({ speed: next });
      return next;
    });
  }, [hasX3]);

  // Reset GSAP timeScale on mount/unmount
  useEffect(() => {
    gsap.globalTimeline.timeScale(battleSpeedRef.current);
    return () => { gsap.globalTimeline.timeScale(1); };
  }, []);

  const handleEffectClick = useCallback((id: EffectId, stacks: number, turns: number) => {
    setSelectedEffect({ id, stacks, turns });
  }, []);

  const spawnFloatingNumber = useCallback((entry: BattleLogEntry) => {
    const el = monRefs.current.get(entry.targetId);
    if (!el) return;
    const container = el.closest('.battle-mon') as HTMLElement | null;
    if (!container) return;

    const parts: { text: string; cls: string }[] = [];
    if (entry.damage > 0) {
      let cls = 'float-dmg';
      if (entry.isCrit) cls += ' float-crit';
      if (entry.isGlancing) cls += ' float-glancing';
      if (entry.effectiveness > 1) cls += ' float-super';
      if (entry.effectiveness < 1 && entry.effectiveness > 0) cls += ' float-resist';
      parts.push({ text: `-${entry.damage}`, cls });
    }
    if ((entry.shieldAbsorbed ?? 0) > 0) {
      parts.push({ text: `${entry.shieldAbsorbed} shielded`, cls: 'float-shield' });
    }
    if (entry.endured) {
      parts.push({ text: 'Endured!', cls: 'float-endure' });
    }
    if (entry.resisted) {
      parts.push({ text: 'Resisted!', cls: 'float-resist-label' });
    }
    // Heals show as positive green number on the actor
    const healEffect = entry.effects.find(e => e === 'heal' || e === 'recovery');
    if (healEffect && entry.damage <= 0) {
      const actorEl = monRefs.current.get(entry.actorId);
      const actorContainer = actorEl?.closest('.battle-mon') as HTMLElement | null;
      if (actorContainer) {
        spawnFloat(actorContainer, '+Heal', 'float-heal');
      }
    }

    let delay = 0;
    for (const part of parts) {
      setTimeout(() => spawnFloat(container, part.text, part.cls), delay);
      delay += 80;
    }
  }, []);

  const spawnFloat = useCallback((container: HTMLElement, text: string, cls: string) => {
    const span = document.createElement('span');
    span.className = `floating-number ${cls}`;
    span.textContent = text;
    container.appendChild(span);
    setTimeout(() => span.remove(), 1200);
  }, []);

  const loadBattle = useCallback(() => {
    if (!battleId) return;
    const battleState = fetchBattleState(battleId);
    if (!battleState) return;
    setState(battleState);
    setLogEntries(battleState.log);
    if (battleState.status === 'victory' || battleState.status === 'defeat') {
      setPhase('animating');
      const storedRewards = getStoredRewards(battleId);
      setTimeout(() => {
        if (storedRewards) setRewards(storedRewards);
        setPhase(battleState.status === 'victory' ? 'victory' : 'defeat');
      }, 1500);
    } else {
      // If there's a boss dialogue, stay in 'animating' until the player dismisses it
      const hasDialogue = battleState.mode === 'story'
        && getBossDialogue(battleState.floor.region, battleState.floor.floor);
      setPhase(hasDialogue ? 'animating' : 'player_turn');
    }
  }, [battleId]);

  useEffect(() => {
    loadBattle();
  }, [loadBattle]);

  // Start the battle timer when the first player_turn begins
  useEffect(() => {
    if (phase === 'player_turn' && battleStartRef.current === 0) {
      battleStartRef.current = Date.now();
    }
  }, [phase]);

  // Recompute turn order only when phase transitions away from 'animating'.
  // This prevents the timeline from jumping during enemy turn animations.
  // When a player mon just acted, start it at the far right then animate it
  // sliding to its real position via the CSS transition on .turn-order-slot.
  useEffect(() => {
    if (phase !== 'animating' && state) {
      const tl = simulateTimeline(state.playerTeam, state.enemyTeam, state.currentActorId);
      const justActed = lastActedRef.current;
      lastActedRef.current = null;

      // If the just-acted mon is in the new timeline (but not the current actor
      // at position 0), place it at the far right first so it slides in.
      const justActedIdx = justActed ? tl.findIndex(e => e.instanceId === justActed) : -1;
      if (justActedIdx > 0) {
        const maxTick = tl.length > 0 ? tl[tl.length - 1].tick : 1;
        const startTl = tl.map(e =>
          e.instanceId === justActed ? { ...e, tick: maxTick } : e
        );
        setTimeline(startTl);
        // Wait for the browser to paint the far-right position, then set the
        // real timeline so the CSS transition animates the slide.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTimeline(tl);
          });
        });
      } else {
        setTimeline(tl);
      }
    }
  }, [phase, state]);

  const handleAction = async (skillId: string, targetId: string) => {
    if (!battleId || !state || isActingRef.current || isPaused) return;
    isActingRef.current = true;
    setPhase('animating');
    setSelectedSkill(null);

    try {
      const prevLogLength = logEntries.length;
      const allMons = [...state.playerTeam, ...state.enemyTeam];

      // Snapshot current HP before resolution mutates everything
      const hpSnapshot = new Map<string, { currentHp: number; isAlive: boolean }>();
      for (const mon of allMons) {
        hpSnapshot.set(mon.instanceId, { currentHp: mon.currentHp, isAlive: mon.isAlive });
      }

      // Track which player mon just acted so the timeline can animate them from the end
      lastActedRef.current = state.currentActorId!;

      // Compute timeline from pre-action gauges — this matches the engine's actual
      // turn order because gauges haven't been mutated yet by resolvePlayerAction.
      const preTimeline = simulateTimeline(state.playerTeam, state.enemyTeam, state.currentActorId);

      const result = resolvePlayerAction(battleId, {
        actorInstanceId: state.currentActorId!,
        skillId,
        targetInstanceId: targetId,
      });

      // Save final HP values, then restore pre-attack values for progressive display
      const finalSnapshot = new Map<string, { currentHp: number; isAlive: boolean }>();
      for (const mon of allMons) {
        finalSnapshot.set(mon.instanceId, { currentHp: mon.currentHp, isAlive: mon.isAlive });
      }
      for (const mon of allMons) {
        const snap = hpSnapshot.get(mon.instanceId);
        if (snap) { mon.currentHp = snap.currentHp; mon.isAlive = snap.isAlive; }
      }

      // Group consecutive entries by same actor + skill (multi-target moves)
      const newEntries = result.state.log.slice(prevLogLength);
      const groups: BattleLogEntry[][] = [];
      for (const entry of newEntries) {
        const last = groups[groups.length - 1];
        if (last && last[0].actorId === entry.actorId && last[0].skillUsed === entry.skillUsed && last[0].turn === entry.turn) {
          last.push(entry);
        } else {
          groups.push([entry]);
        }
      }

      // Rotating queue: acted mons move to the end instead of disappearing.
      // Use even index-based spacing during animation for clean visuals.
      let animQueue = [...preTimeline];
      const showQueue = () => setTimeline(animQueue.map((e, idx) => ({ ...e, tick: idx })));

      // Animate each group, applying HP changes after each animation
      for (let gi = 0; gi < groups.length; gi++) {
        const group = groups[gi];
        const spd = battleSpeedRef.current;
        const groupActorId = group[0].actorId;
        const groupActor = allMons.find(m => m.instanceId === groupActorId);

        // Before enemy actions, show them as current actor
        if (groupActor && !groupActor.isPlayerOwned) {
          setState(prev => prev ? { ...prev, currentActorId: groupActorId } : prev);
          showQueue();
          await new Promise(r => setTimeout(r, 600 / spd));
        }

        if (group.length > 1) {
          // Multi-target: play animation once on all targets
          await Promise.race([
            playMultiTargetEntries(group),
            new Promise(r => setTimeout(r, 2000 / spd)),
          ]);
        } else {
          await Promise.race([
            playLogEntry(group[0]),
            new Promise(r => setTimeout(r, 2000 / spd)),
          ]);
        }

        // Apply HP changes for all entries in this group + spawn floating numbers
        for (const entry of group) {
          const mon = allMons.find(m => m.instanceId === entry.targetId);
          if (mon) {
            mon.currentHp = Math.max(0, mon.currentHp - entry.damage);
            if (mon.currentHp <= 0) mon.isAlive = false;
          }
          spawnFloatingNumber(entry);
        }

        setState({ ...result.state });

        // Rotate: acting mon goes to the end, remove dead mons
        const acted = animQueue.find(e => e.instanceId === groupActorId);
        animQueue = animQueue.filter(e => e.instanceId !== groupActorId);
        if (acted) {
          const deadIds = new Set(allMons.filter(m => !m.isAlive).map(m => m.instanceId));
          if (!deadIds.has(acted.instanceId)) animQueue.push(acted);
          animQueue = animQueue.filter(e => !deadIds.has(e.instanceId));
        }
        showQueue();

        await new Promise(r => setTimeout(r, 400 / spd));
      }

      // Restore final computed HP (catches heals, buffs, and other effects)
      for (const mon of allMons) {
        const final = finalSnapshot.get(mon.instanceId);
        if (final) { mon.currentHp = final.currentHp; mon.isAlive = final.isAlive; }
      }
      setState({ ...result.state });
      setLogEntries([...result.state.log]);

      // Let the player see the final blow land before showing victory/defeat
      if (result.state.status === 'victory' || result.state.status === 'defeat') {
        await new Promise(r => setTimeout(r, 800));
      }

      if (result.state.status === 'victory' || result.state.status === 'defeat') {
        const elapsed = battleStartRef.current > 0
          ? Math.round((Date.now() - battleStartRef.current) / 1000)
          : 0;
        setBattleDuration(elapsed);
        if (result.state.status === 'victory' && elapsed > 0) {
          saveDungeonRecord(getDungeonRecordKey(result.state), result.state.floor.floor, elapsed);
        }
      }

      if (result.state.status === 'victory') {
        setRewards(result.rewards);
        setPhase('victory');
      } else if (result.state.status === 'defeat') {
        setPhase('defeat');
      } else {
        setPhase('player_turn');
      }
    } catch (err: any) {
      console.error('[Battle error]', err.message);
      setPhase('player_turn');
    } finally {
      isActingRef.current = false;
    }
  };

  const { isAutoOn, toggleAuto } = useAutoBattle(state, phase, handleAction, isPaused, battleSpeedRef, savedSettings.current.auto, focusTargetId);

  // Clear focus when target dies, battle ends, or auto is turned off
  useEffect(() => {
    if (!focusTargetId || !state) return;
    const target = state.enemyTeam.find(m => m.instanceId === focusTargetId);
    if (!target || !target.isAlive) setFocusTargetId(null);
  }, [state, focusTargetId]);

  useEffect(() => {
    if (phase === 'victory' || phase === 'defeat') setFocusTargetId(null);
  }, [phase]);

  useEffect(() => {
    if (!isAutoOn) setFocusTargetId(null);
  }, [isAutoOn]);

  const handleFocusClick = useCallback((instanceId: string) => {
    setFocusTargetId(prev => prev === instanceId ? null : instanceId);
  }, []);

  const navigateAway = useCallback(() => {
    refreshPlayer();
    loadCollection();

    const tutorialStep = useTutorialStore.getState().step;
    if (tutorialStep === 11) {
      if (phase === 'victory') {
        useTutorialStore.getState().setStep(12);
        navigate('/');
      } else {
        // Defeat during tutorial — retry from story page
        useTutorialStore.getState().setStep(8);
        navigate('/story');
      }
      return;
    }

    if (state?.mode === 'tower') {
      navigate('/dungeons?tab=tower');
    } else if (state?.mode === 'dungeon' || state?.mode === 'item-dungeon') {
      const tab = state.mode === 'item-dungeon' ? 'items' : 'essence';
      const dungeonId = state.dungeonId ?? '';
      const floor = (state.floor?.floor ?? 1) - 1;
      navigate(`/dungeons?tab=${tab}&dungeonId=${dungeonId}&floor=${floor}`);
    } else {
      const params = new URLSearchParams();
      if (state?.floor) {
        params.set('region', String(state.floor.region));
        params.set('difficulty', state.floor.difficulty);
      }
      navigate(`/story?${params.toString()}`);
    }
  }, [state, phase, navigate, refreshPlayer, loadCollection]);

  const handleQuit = useCallback(() => {
    if (battleId) {
      deleteBattle(battleId);
    }
    navigateAway();
  }, [battleId, navigateAway]);

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

  const backgroundUrl = state ? (LEVEL_BACKGROUNDS[state.floor.region] ?? LEVEL_BACKGROUNDS[1]) : '';

  const assetUrls = useMemo(() => {
    if (!state) return [];
    const urls: string[] = [backgroundUrl];
    for (const mon of [...state.playerTeam, ...state.enemyTeam]) {
      const tmpl = getTemplate(mon.templateId);
      if (tmpl) {
        const dir = mon.isPlayerOwned ? 'ani-back' : 'ani';
        urls.push(assetUrl(`monsters/${dir}/${tmpl.name.toLowerCase()}.gif`));
      }
    }
    return urls;
  }, [state?.battleId]);

  const battleRecap = useMemo(() => {
    if (!state || (phase !== 'victory' && phase !== 'defeat')) return null;
    return computeBattleRecap(state);
  }, [state, phase]);

  const handleAssetsReady = useCallback(() => setAssetsReady(true), []);

  if (!state) {
    return <div className="page battle-page"><p>Loading battle...</p></div>;
  }

  if (!assetsReady) {
    return (
      <div className="battle-page">
        <BattleLoadingScreen assetUrls={assetUrls} onReady={handleAssetsReady} />
      </div>
    );
  }

  // Show gym leader / champion dialogue before battle starts
  const dialogueData = !dialogueComplete && state.mode === 'story'
    ? getBossDialogue(state.floor.region, state.floor.floor)
    : null;

  if (!dialogueComplete && dialogueData) {
    return (
      <div className="battle-page" style={{ backgroundImage: `url(${backgroundUrl})` }}>
        <GymLeaderDialogue
          name={dialogueData.name}
          icon={dialogueData.icon}
          dialogue={dialogueData.dialogue}
          onComplete={() => { setDialogueComplete(true); setPhase('player_turn'); }}
        />
      </div>
    );
  }

  const currentActor = state.currentActorId
    ? [...state.playerTeam, ...state.enemyTeam].find(m => m.instanceId === state.currentActorId)
    : null;

  const isPlayerTurn = phase === 'player_turn' && currentActor?.isPlayerOwned && !isPaused;

  return (
    <div
      className="battle-page"
      style={{ backgroundImage: `url(${backgroundUrl})` }}
    >
      {/* Turn Order Timeline */}
      <div className="turn-bar">
        <button className="pause-toggle" onClick={() => setIsPaused(true)}>| |</button>
        <div className="turn-order-track">
          <div className="turn-order-inner">
            {(() => {
              const maxTick = timeline.length > 0 ? timeline[timeline.length - 1].tick : 1;
              return timeline.map((entry, idx) => {
                const tmpl = getTemplate(entry.templateId);
                const isCurrent = idx === 0;
                // Position: first slot at 0%, last at 100%, rest proportional
                const leftPercent = maxTick > 0 ? (entry.tick / maxTick) * 100 : (idx / Math.max(timeline.length - 1, 1)) * 100;
                return (
                  <div
                    key={entry.instanceId}
                    className={`turn-order-slot ${isCurrent ? 'turn-current' : ''} ${entry.isPlayerOwned ? 'turn-player' : 'turn-enemy'}`}
                    style={{ left: `${leftPercent}%` }}
                  >
                    <span className="turn-order-number">{idx + 1}</span>
                    <img src={tmpl ? assetUrl(tmpl.spriteUrl) : undefined} alt="" width={24} height={24} />
                  </div>
                );
              });
            })()}
          </div>
        </div>
        <button className={`speed-toggle ${battleSpeed >= 2 ? `active speed-x${battleSpeed}` : ''}`} onClick={toggleSpeed}>
          {battleSpeed > 1 ? `x${battleSpeed}` : 'x1'}
        </button>
        <button className={`auto-toggle ${isAutoOn ? 'active' : ''}`} onClick={toggleAuto}>
          Auto
        </button>
      </div>

      {/* Arena area */}
      <div className="battle-arena" ref={setArenaEl}>
        {/* Enemy team */}
        <div className="battle-field enemy-field">
          {state.enemyTeam.map((mon, i) => {
            const n = state.enemyTeam.length;
            const t = n > 1 ? i / (n - 1) : 0.5;
            const arcOffset = -24 * 4 * t * (1 - t); // negative = up for enemies
            const skill = selectedSkill ? SKILLS[selectedSkill] : null;
            return (
              <BattleMonSprite
                key={mon.instanceId}
                mon={mon}
                isTargetable={isPlayerTurn && (selectedSkill !== null || isAutoOn)}
                isFocused={focusTargetId === mon.instanceId}
                onClick={() => {
                  if (isAutoOn) {
                    handleFocusClick(mon.instanceId);
                  } else if (selectedSkill) {
                    handleAction(selectedSkill, mon.instanceId);
                  }
                }}
                skillType={skill?.type}
                onEffectClick={handleEffectClick}
                arcOffset={arcOffset}
                registerRef={(el) => {
                  if (el) monRefs.current.set(mon.instanceId, el);
                  else monRefs.current.delete(mon.instanceId);
                }}
              />
            );
          })}
        </div>

        {/* Player team */}
        <div className="battle-field player-field">
          {state.playerTeam.map((mon, i) => {
            const n = state.playerTeam.length;
            const t = n > 1 ? i / (n - 1) : 0.5;
            const arcOffset = 40 * 4 * t * (1 - t); // positive = down for allies
            return (
              <BattleMonSprite
                key={mon.instanceId}
                mon={mon}
                isActive={mon.instanceId === state.currentActorId}
                onEffectClick={handleEffectClick}
                arcOffset={arcOffset}
                registerRef={(el) => {
                  if (el) monRefs.current.set(mon.instanceId, el);
                  else monRefs.current.delete(mon.instanceId);
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Skill panel */}
      {isPlayerTurn && currentActor && !isAutoOn && (
        <SkillPanel
          actor={currentActor}
          selectedSkill={selectedSkill}
          onSkillSelect={handleSkillSelect}
          onCancelSelect={() => setSelectedSkill(null)}
          onSkillDetail={setDetailSkill}
        />
      )}

      {/* Pause overlay */}
      {isPaused && phase !== 'victory' && phase !== 'defeat' && (
        <div className="battle-overlay">
          <div className="overlay-content">
            <h2>Paused</h2>
            <button className="return-btn" onClick={() => setIsPaused(false)}>
              Resume
            </button>
            <button className="return-btn quit-btn" onClick={handleQuit}>
              Quit Battle
            </button>
          </div>
        </div>
      )}

      {/* Victory / Defeat overlay */}
      {(phase === 'victory' || phase === 'defeat') && (
        <div className="battle-overlay">
          <div className="overlay-content">
            <div className="overlay-header">
              <h2 className={phase}>{phase === 'victory' ? 'Victory!' : 'Defeat'}</h2>
              <button className="return-btn" onClick={navigateAway}>Continue</button>
            </div>
            <div className="overlay-columns">
              {rewards && (
                <div className="rewards">
                  {rewards.isFirstClear && (
                    <p className="first-clear-banner"><GameIcon id="sparkles" size={14} /> First Clear Bonus!</p>
                  )}
                  {rewards.regularPokeballs > 0 && <p>+ {rewards.regularPokeballs} <GameIcon id="pokeball" size={14} /></p>}
                  {rewards.premiumPokeballs > 0 && <p>+ {rewards.premiumPokeballs} <GameIcon id="premiumPokeball" size={14} /></p>}
                  {rewards.legendaryPokeballs != null && rewards.legendaryPokeballs > 0 && (
                    <p className="legendary-reward">+ {rewards.legendaryPokeballs} <GameIcon id="legendaryPokeball" size={14} /> Legendary Pokeball!</p>
                  )}
                  <p>+ {rewards.xpPerMon} XP per monster</p>
                  {rewards.levelUps.length > 0 && (
                    <p className="level-ups">
                      {rewards.levelUps.length} monster(s) leveled up!
                    </p>
                  )}
                  {rewards.monsterLoot && (
                    <div className="monster-loot-reward">
                      <p className="loot-title"><GameIcon id="clover" size={14} /> Monster Captured!</p>
                      <div className="loot-monster-display">
                        <img
                          src={assetUrl(getTemplate(rewards.monsterLoot.templateId)?.spriteUrl ?? `sprites/${rewards.monsterLoot.templateId}.png`)}
                          alt={getTemplate(rewards.monsterLoot.templateId)?.name ?? ''}
                          className="loot-sprite"
                        />
                        <span className="loot-name">{getTemplate(rewards.monsterLoot.templateId)?.name}</span>
                        <span className="loot-stars"><StarRating count={rewards.monsterLoot.stars} size={10} /></span>
                      </div>
                    </div>
                  )}
                  {rewards.pokedollars != null && rewards.pokedollars > 0 && (
                    <p>+ {rewards.pokedollars.toLocaleString()} <span style={{color:'#d4a017'}}><GameIcon id="pokedollar" size={12} /></span> Pokedollars</p>
                  )}
                  {rewards.stardust != null && rewards.stardust > 0 && (
                    <p>+ {rewards.stardust.toLocaleString()} <span style={{color:'#c4b5fd'}}><GameIcon id="stardust" size={12} /></span> Stardust</p>
                  )}
                  {rewards.essences && Object.keys(rewards.essences).length > 0 && (
                    <div className="essence-drops">
                      <p className="essence-title">Materials Obtained:</p>
                      {Object.entries(rewards.essences).map(([essId, qty]) => {
                        const ess = ESSENCES[essId];
                        return (
                          <p key={essId} className="essence-item">
                            <GameIcon id={ess?.icon} size={14} /> {ess?.name ?? essId} x{qty}
                          </p>
                        );
                      })}
                    </div>
                  )}
                  {rewards.itemDrops && rewards.itemDrops.length > 0 && (
                    <div className="essence-drops">
                      <p className="essence-title">Held Items Obtained:</p>
                      {rewards.itemDrops.map((drop, i) => {
                        const setDef = ITEM_SETS.find(s => s.id === drop.setId);
                        return (
                          <p key={i} className="essence-item">
                            <GameIcon id={setDef?.icon} size={14} /> {setDef?.name ?? drop.setId} <StarRating count={drop.stars} size={10} /> ({drop.grade})
                          </p>
                        );
                      })}
                    </div>
                  )}
                  {rewards.trainerXpGained != null && rewards.trainerXpGained > 0 && (
                    <p>+ {rewards.trainerXpGained} Trainer XP</p>
                  )}
                  {rewards.trainerLeveledUp && (
                    <p className="level-ups">Trainer leveled up to Lv.{rewards.trainerNewLevel}!</p>
                  )}
                </div>
              )}
              {battleRecap && (
                <div className="battle-recap">
                  <p className="recap-title">Battle Performance</p>
                  {battleDuration > 0 && (
                    <p className="recap-time">⏱ {formatBattleTime(battleDuration)}</p>
                  )}
                  <div className="recap-list">
                    {battleRecap.map(mon => (
                      <div key={mon.instanceId} className="recap-mon">
                        <img
                          src={assetUrl(mon.spriteUrl)}
                          alt={mon.name}
                          className="recap-sprite"
                        />
                        <span className="recap-name">{mon.name}</span>
                        <div className="recap-stats">
                          <span className="recap-damage">
                            <GameIcon id="swords" size={12} /> {mon.damageDealt.toLocaleString()}
                          </span>
                          {mon.hpHealed > 0 && (
                            <span className="recap-heal">
                              + {mon.hpHealed.toLocaleString()} HP
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals rendered at battle-page level to avoid CSS transform containment */}
      {selectedEffect && (
        <EffectInfoModal
          effectId={selectedEffect.id}
          stacks={selectedEffect.stacks}
          turns={selectedEffect.turns}
          onClose={() => setSelectedEffect(null)}
        />
      )}
      {detailSkill && (
        <SkillDetailModal skill={detailSkill} onClose={() => setDetailSkill(null)} />
      )}
    </div>
  );
}

function EffectivenessArrow({ effectiveness }: { effectiveness: number }) {
  if (effectiveness >= 2) {
    return <span className="eff-arrow eff-super"><GameIcon id="arrow_down" size={10} /></span>;
  } else if (effectiveness > 1) {
    return <span className="eff-arrow eff-advantage"><GameIcon id="arrow_down" size={10} /></span>;
  } else if (effectiveness === 1) {
    return <span className="eff-arrow eff-neutral"><GameIcon id="arrow_right" size={10} /></span>;
  } else if (effectiveness > 0) {
    return <span className="eff-arrow eff-resist"><GameIcon id="arrow_up" size={10} /></span>;
  } else {
    return <span className="eff-arrow eff-immune"><GameIcon id="close" size={10} /></span>;
  }
}

const EFFECT_ABBREV: Partial<Record<EffectId, string>> = {
  atk_buff: 'ATK\u2191', def_buff: 'DEF\u2191', spd_buff: 'SPD\u2191', crit_rate_buff: 'CRI\u2191',
  immunity: 'IMM', invincibility: 'INV', endure: 'END', shield: 'SHD',
  reflect: 'RFL', counter: 'CTR', recovery: 'REC', vampire: 'VMP',
  atk_break: 'ATK\u2193', def_break: 'DEF\u2193', spd_slow: 'SPD\u2193',
  glancing: 'GLN', brand: 'BRD', unrecoverable: 'UNR', silence: 'SIL',
  oblivion: 'OBL', buff_block: 'BLK', provoke: 'PRV',
  poison: 'PSN', burn: 'BRN', freeze: 'FRZ', paralysis: 'PAR', confusion: 'CNF', sleep: 'SLP',
};

const MAX_EFFECT_ICONS = 8;

function EffectInfoModal({ effectId, stacks, turns, onClose }: {
  effectId: EffectId; stacks: number; turns: number; onClose: () => void;
}) {
  const meta = EFFECT_REGISTRY[effectId];
  if (!meta) return null;
  const bgClass =
    meta.category === 'buff' ? 'effect-modal-buff' :
    meta.category === 'status' ? 'effect-modal-status' :
    'effect-modal-debuff';

  return (
    <div className="effect-modal-backdrop" onClick={onClose}>
      <div className={`effect-modal ${bgClass}`} onClick={e => e.stopPropagation()}>
        <div className="effect-modal-header">
          <span className="effect-modal-name" style={{ color: meta.color }}>{meta.name}</span>
          <span className="effect-modal-cat">{meta.category}</span>
        </div>
        <p className="effect-modal-desc">{meta.description}</p>
        <div className="effect-modal-stats">
          {turns < 999 && <span>{turns} turn{turns !== 1 ? 's' : ''} remaining</span>}
          {turns >= 999 && <span>Permanent</span>}
          {stacks > 1 && <span> &middot; {stacks} stacks</span>}
        </div>
        <button className="effect-modal-close" onClick={onClose}>OK</button>
      </div>
    </div>
  );
}

function EffectIcons({ mon, onEffectClick }: { mon: BattleMon; onEffectClick?: (id: EffectId, stacks: number, turns: number) => void }) {
  const allEffects = [...mon.buffs, ...mon.debuffs];
  if (allEffects.length === 0) return null;

  // Count stacks for stackable effects
  const stackCounts = new Map<EffectId, number>();
  for (const eff of allEffects) {
    stackCounts.set(eff.id, (stackCounts.get(eff.id) ?? 0) + 1);
  }

  // Deduplicate: keep first occurrence of each effect id, attach stack count
  const seen = new Set<EffectId>();
  const unique: (ActiveEffect & { stacks: number })[] = [];
  for (const eff of allEffects) {
    if (!seen.has(eff.id)) {
      seen.add(eff.id);
      unique.push({ ...eff, stacks: stackCounts.get(eff.id) ?? 1 });
    }
  }

  const visible = unique.slice(0, MAX_EFFECT_ICONS);
  const overflow = unique.length - MAX_EFFECT_ICONS;

  return (
    <div className="effect-icons-row">
      {visible.map((eff) => {
        const meta = EFFECT_REGISTRY[eff.id];
        if (!meta) return null;
        const abbrev = EFFECT_ABBREV[eff.id] ?? eff.id.slice(0, 3).toUpperCase();
        const bgClass =
          meta.category === 'buff' ? 'effect-icon-buff' :
          meta.category === 'status' ? 'effect-icon-status' :
          'effect-icon-debuff';
        return (
          <div
            key={eff.id}
            className={`effect-icon ${bgClass}`}
            style={{ borderColor: meta.color }}
            onClick={(e) => { e.stopPropagation(); onEffectClick?.(eff.id, stackCounts.get(eff.id) ?? 1, eff.remainingTurns); }}
          >
            <span className="effect-icon-label">{abbrev}</span>
            {eff.stacks > 1 && (
              <span className="effect-icon-stacks">x{eff.stacks}</span>
            )}
            <span className="effect-icon-turns">{eff.remainingTurns}</span>
          </div>
        );
      })}
      {overflow > 0 && (
        <div className="effect-icon effect-icon-overflow">
          +{overflow}
        </div>
      )}
    </div>
  );
}

function StatusOverlay({ mon }: { mon: BattleMon }) {
  const allEffects = [...mon.buffs, ...mon.debuffs];
  const has = (id: EffectId) => allEffects.some(e => e.id === id);

  const overlays: React.ReactElement[] = [];

  if (has('freeze')) overlays.push(<div key="freeze" className="status-overlay status-freeze" />);
  if (has('burn')) overlays.push(<div key="burn" className="status-overlay status-burn"><span /><span /><span /><span /><span /><span /></div>);
  if (has('poison')) overlays.push(<div key="poison" className="status-overlay status-poison"><span /><span /><span /><span /><span /></div>);
  if (has('paralysis')) overlays.push(<div key="paralysis" className="status-overlay status-paralysis"><span /><span /><span /><span /></div>);
  if (has('sleep')) overlays.push(<div key="sleep" className="status-overlay status-sleep"><span>Z</span><span>z</span><span>z</span></div>);
  if (has('confusion')) overlays.push(<div key="confusion" className="status-overlay status-confusion"><span>★</span><span>★</span><span>★</span></div>);
  if (has('shield')) overlays.push(<div key="shield" className="status-overlay status-shield" />);
  if (has('immunity')) overlays.push(<div key="immunity" className="status-overlay status-immunity" />);
  if (has('invincibility')) overlays.push(<div key="invinc" className="status-overlay status-invincibility" />);
  if (has('recovery')) overlays.push(<div key="recovery" className="status-overlay status-recovery"><span>+</span><span>+</span><span>+</span></div>);
  if (has('endure')) overlays.push(<div key="endure" className="status-overlay status-endure" />);
  if (has('reflect')) overlays.push(<div key="reflect" className="status-overlay status-reflect" />);
  if (has('silence')) overlays.push(<div key="silence" className="status-overlay status-silence" />);

  if (overlays.length === 0) return null;
  return <>{overlays}</>;
}

function BattleMonSprite({
  mon,
  isTargetable,
  isActive,
  isFocused,
  onClick,
  skillType,
  registerRef,
  onEffectClick,
  arcOffset,
}: {
  mon: BattleMon;
  isTargetable?: boolean;
  isActive?: boolean;
  isFocused?: boolean;
  onClick?: () => void;
  skillType?: PokemonType;
  registerRef?: (el: HTMLDivElement | null) => void;
  onEffectClick?: (id: EffectId, stacks: number, turns: number) => void;
  arcOffset?: number;
}) {
  const tmpl = getTemplate(mon.templateId);
  if (!tmpl) return null;

  const hpPct = mon.maxHp > 0 ? (mon.currentHp / mon.maxHp) * 100 : 0;
  const hpColor = hpPct > 50 ? '#4ade80' : hpPct > 20 ? '#fbbf24' : '#ef4444';

  const spriteDir = mon.isPlayerOwned ? 'ani-back' : 'ani';
  const animatedSpriteUrl = assetUrl(`monsters/${spriteDir}/${tmpl.name.toLowerCase()}.gif`);

  const effectiveness = skillType
    ? getTypeEffectiveness(skillType, tmpl.types as PokemonType[])
    : null;

  // Scale sprite based on species height: small Pokemon ~0.8x, large ~1.5x
  const sizeScale = Math.min(1.5, Math.max(0.8, 0.5 + (tmpl.height ?? 1) * 0.45)) * getSpriteBoost(tmpl.name);

  const hpBars = (
    <>
      <div className="mon-hp-bar-bg">
        <div className="mon-hp-bar" style={{ width: `${hpPct}%`, background: hpColor }} />
      </div>
      <div className="mon-atb-bar-bg">
        <div className="mon-atb-bar" style={{ width: `${Math.min(100, (mon.actionGauge / 1000) * 100)}%` }} />
      </div>
      <span className="mon-hp-text">{mon.currentHp}/{mon.maxHp}</span>
    </>
  );

  const sprite = (
    <div className="sprite-container">
      <img
        src={animatedSpriteUrl}
        alt={tmpl.name}
        className="battle-sprite"
        style={{ transform: `scale(${sizeScale})` }}
      />
      {mon.isAlive && <StatusOverlay mon={mon} />}
    </div>
  );

  const nameLabel = <span className="mon-name">{tmpl.name}</span>;
  const effectIcons = mon.isAlive && <EffectIcons mon={mon} onEffectClick={onEffectClick} />;
  const effArrow = effectiveness !== null && mon.isAlive && (
    <EffectivenessArrow effectiveness={effectiveness} />
  );

  return (
    <div
      ref={registerRef}
      className={`battle-mon ${!mon.isAlive ? 'dead' : ''} ${isTargetable ? 'targetable' : ''} ${isActive ? 'active-mon' : ''} ${mon.isBoss ? 'boss-mon' : ''} ${isFocused ? 'focused' : ''}`}
      style={arcOffset ? { marginTop: `${arcOffset}px` } : undefined}
      onClick={mon.isAlive && isTargetable ? onClick : undefined}
    >
      {mon.isPlayerOwned ? (
        <>
          {sprite}
          {nameLabel}
          {hpBars}
          {effectIcons}
        </>
      ) : (
        <>
          {effectIcons}
          {effArrow}
          {nameLabel}
          {hpBars}
          {sprite}
        </>
      )}
    </div>
  );
}
