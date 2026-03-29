import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore, type OwnedPokemon } from '../stores/gameStore';
import { performRetrySummonRoll } from '../services/retry-summon.service';
import { getInboxItems, claimInboxReward } from '../services/inbox.service';
import { addToCollection } from '../services/storage';
import {
  loadRetrySummonState,
  saveRetrySummonState,
  clearRetrySummonState,
} from '../services/storage';
import { trackStat, incrementMission, checkAndUpdateTrophies } from '../services/reward.service';
import { SummonPortal } from '../components/summon/SummonPortal';
import { SummonRevealSequence } from '../components/summon/SummonRevealSequence';
import { MonsterCard } from '../components/monster/MonsterCard';
import { MonsterDetailModal } from '../components/MonsterDetailModal';
import { GameIcon, StarRating } from '../components/icons';
import './RetrySummonPage.css';

const LONG_PRESS_MS = 400;

function useLongPress(onLongPress: () => void) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef(false);

  const start = useCallback(() => {
    firedRef.current = false;
    timerRef.current = setTimeout(() => {
      firedRef.current = true;
      onLongPress();
    }, LONG_PRESS_MS);
  }, [onLongPress]);

  const cancel = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const onClick = useCallback((e: React.MouseEvent) => {
    if (firedRef.current) e.preventDefault();
  }, []);

  return {
    onPointerDown: start,
    onPointerUp: cancel,
    onPointerLeave: cancel,
    onClick,
  };
}

type Phase = 'intro' | 'rolling' | 'revealing' | 'results' | 'confirming' | 'done';

const MAX_ATTEMPTS = 100;

function LongPressCard({ mon, index, onLongPress }: { mon: OwnedPokemon; index: number; onLongPress: (m: OwnedPokemon) => void }) {
  const handlers = useLongPress(useCallback(() => onLongPress(mon), [mon, onLongPress]));
  return (
    <div
      className="result-card-wrapper"
      style={{ animationDelay: `${index * 0.06}s` }}
      {...handlers}
    >
      <MonsterCard owned={mon} compact />
    </div>
  );
}

interface PersistedState {
  attemptsUsed: number;
  currentResults: OwnedPokemon[] | null;
  backupResults: OwnedPokemon[] | null;
  inboxItemId: string;
}

function serializeState(state: PersistedState): string {
  return JSON.stringify(state);
}

function deserializeState(raw: string): PersistedState | null {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function RetrySummonPage() {
  const navigate = useNavigate();
  const { refreshPlayer, loadCollection, refreshRewards } = useGameStore();

  const [phase, setPhase] = useState<Phase>('intro');
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [currentResults, setCurrentResults] = useState<OwnedPokemon[] | null>(null);
  const [backupResults, setBackupResults] = useState<OwnedPokemon[] | null>(null);
  const [resultsReady, setResultsReady] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<'current' | 'backup'>('current');
  const [inboxItemId, setInboxItemId] = useState('');
  const [detailMon, setDetailMon] = useState<OwnedPokemon | null>(null);
  const didInit = useRef(false);

  // On mount: verify inbox item exists OR resume from persisted state
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    // Check for in-progress state
    const saved = loadRetrySummonState();
    if (saved) {
      const persisted = deserializeState(saved);
      if (persisted) {
        setAttemptsUsed(persisted.attemptsUsed);
        setCurrentResults(persisted.currentResults);
        setBackupResults(persisted.backupResults);
        setInboxItemId(persisted.inboxItemId);
        setPhase(persisted.currentResults ? 'results' : 'intro');
        return;
      }
    }

    // No saved state — check inbox for unclaimed retry summon
    const items = getInboxItems();
    const retrySummon = items.find(i => i.specialItem === 'retry-summon-100' && !i.claimed);
    if (!retrySummon) {
      navigate('/', { replace: true });
      return;
    }
    setInboxItemId(retrySummon.id);
  }, [navigate]);

  // Persist state changes
  const persistState = useCallback(
    (used: number, current: OwnedPokemon[] | null, backup: OwnedPokemon[] | null) => {
      saveRetrySummonState(
        serializeState({ attemptsUsed: used, currentResults: current, backupResults: backup, inboxItemId }),
      );
    },
    [inboxItemId],
  );

  const doRoll = useCallback(() => {
    setResultsReady(false);
    setPhase('rolling');

    // Small delay so portal animation starts before results are ready
    setTimeout(() => {
      const results = performRetrySummonRoll();
      const owned: OwnedPokemon[] = results.map(r => ({
        instance: r.pokemon,
        template: r.template,
      }));
      setCurrentResults(owned);
      const newUsed = attemptsUsed + 1;
      setAttemptsUsed(newUsed);
      setResultsReady(true);

      persistState(newUsed, owned, backupResults);
    }, 100);
  }, [attemptsUsed, backupResults, persistState]);

  const handlePortalComplete = useCallback(() => {
    setPhase('revealing');
  }, []);

  const handleAllRevealed = useCallback(() => {
    setPhase('results');
  }, []);

  const handleSaveAsBackup = useCallback(() => {
    const newBackup = currentResults;
    setBackupResults(newBackup);

    // Perform next roll
    setResultsReady(false);
    setPhase('rolling');
    setTimeout(() => {
      const results = performRetrySummonRoll();
      const owned: OwnedPokemon[] = results.map(r => ({
        instance: r.pokemon,
        template: r.template,
      }));
      setCurrentResults(owned);
      const newUsed = attemptsUsed + 1;
      setAttemptsUsed(newUsed);
      setResultsReady(true);

      persistState(newUsed, owned, newBackup);
    }, 100);
  }, [currentResults, attemptsUsed, persistState]);

  const handleSummonAgain = useCallback(() => {
    doRoll();
  }, [doRoll]);

  const handleKeep = useCallback((choice: 'current' | 'backup') => {
    setSelectedChoice(choice);
    setPhase('confirming');
  }, []);

  const handleConfirm = useCallback(() => {
    const chosen = selectedChoice === 'current' ? currentResults : backupResults;
    if (!chosen) return;

    // Add to collection
    const instances = chosen.map(o => o.instance);
    addToCollection(instances);

    // Track stats
    trackStat('totalSummons', 10);
    trackStat('totalMonstersCollected', 10);
    incrementMission('summon_any', 10);
    incrementMission('collect_monster', 10);
    checkAndUpdateTrophies();

    // Mark inbox item as claimed
    claimInboxReward(inboxItemId);

    // Clean up persisted state
    clearRetrySummonState();

    // Refresh game store
    loadCollection();
    refreshPlayer();
    refreshRewards();

    setPhase('done');
    setTimeout(() => navigate('/'), 1500);
  }, [selectedChoice, currentResults, backupResults, inboxItemId, loadCollection, refreshPlayer, refreshRewards, navigate]);

  const handleGoBack = useCallback(() => {
    setPhase('results');
  }, []);

  const remaining = MAX_ATTEMPTS - attemptsUsed;
  const isLastAttempt = remaining <= 0;
  const chosenResults = selectedChoice === 'current' ? currentResults : backupResults;

  return (
    <div className="page retry-summon-page">
      {/* ── Intro ── */}
      {phase === 'intro' && (
        <div className="retry-intro">
          <div className="retry-intro-icon">
            <GameIcon id="premiumPokeball" size={48} />
          </div>
          <h2 className="retry-intro-title">100x Retry Summon</h2>
          <p className="retry-intro-desc">
            Perform a x10 Premium Summon up to <strong>100 times</strong>.
            Save a backup and keep the best result!
          </p>
          <ul className="retry-intro-rules">
            <li>Each summon gives you 10 premium monsters (3-5★)</li>
            <li>You can save 1 backup at a time (overrides previous)</li>
            <li>Stop anytime and choose your current result or backup</li>
          </ul>
          <button className="retry-start-btn" onClick={doRoll}>
            Start Summoning
          </button>
        </div>
      )}

      {/* ── Rolling Animation ── */}
      {phase === 'rolling' && (
        <SummonPortal
          resultsReady={resultsReady}
          onComplete={handlePortalComplete}
          pokeballType="premium"
        />
      )}

      {/* ── Reveal Sequence ── */}
      {phase === 'revealing' && currentResults && (
        <SummonRevealSequence
          results={currentResults}
          onAllRevealed={handleAllRevealed}
        />
      )}

      {/* ── Results ── */}
      {phase === 'results' && currentResults && (
        <div className="retry-results">
          <div className="retry-results-header">
            <span className="retry-counter">
              Attempt {attemptsUsed}/{MAX_ATTEMPTS}
              {!isLastAttempt && <span className="retry-remaining"> ({remaining} remaining)</span>}
              {isLastAttempt && <span className="retry-last"> (Last summon!)</span>}
            </span>
          </div>

          {/* Grid + Action buttons side by side */}
          <div className="retry-main-row">
            {/* Current results */}
            <div className="retry-grid">
              {currentResults.map((mon, i) => (
                <LongPressCard key={mon.instance.instanceId} mon={mon} index={i} onLongPress={setDetailMon} />
              ))}
            </div>

            {/* Action buttons — vertical on the right */}
            <div className="retry-actions">
              {!isLastAttempt && (
                <button className="retry-btn retry-btn-backup" onClick={handleSaveAsBackup}>
                  Save & Reroll
                </button>
              )}
              {!isLastAttempt && (
                <button className="retry-btn retry-btn-reroll" onClick={handleSummonAgain}>
                  Reroll
                </button>
              )}
              <button className="retry-btn retry-btn-keep" onClick={() => handleKeep('current')}>
                Keep Current
              </button>
              {backupResults && (
                <button className="retry-btn retry-btn-keep-backup" onClick={() => handleKeep('backup')}>
                  Keep Backup
                </button>
              )}
            </div>
          </div>

          {/* Backup preview — bottom */}
          {backupResults && (
            <div className="retry-backup-section">
              <div className="retry-backup-label">
                <GameIcon id="check" size={12} />
                <span>Saved Backup:</span>
                <span className="retry-backup-summary">
                  {backupResults.filter(r => r.instance.stars >= 5).length}x 5★
                  {' '}{backupResults.filter(r => r.instance.stars === 4).length}x 4★
                  {' '}{backupResults.filter(r => r.instance.stars === 3).length}x 3★
                  {backupResults.some(r => r.instance.isShiny) && ' (Shiny!)'}
                </span>
              </div>
              <div className="retry-backup-mini">
                {backupResults.map(mon => (
                  <div key={mon.instance.instanceId} className="backup-mini-card">
                    <StarRating count={mon.instance.stars} size={6} />
                    <span className="backup-mini-name">{mon.template.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Confirming ── */}
      {phase === 'confirming' && chosenResults && (
        <div className="retry-confirming">
          <h3 className="retry-confirm-title">
            Keep {selectedChoice === 'current' ? 'Current' : 'Backup'} Summon?
          </h3>
          <div className="retry-grid">
            {chosenResults.map((mon, i) => (
              <LongPressCard key={mon.instance.instanceId} mon={mon} index={i} onLongPress={setDetailMon} />
            ))}
          </div>
          <div className="retry-confirm-actions">
            <button className="retry-btn retry-btn-back" onClick={handleGoBack}>
              Go Back
            </button>
            <button className="retry-btn retry-btn-confirm" onClick={handleConfirm}>
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* ── Done ── */}
      {phase === 'done' && (
        <div className="retry-done">
          <h3>Monsters added to your collection!</h3>
        </div>
      )}

      {/* ── Detail Modal ── */}
      {detailMon && (
        <MonsterDetailModal pokemon={detailMon} onClose={() => setDetailMon(null)} />
      )}
    </div>
  );
}
