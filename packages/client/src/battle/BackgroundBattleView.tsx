import { useEffect, useState, useCallback, useRef } from 'react';
import {
  resolvePlayerAction,
  deleteBattle as deleteLocalBattle,
  getBattleState as getLocalBattleState,
  startDungeonBattle as startLocalDungeon,
  startItemDungeonBattle as startLocalItemDungeon,
  startMysteryDungeonBattle as startLocalMysteryDungeon,
} from '../services/battle.service';
import { USE_SERVER } from '../config';
import * as serverApi from '../services/server-api.service';
import type { BattleRewards } from '@gatchamon/shared';
import { useGameStore } from '../stores/gameStore';
import { useBattleAnimation } from './useBattleAnimation';
import { useAutoBattle } from './useAutoBattle';
import { useRepeatBattleStore, type RepeatBattleConfig } from '../stores/repeatBattleStore';
import {
  getTemplate,
  EFFECT_REGISTRY,
  getDungeon,
  getItemDungeon,
  getMysteryDungeonDef,
} from '@gatchamon/shared';
import type { BattleState, BattleMon, BattleLogEntry, EffectId, ActiveEffect } from '@gatchamon/shared';
import { assetUrl } from '../utils/asset-url';
import { loadPlayer } from '../services/storage';
import gsap from 'gsap';
import '../pages/BattlePage.css';

type Phase = 'player_turn' | 'animating' | 'victory' | 'defeat' | 'loading';

const MAX_EFFECT_ICONS = 8;

const EFFECT_ABBREV: Partial<Record<EffectId, string>> = {
  atk_buff: 'ATK\u2191', def_buff: 'DEF\u2191', spd_buff: 'SPD\u2191', crit_rate_buff: 'CRI\u2191',
  immunity: 'IMM', invincibility: 'INV', endure: 'END', shield: 'SHD',
  reflect: 'RFL', counter: 'CTR', recovery: 'REC', vampire: 'VMP',
  atk_break: 'ATK\u2193', def_break: 'DEF\u2193', spd_slow: 'SPD\u2193',
  glancing: 'GLN', brand: 'BRD', unrecoverable: 'UNR', silence: 'SIL',
  oblivion: 'OBL', buff_block: 'BLK', provoke: 'PRV',
  poison: 'PSN', burn: 'BRN', freeze: 'FRZ', paralysis: 'PAR', confusion: 'CNF', sleep: 'SLP',
};

export function BackgroundBattleView({ config }: { config: RepeatBattleConfig }) {
  const { refreshPlayer, loadCollection } = useGameStore();

  const [battleId, setBattleId] = useState<string | null>(null);
  const [state, setState] = useState<BattleState | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [logEntries, setLogEntries] = useState<BattleLogEntry[]>([]);
  const [arenaEl, setArenaEl] = useState<HTMLDivElement | null>(null);
  const [lastRewards, setLastRewards] = useState<BattleRewards | null>(null);
  const battleSpeedRef = useRef<number>(2);
  const monRefs = useRef<Map<string, HTMLElement>>(new Map());
  const isActingRef = useRef(false);
  const battleIdRef = useRef<string | null>(null);
  const hasStartedRef = useRef(false);
  const retryCountRef = useRef(0);
  battleIdRef.current = battleId;

  // Force x2 speed
  useEffect(() => {
    gsap.globalTimeline.timeScale(2);
    return () => { gsap.globalTimeline.timeScale(1); };
  }, []);

  const { playLogEntry, playMultiTargetEntries } = useBattleAnimation(arenaEl, monRefs, { muted: true });

  // ── Floating numbers ──
  const spawnFloat = useCallback((container: HTMLElement, text: string, cls: string) => {
    const span = document.createElement('span');
    span.className = `floating-number ${cls}`;
    span.textContent = text;
    container.appendChild(span);
    setTimeout(() => span.remove(), 1200);
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
    if (entry.healAmount && entry.healAmount > 0) {
      parts.push({ text: `+${entry.healAmount}`, cls: 'float-heal' });
    }

    let delay = 0;
    for (const part of parts) {
      setTimeout(() => spawnFloat(container, part.text, part.cls), delay);
      delay += 80;
    }
  }, [spawnFloat]);

  // ── Helper: get player energy ──
  function getPlayerEnergy(): number {
    if (USE_SERVER) {
      return useGameStore.getState().player?.energy ?? 0;
    }
    return loadPlayer()?.energy ?? 0;
  }

  // ── Helper: get energy cost for this dungeon ──
  function getEnergyCost(): number | null {
    if (config.mode === 'mystery-dungeon') {
      const md = getMysteryDungeonDef();
      return md.energyCosts[config.floorIndex] ?? 0;
    }
    const dungeonDef = config.mode === 'dungeon'
      ? getDungeon(config.dungeonId)
      : getItemDungeon(config.dungeonId);
    if (!dungeonDef) return null;
    return dungeonDef.energyCost;
  }

  // ── Start a battle ──
  const startNextBattle = useCallback(async () => {
    const store = useRepeatBattleStore.getState();
    if (store.status !== 'running' || !store.config) return;
    if (store._shouldStop) {
      store.setStatus('stopped_user');
      return;
    }
    if (store.completedRuns >= store.config.totalRuns) {
      store.setStatus('completed');
      return;
    }

    const energyCost = getEnergyCost();
    if (energyCost === null) { store.setStatus('stopped_no_energy'); return; }

    const energy = getPlayerEnergy();
    if (energy < energyCost) {
      store.setStatus('stopped_no_energy');
      return;
    }

    try {
      let battleState: BattleState;
      let rewards: BattleRewards | undefined;

      if (USE_SERVER) {
        const apiCall = config.mode === 'mystery-dungeon'
          ? serverApi.startMysteryDungeonBattle(config.teamIds, config.floorIndex)
          : config.mode === 'item-dungeon'
            ? serverApi.startItemDungeonBattle(config.teamIds, config.dungeonId, config.floorIndex)
            : serverApi.startDungeonBattle(config.teamIds, config.dungeonId, config.floorIndex);
        const result = await apiCall;
        battleState = result.state ?? result;
        rewards = result.rewards;
      } else {
        const result = config.mode === 'mystery-dungeon'
          ? startLocalMysteryDungeon(config.teamIds, config.floorIndex)
          : config.mode === 'item-dungeon'
            ? startLocalItemDungeon(config.teamIds, config.dungeonId, config.floorIndex)
            : startLocalDungeon(config.teamIds, config.dungeonId, config.floorIndex);
        battleState = result.state;
        rewards = result.rewards;
      }

      store.incrementRun();
      setBattleId(battleState.battleId);
      setState(battleState);
      setLogEntries(battleState.log ?? []);

      if (battleState.status === 'victory' || battleState.status === 'defeat') {
        if (rewards) setLastRewards(rewards);
        setPhase(battleState.status);
      } else {
        setPhase('player_turn');
      }
    } catch (err: any) {
      console.error('[BG Battle] startNextBattle error:', err.message ?? err);
      store.setStatus('stopped_no_energy');
    }
  }, [config]);

  // ── Start first battle on mount (StrictMode-safe) ──
  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    const runBefore = useRepeatBattleStore.getState().currentRun;

    void startNextBattle().then(() => {
      // For StrictMode cleanup tracking — only relevant after the promise resolves
    });

    return () => {
      const bid = battleIdRef.current;
      if (bid && !USE_SERVER) deleteLocalBattle(bid);
      const didIncrement = useRepeatBattleStore.getState().currentRun > runBefore;
      if (didIncrement) {
        const s = useRepeatBattleStore.getState();
        useRepeatBattleStore.setState({ currentRun: Math.max(0, s.currentRun - 1) });
      }
      hasStartedRef.current = false;
    };
  }, [startNextBattle]);

  // ── Restart when "Again" is pressed ──
  useEffect(() => {
    return useRepeatBattleStore.subscribe((curr, prev) => {
      if (prev.status !== 'running' && curr.status === 'running') {
        setPhase('loading');
        setState(null);
        setBattleId(null);
        isActingRef.current = false;
        setTimeout(() => void startNextBattle(), 100);
      }
    });
  }, [startNextBattle]);

  // ── Handle action (resolve + animate) ──
  const handleAction = useCallback(async (skillId: string, targetId: string) => {
    const bid = battleIdRef.current;
    if (!bid || !state || isActingRef.current) return;
    if (useRepeatBattleStore.getState().status !== 'running') return;

    // Verify battle still exists (local mode only — server battles persist)
    if (!USE_SERVER && !getLocalBattleState(bid)) {
      console.warn('[BG Battle] battle gone before action, chaining next');
      setPhase('loading');
      setTimeout(() => void startNextBattle(), 100);
      return;
    }

    isActingRef.current = true;
    setPhase('animating');

    try {
      const prevLogLength = logEntries.length;
      const allMons = [...state.playerTeam, ...state.enemyTeam];

      const hpSnapshot = new Map<string, { currentHp: number; isAlive: boolean }>();
      for (const mon of allMons) {
        hpSnapshot.set(mon.instanceId, { currentHp: mon.currentHp, isAlive: mon.isAlive });
      }

      let result: { state: BattleState; rewards?: BattleRewards };
      if (USE_SERVER) {
        result = await serverApi.resolveBattleAction(bid, state.currentActorId!, skillId, targetId);
        result.state = result.state ?? result;
      } else {
        result = resolvePlayerAction(bid, {
          actorInstanceId: state.currentActorId!,
          skillId,
          targetInstanceId: targetId,
        });
      }

      const finalSnapshot = new Map<string, { currentHp: number; isAlive: boolean }>();
      for (const mon of allMons) {
        finalSnapshot.set(mon.instanceId, { currentHp: mon.currentHp, isAlive: mon.isAlive });
      }
      for (const mon of allMons) {
        const snap = hpSnapshot.get(mon.instanceId);
        if (snap) { mon.currentHp = snap.currentHp; mon.isAlive = snap.isAlive; }
      }

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

      for (const group of groups) {
        const spd = battleSpeedRef.current;
        const isPseudoEntry = group[0].skillUsed.startsWith('__');

        if (!isPseudoEntry) {
          if (group.length > 1) {
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
        }

        for (const entry of group) {
          const mon = allMons.find(m => m.instanceId === entry.targetId);
          if (mon) {
            mon.currentHp = Math.max(0, mon.currentHp - entry.damage);
            if (entry.healAmount && entry.healAmount > 0) {
              mon.currentHp = Math.min(mon.maxHp, mon.currentHp + entry.healAmount);
            }
            if (mon.currentHp <= 0) mon.isAlive = false;
          }
          spawnFloatingNumber(entry);
        }

        setState({ ...result.state });
        await new Promise(r => setTimeout(r, 400 / spd));

        if (useRepeatBattleStore.getState().status !== 'running') break;
      }

      for (const mon of allMons) {
        const final = finalSnapshot.get(mon.instanceId);
        if (final) { mon.currentHp = final.currentHp; mon.isAlive = final.isAlive; }
      }
      setState({ ...result.state });
      setLogEntries([...result.state.log]);
      retryCountRef.current = 0;

      if (result.state.status === 'victory' || result.state.status === 'defeat') {
        await new Promise(r => setTimeout(r, 800));
      }

      if (useRepeatBattleStore.getState().status !== 'running') {
        // noop — battle already cleaned up by subscribe effect
      } else if (result.state.status === 'victory') {
        setLastRewards(result.rewards ?? null);
        setPhase('victory');
      } else if (result.state.status === 'defeat') {
        setPhase('defeat');
      } else {
        setPhase('player_turn');
      }
    } catch (err: any) {
      console.error('[BG Battle error]', err.message);
      const bid = battleIdRef.current;
      if (!USE_SERVER && bid && !getLocalBattleState(bid)) {
        console.warn('[BG Battle] battle deleted during action, chaining next');
        setPhase('loading');
        setTimeout(() => void startNextBattle(), 100);
      } else {
        retryCountRef.current++;
        if (retryCountRef.current > 3) {
          console.error('[BG Battle] too many retries, stopping');
          useRepeatBattleStore.getState().setStatus('stopped_defeat');
          if (bid && !USE_SERVER) deleteLocalBattle(bid);
        } else {
          setPhase('player_turn');
        }
      }
    } finally {
      isActingRef.current = false;
    }
  }, [state, logEntries, playLogEntry, playMultiTargetEntries, spawnFloatingNumber, startNextBattle]);

  // Auto-battle always on
  useAutoBattle(state, phase as any, handleAction, false, battleSpeedRef, true);

  // ── Chain on victory / stop on defeat ──
  useEffect(() => {
    if (phase !== 'victory' && phase !== 'defeat') return;

    const store = useRepeatBattleStore.getState();
    if (store.status !== 'running' || !store.config) return;

    if (phase === 'defeat') {
      store.setStatus('stopped_defeat');
      return;
    }

    // Victory — accumulate rewards
    const bid = battleIdRef.current;
    if (lastRewards) {
      store.addRunRewards(lastRewards);
      setLastRewards(null);
    }
    refreshPlayer();
    loadCollection();

    const updated = useRepeatBattleStore.getState();
    if (updated.completedRuns >= (updated.config?.totalRuns ?? 0)) {
      updated.setStatus('completed');
      if (bid && !USE_SERVER) deleteLocalBattle(bid);
      return;
    }
    if (updated._shouldStop) {
      updated.setStatus('stopped_user');
      if (bid && !USE_SERVER) deleteLocalBattle(bid);
      return;
    }

    // Check energy for next run
    const energyCost = getEnergyCost();
    if (energyCost === null) {
      store.setStatus('stopped_no_energy');
      if (bid && !USE_SERVER) deleteLocalBattle(bid);
      return;
    }

    // Wait briefly for refreshPlayer to update before checking energy
    const chainTimer = setTimeout(async () => {
      if (battleIdRef.current !== bid) return;
      if (useRepeatBattleStore.getState().status !== 'running') return;

      const energy = getPlayerEnergy();
      if (energy < energyCost) {
        useRepeatBattleStore.getState().setStatus('stopped_no_energy');
        if (bid && !USE_SERVER) deleteLocalBattle(bid);
        return;
      }

      if (bid && !USE_SERVER) deleteLocalBattle(bid);
      setPhase('loading');
      setTimeout(() => void startNextBattle(), 100);
    }, 1500 / battleSpeedRef.current);

    return () => clearTimeout(chainTimer);
  }, [phase, lastRewards, startNextBattle, config, refreshPlayer, loadCollection]);

  // ── Immediate stop: clean up battle when stopNow is called ──
  useEffect(() => {
    return useRepeatBattleStore.subscribe((curr, prev) => {
      if (prev.status === 'running' && curr.status === 'stopped_user') {
        const bid = battleIdRef.current;
        if (bid && !USE_SERVER) deleteLocalBattle(bid);
        battleIdRef.current = null;
        setBattleId(null);
      }
    });
  }, []);


  const backgroundUrl = assetUrl('backgrounds/forest-arena.png');

  if (phase === 'loading' || !state) {
    return (
      <div className="bg-battle-arena" style={{ backgroundImage: `url(${backgroundUrl})` }}>
        <div className="bg-battle-loading">Loading battle...</div>
      </div>
    );
  }

  return (
    <div className="bg-battle-arena" style={{ backgroundImage: `url(${backgroundUrl})` }}>
      <div className="battle-arena bg-battle-arena-inner" ref={setArenaEl}>
        <div className="battle-field enemy-field">
          {state.enemyTeam.map(mon => (
            <MiniMonSprite
              key={mon.instanceId}
              mon={mon}
              registerRef={(el) => {
                if (el) monRefs.current.set(mon.instanceId, el);
                else monRefs.current.delete(mon.instanceId);
              }}
            />
          ))}
        </div>
        <div className="battle-field player-field">
          {state.playerTeam.map(mon => (
            <MiniMonSprite
              key={mon.instanceId}
              mon={mon}
              isActive={mon.instanceId === state.currentActorId}
              registerRef={(el) => {
                if (el) monRefs.current.set(mon.instanceId, el);
                else monRefs.current.delete(mon.instanceId);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Simplified mon sprite for the background view ──
function MiniMonSprite({
  mon,
  isActive,
  registerRef,
}: {
  mon: BattleMon;
  isActive?: boolean;
  registerRef?: (el: HTMLDivElement | null) => void;
}) {
  const tmpl = getTemplate(mon.templateId);
  if (!tmpl) return null;

  const hpPct = mon.maxHp > 0 ? (mon.currentHp / mon.maxHp) * 100 : 0;
  const hpColor = hpPct > 50 ? '#4ade80' : hpPct > 20 ? '#fbbf24' : '#ef4444';
  const spriteDir = mon.isPlayerOwned ? 'ani-back' : 'ani';
  const animatedSpriteUrl = assetUrl(`monsters/${spriteDir}/${tmpl.name.toLowerCase()}.gif`);
  const sizeScale = Math.min(1.5, Math.max(0.8, 0.5 + (tmpl.height ?? 1) * 0.45));

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

  return (
    <div
      ref={registerRef}
      className={`battle-mon ${!mon.isAlive ? 'dead' : ''} ${isActive ? 'active-mon' : ''} ${mon.isBoss ? 'boss-mon' : ''}`}
    >
      {mon.isPlayerOwned ? (
        <>
          {sprite}
          {mon.isAlive && <MiniEffectIcons mon={mon} />}
          <span className="mon-name">{tmpl.name}</span>
          {hpBars}
        </>
      ) : (
        <>
          <span className="mon-name">{tmpl.name}</span>
          {hpBars}
          {sprite}
          {mon.isAlive && <MiniEffectIcons mon={mon} />}
        </>
      )}
    </div>
  );
}

function MiniEffectIcons({ mon }: { mon: BattleMon }) {
  const allEffects = [...mon.buffs, ...mon.debuffs];
  if (allEffects.length === 0) return null;

  const stackCounts = new Map<EffectId, number>();
  for (const eff of allEffects) {
    stackCounts.set(eff.id, (stackCounts.get(eff.id) ?? 0) + 1);
  }

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
          <div key={eff.id} className={`effect-icon ${bgClass}`} style={{ borderColor: meta.color }}>
            <span className="effect-icon-label">{abbrev}</span>
            {eff.stacks > 1 && <span className="effect-icon-stacks">x{eff.stacks}</span>}
            <span className="effect-icon-turns">{eff.remainingTurns}</span>
          </div>
        );
      })}
      {overflow > 0 && <div className="effect-icon effect-icon-overflow">+{overflow}</div>}
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
