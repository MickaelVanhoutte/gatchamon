import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import type { OwnedPokemon } from '../stores/gameStore';
import { WORLD_BOSS_CONFIG, computeStats } from '@gatchamon/shared';
import { MonsterCard } from '../components/monster/MonsterCard';
import { haptic } from '../utils/haptics';
import './WorldBossTeamSelectPage.css';

const SLOT_COUNT = WORLD_BOSS_CONFIG.teamSize;

function powerScore(m: OwnedPokemon): number {
  const s = computeStats(m.template, m.instance.level, m.instance.stars);
  return s.atk * 1.5 + s.hp * 0.4 + s.def * 0.5 + s.spd * 0.8;
}

export function WorldBossTeamSelectPage() {
  const navigate = useNavigate();
  const { collection } = useGameStore();
  const [picked, setPicked] = useState<string[]>([]);
  const [filter, setFilter] = useState('');

  const available = useMemo(() => {
    const list = collection.filter(m => !picked.includes(m.instance.instanceId));
    if (!filter) return list;
    const f = filter.toLowerCase();
    return list.filter(m =>
      m.template.name.toLowerCase().includes(f) ||
      m.template.types.some(t => t.includes(f)),
    );
  }, [collection, picked, filter]);

  const pickedOwned = useMemo(
    () => picked.map(id => collection.find(m => m.instance.instanceId === id)).filter(Boolean) as OwnedPokemon[],
    [collection, picked],
  );

  const addPick = useCallback((id: string) => {
    if (picked.length >= SLOT_COUNT) return;
    haptic.tap();
    setPicked(p => [...p, id]);
  }, [picked.length]);

  const removePick = useCallback((id: string) => {
    haptic.tap();
    setPicked(p => p.filter(x => x !== id));
  }, []);

  const autoFill = useCallback(() => {
    haptic.tap();
    const sorted = [...collection].sort((a, b) => powerScore(b) - powerScore(a));
    const chosen: string[] = [];
    for (const m of sorted) {
      if (chosen.length >= SLOT_COUNT) break;
      chosen.push(m.instance.instanceId);
    }
    setPicked(chosen);
  }, [collection]);

  const clearAll = useCallback(() => {
    haptic.tap();
    setPicked([]);
  }, []);

  const canConfirm = picked.length === SLOT_COUNT;
  const shortBy = SLOT_COUNT - picked.length;

  const confirm = () => {
    if (!canConfirm) return;
    haptic.tap();
    sessionStorage.setItem('wb_picked_team', JSON.stringify(picked));
    navigate('/world-boss/result');
  };

  return (
    <div className="page wb-team-page">
      <header className="wb-team-header">
        <button className="wb-back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h2 className="wb-team-title">Pick {SLOT_COUNT} monsters</h2>
        <div className="wb-team-counter">{picked.length} / {SLOT_COUNT}</div>
      </header>

      <section className="wb-team-slots">
        {Array.from({ length: SLOT_COUNT }).map((_, i) => {
          const m = pickedOwned[i];
          return (
            <div key={i} className={`wb-slot ${m ? 'wb-slot-filled' : 'wb-slot-empty'}`}>
              {m ? (
                <div onClick={() => removePick(m.instance.instanceId)} className="wb-slot-card">
                  <MonsterCard owned={m} compact />
                  <span className="wb-slot-remove">×</span>
                </div>
              ) : (
                <span className="wb-slot-placeholder">{i + 1}</span>
              )}
            </div>
          );
        })}
      </section>

      <section className="wb-team-actions">
        <button className="wb-team-action-btn" onClick={autoFill}>
          Auto-fill top {SLOT_COUNT}
        </button>
        <button className="wb-team-action-btn" onClick={clearAll} disabled={picked.length === 0}>
          Clear
        </button>
        <input
          className="wb-team-filter"
          type="text"
          placeholder="Filter by name or type…"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
      </section>

      <section className="wb-team-roster">
        {available.length === 0 ? (
          <p className="wb-team-empty">No more available monsters.</p>
        ) : (
          <div className="wb-team-grid">
            {available.map(m => (
              <div key={m.instance.instanceId} onClick={() => addPick(m.instance.instanceId)}>
                <MonsterCard owned={m} compact />
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="wb-team-footer">
        <button
          className={`wb-confirm-btn ${!canConfirm ? 'wb-confirm-disabled' : ''}`}
          onClick={confirm}
          disabled={!canConfirm}
        >
          {canConfirm
            ? `Attack Eternatus!`
            : `Need ${shortBy} more`}
        </button>
      </footer>
    </div>
  );
}
