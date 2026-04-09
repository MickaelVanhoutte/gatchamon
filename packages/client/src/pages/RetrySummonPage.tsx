import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore, type OwnedPokemon } from '../stores/gameStore';
import { getTemplate } from '@gatchamon/shared';
import * as serverApi from '../services/server-api.service';
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

function toOwned(results: any[]): OwnedPokemon[] {
  return results.map((r: any) => ({
    instance: r.pokemon,
    template: r.template ?? getTemplate(r.pokemon.templateId)!,
  }));
}

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

export function RetrySummonPage() {
  const navigate = useNavigate();
  const { refreshPlayer, loadCollection, refreshRewards } = useGameStore();

  const [phase, setPhase] = useState<Phase>('intro');
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [currentResults, setCurrentResults] = useState<OwnedPokemon[] | null>(null);
  const [backupResults, setBackupResults] = useState<OwnedPokemon[] | null>(null);
  const [resultsReady, setResultsReady] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<'current' | 'backup'>('current');
  const [detailMon, setDetailMon] = useState<OwnedPokemon | null>(null);
  const didInit = useRef(false);

  // On mount: check server for existing session or eligible inbox item
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    serverApi.getRetrySummonState().then((res: any) => {
      if (res.session) {
        setAttemptsUsed(res.session.attemptsUsed);
        if (res.session.currentResults) setCurrentResults(toOwned(res.session.currentResults));
        if (res.session.backupResults) setBackupResults(toOwned(res.session.backupResults));
        setPhase(res.session.currentResults ? 'results' : 'intro');
      } else if (!res.hasItem) {
        navigate('/', { replace: true });
      }
    }).catch(() => {
      navigate('/', { replace: true });
    });
  }, [navigate]);

  const doRoll = useCallback(() => {
    setResultsReady(false);
    setPhase('rolling');

    serverApi.retrySummonRoll().then((res: any) => {
      const owned = toOwned(res.results);
      setCurrentResults(owned);
      setAttemptsUsed(res.attemptsUsed);
      setResultsReady(true);
    }).catch(() => {
      setPhase('results');
    });
  }, []);

  const handlePortalComplete = useCallback(() => {
    setPhase('revealing');
  }, []);

  const handleAllRevealed = useCallback(() => {
    setPhase('results');
  }, []);

  const handleSaveAsBackup = useCallback(() => {
    setResultsReady(false);
    setPhase('rolling');

    serverApi.retrySummonSaveBackup().then((res: any) => {
      const owned = toOwned(res.results);
      setCurrentResults(owned);
      if (res.backupResults) setBackupResults(toOwned(res.backupResults));
      setAttemptsUsed(res.attemptsUsed);
      setResultsReady(true);
    }).catch(() => {
      setPhase('results');
    });
  }, []);

  const handleSummonAgain = useCallback(() => {
    doRoll();
  }, [doRoll]);

  const handleKeep = useCallback((choice: 'current' | 'backup') => {
    setSelectedChoice(choice);
    setPhase('confirming');
  }, []);

  const handleConfirm = useCallback(() => {
    serverApi.retrySummonConfirm(selectedChoice).then(() => {
      loadCollection();
      refreshPlayer();
      refreshRewards();
      setPhase('done');
      setTimeout(() => navigate('/'), 1500);
    }).catch(() => {});
  }, [selectedChoice, loadCollection, refreshPlayer, refreshRewards, navigate]);

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
