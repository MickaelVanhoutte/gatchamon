import { useLocation } from 'react-router-dom';
import { useRepeatBattleStore } from '../stores/repeatBattleStore';
import { ESSENCES, ITEM_SETS, getTemplate } from '@gatchamon/shared';
import { assetUrl } from '../utils/asset-url';
import { GameIcon, StarRating } from './icons';
import { BackgroundBattleView } from '../battle/BackgroundBattleView';
import './RepeatBattleWidget.css';

const STATUS_LABELS: Record<string, string> = {
  running: 'Running...',
  completed: 'Completed',
  stopped_defeat: 'Defeated',
  stopped_no_energy: 'No Energy',
  stopped_user: 'Stopped',
};

const STATUS_COLORS: Record<string, string> = {
  running: '#f59e0b',
  completed: '#22c55e',
  stopped_defeat: '#ef4444',
  stopped_no_energy: '#f97316',
  stopped_user: '#94a3b8',
};

export function AutoBattleFloatingIcon() {
  const status = useRepeatBattleStore(s => s.status);
  const currentRun = useRepeatBattleStore(s => s.currentRun);
  const config = useRepeatBattleStore(s => s.config);
  const openPanel = useRepeatBattleStore(s => s.openPanel);
  const location = useLocation();

  if (status === 'idle' || !config) return null;
  if (location.pathname !== '/') return null;

  const totalRuns = config.totalRuns;
  const isRunning = status === 'running';
  const isDone = status === 'completed';
  const isStopped = status.startsWith('stopped_');

  return (
    <button
      className={`rb-fab ${isRunning ? 'rb-fab-running' : isDone ? 'rb-fab-done' : 'rb-fab-stopped'}`}
      onClick={openPanel}
    >
      <GameIcon id="swords" size={22} />
      <span className="rb-fab-progress">{Math.min(currentRun, totalRuns)}/{totalRuns}</span>
      {isRunning && <span className="rb-fab-ring" />}
      {isDone && <span className="rb-fab-check">{'\u2713'}</span>}
      {isStopped && !isDone && <span className="rb-fab-alert">!</span>}
    </button>
  );
}

export function RepeatBattleModal() {
  const status = useRepeatBattleStore(s => s.status);
  const config = useRepeatBattleStore(s => s.config);
  const currentRun = useRepeatBattleStore(s => s.currentRun);
  const completedRuns = useRepeatBattleStore(s => s.completedRuns);
  const rewards = useRepeatBattleStore(s => s.rewards);
  const isOpen = useRepeatBattleStore(s => s.isOpen);
  const closePanel = useRepeatBattleStore(s => s.closePanel);
  const stopRepeat = useRepeatBattleStore(s => s.stopRepeat);
  const reset = useRepeatBattleStore(s => s.reset);

  // Don't render at all when idle
  if (status === 'idle' || !config) return null;

  const isRunning = status === 'running';
  const totalRuns = config.totalRuns;
  const displayRun = Math.min(currentRun, totalRuns);
  const progress = totalRuns > 0 ? (completedRuns / totalRuns) * 100 : 0;
  const hasRewards = completedRuns > 0;

  // Always mounted when repeat is active, but visibility controlled by isOpen
  // This keeps the BackgroundBattleView alive and animating even when modal is closed
  return (
    <div className={`rb-container ${isOpen ? 'rb-container-open' : 'rb-container-hidden'}`}>
      <div className="rb-overlay" onClick={closePanel}>
        <div className="rb-panel" onClick={e => e.stopPropagation()}>
          <div className="rb-header">
            <div className="rb-header-left">
              <span className="rb-title">{config.dungeonName}</span>
              <span className="rb-floor">{config.floorLabel}</span>
            </div>
            <button className="rb-close" onClick={closePanel}>{'\u2715'}</button>
          </div>

          <div className="rb-modal-body">
            {/* Left — Battle viewport */}
            <div className="rb-battle-col">
              <div className="rb-battle-viewport">
                <BackgroundBattleView config={config} />
              </div>
            </div>

            {/* Right — Progress + Rewards */}
            <div className="rb-rewards-col">
              <div className="rb-progress-section">
                <div className="rb-progress-text">
                  <span>Run {displayRun} / {totalRuns}</span>
                  <span className="rb-status" style={{ color: STATUS_COLORS[status] }}>
                    {STATUS_LABELS[status]}
                  </span>
                </div>
                <div className="rb-progress-bar">
                  <div
                    className={`rb-progress-fill ${isRunning ? 'rb-progress-animated' : ''}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="rb-completed">{completedRuns} victories</span>
              </div>

              <p className="rb-rewards-title">Rewards</p>
              {hasRewards ? (
                <>
                  <div className="rb-rewards-grid">
                    {rewards.totalXp > 0 && (
                      <div className="rb-reward-item">
                        <span className="rb-reward-value">+{rewards.totalXp.toLocaleString()}</span>
                        <span className="rb-reward-label">XP/mon</span>
                      </div>
                    )}
                    {rewards.totalStardust > 0 && (
                      <div className="rb-reward-item">
                        <span className="rb-reward-value">
                          +{rewards.totalStardust.toLocaleString()} <GameIcon id="stardust" size={12} />
                        </span>
                        <span className="rb-reward-label">Stardust</span>
                      </div>
                    )}
                    {rewards.totalLevelUps > 0 && (
                      <div className="rb-reward-item">
                        <span className="rb-reward-value">{rewards.totalLevelUps}</span>
                        <span className="rb-reward-label">Level Ups</span>
                      </div>
                    )}
                  </div>

                  {Object.keys(rewards.essences).length > 0 && (
                    <div className="rb-essence-list">
                      {Object.entries(rewards.essences).map(([essId, qty]) => {
                        const ess = ESSENCES[essId];
                        return (
                          <span key={essId} className="rb-essence-item">
                            <GameIcon id={ess?.icon} size={12} /> {ess?.name ?? essId} x{qty}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {rewards.itemDrops.length > 0 && (
                    <div className="rb-essence-list">
                      {rewards.itemDrops.map((drop, i) => {
                        const setDef = ITEM_SETS.find(s => s.id === drop.setId);
                        return (
                          <span key={i} className="rb-essence-item">
                            <GameIcon id={setDef?.icon} size={12} /> {setDef?.name ?? drop.setId} <StarRating count={drop.stars} size={8} />
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {rewards.monsterLoots.length > 0 && (
                    <div className="rb-essence-list">
                      {rewards.monsterLoots.map((loot, i) => {
                        const tmpl = getTemplate(loot.templateId);
                        return (
                          <span key={i} className="rb-essence-item rb-loot-item">
                            <img
                              src={assetUrl(tmpl?.spriteUrl ?? `sprites/${loot.templateId}.png`)}
                              alt={tmpl?.name ?? ''}
                              className="rb-loot-sprite"
                            />
                            {tmpl?.name} <StarRating count={loot.stars} size={8} />
                          </span>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <p className="rb-no-rewards">No rewards yet...</p>
              )}

              <div className="rb-actions">
                {isRunning ? (
                  <button className="rb-btn rb-btn-stop" onClick={stopRepeat}>Stop</button>
                ) : (
                  <button className="rb-btn rb-btn-ok" onClick={reset}>Collect</button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
