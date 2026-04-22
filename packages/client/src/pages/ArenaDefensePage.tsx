import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { getTemplate, isActivePokemon } from '@gatchamon/shared';
import * as serverApi from '../services/server-api.service';
import { assetUrl } from '../utils/asset-url';
import { reportError } from '../utils/report-error';
import './ArenaDefensePage.css';

const MAX_TEAM_SIZE = 4;

export function ArenaDefensePage() {
  const navigate = useNavigate();
  const { collection, loadCollection } = useGameStore();
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadCollection();
  }, [loadCollection]);

  useEffect(() => {
    serverApi.getArenaDefense().then(res => {
      if (res.defense) {
        setSelected(res.defense.teamInstanceIds ?? []);
      }
      setLoaded(true);
    }).catch(err => {
      reportError('ArenaDefensePage.getArenaDefense', err);
      setLoaded(true);
    });
  }, []);

  const visibleCollection = useMemo(
    () => collection.filter(m => isActivePokemon(m.instance.templateId)),
    [collection],
  );

  const toggleSelect = (instanceId: string) => {
    setSelected(prev => {
      if (prev.includes(instanceId)) return prev.filter(id => id !== instanceId);
      if (prev.length >= MAX_TEAM_SIZE) return prev;
      return [...prev, instanceId];
    });
  };

  const save = async () => {
    if (selected.length === 0 || saving) return;
    setSaving(true);
    try {
      await serverApi.setArenaDefense(selected);
      navigate('/arena');
    } catch (err) {
      reportError('ArenaDefensePage.setArenaDefense', err);
      setSaving(false);
    }
  };

  const selectedMons = selected
    .map(id => visibleCollection.find(m => m.instance.instanceId === id))
    .filter((m): m is NonNullable<typeof m> => m != null);

  return (
    <div className="arena-defense-page">
      <div className="arena-defense-topbar">
        <button
          type="button"
          className="arena-defense-back"
          onClick={() => navigate('/arena')}
          aria-label="Back to arena"
        >
          ←
        </button>
        <h2 className="arena-defense-title">Defense Team</h2>
        <button
          type="button"
          className="arena-defense-save"
          onClick={save}
          disabled={selected.length === 0 || saving}
        >
          {saving ? '…' : 'Save'}
        </button>
      </div>

      {/* Current selection preview — 4 slots */}
      <div className="arena-defense-slots">
        {Array.from({ length: MAX_TEAM_SIZE }).map((_, i) => {
          const mon = selectedMons[i];
          const tmpl = mon ? getTemplate(mon.instance.templateId) : null;
          return (
            <button
              key={i}
              type="button"
              className={`arena-defense-slot ${mon ? 'arena-defense-slot--filled' : ''}`}
              onClick={() => mon && toggleSelect(mon.instance.instanceId)}
              disabled={!mon}
              aria-label={mon ? `Remove ${tmpl?.name} from slot ${i + 1}` : `Empty slot ${i + 1}`}
            >
              {mon && tmpl ? (
                <>
                  <img
                    src={assetUrl(tmpl.spriteUrl)}
                    alt={tmpl.name}
                    className="arena-defense-slot-sprite"
                  />
                  <span className="arena-defense-slot-level">Lv.{mon.instance.level}</span>
                </>
              ) : (
                <span className="arena-defense-slot-empty">{i + 1}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="arena-defense-hint">
        {selected.length}/{MAX_TEAM_SIZE} — tap a pokémon below to add, tap a filled slot to remove
      </div>

      {/* Full collection picker */}
      <div className="arena-defense-picker">
        {loaded && visibleCollection.length === 0 && (
          <div className="arena-defense-empty">No pokémon available yet.</div>
        )}
        {visibleCollection.map(mon => {
          const tmpl = getTemplate(mon.instance.templateId);
          const isSelected = selected.includes(mon.instance.instanceId);
          return (
            <button
              key={mon.instance.instanceId}
              type="button"
              className={`arena-defense-pick ${isSelected ? 'arena-defense-pick--selected' : ''}`}
              onClick={() => toggleSelect(mon.instance.instanceId)}
            >
              <img
                src={assetUrl(tmpl?.spriteUrl ?? '')}
                alt={tmpl?.name}
                className="arena-defense-pick-sprite"
              />
              <span className="arena-defense-pick-level">Lv.{mon.instance.level}</span>
              <span className="arena-defense-pick-stars">{'★'.repeat(mon.instance.stars)}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
}

export default ArenaDefensePage;
