import { useRepeatBattleStore } from '../stores/repeatBattleStore';
import { ESSENCES, ITEM_SETS } from '@gatchamon/shared';
import { GameIcon, StarRating } from './icons';
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

export function RepeatBattleWidget() {
  const status = useRepeatBattleStore(s => s.status);
  const config = useRepeatBattleStore(s => s.config);
  const currentRun = useRepeatBattleStore(s => s.currentRun);
  const completedRuns = useRepeatBattleStore(s => s.completedRuns);
  const rewards = useRepeatBattleStore(s => s.rewards);
  const isOpen = useRepeatBattleStore(s => s.isOpen);
  const closePanel = useRepeatBattleStore(s => s.closePanel);
  const stopRepeat = useRepeatBattleStore(s => s.stopRepeat);
  const reset = useRepeatBattleStore(s => s.reset);

  if (status === 'idle' || !isOpen || !config) return null;

  const isRunning = status === 'running';
  const totalRuns = config.totalRuns;
  const progress = totalRuns > 0 ? (completedRuns / totalRuns) * 100 : 0;

  return (
    <div className="rb-overlay" onClick={closePanel}>
      <div className="rb-panel" onClick={e => e.stopPropagation()}>
        <div className="rb-header">
          <div className="rb-header-left">
            <span className="rb-title">{config.dungeonName}</span>
            <span className="rb-floor">{config.floorLabel}</span>
          </div>
          <button className="rb-close" onClick={closePanel}>✕</button>
        </div>

        <div className="rb-progress-section">
          <div className="rb-progress-text">
            <span>Run {currentRun} / {totalRuns}</span>
            <span
              className="rb-status"
              style={{ color: STATUS_COLORS[status] }}
            >
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

        {completedRuns > 0 && (
          <div className="rb-rewards">
            <p className="rb-rewards-title">Accumulated Rewards</p>
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
          </div>
        )}

        <div className="rb-actions">
          {isRunning ? (
            <button className="rb-btn rb-btn-stop" onClick={stopRepeat}>Stop</button>
          ) : (
            <button className="rb-btn rb-btn-ok" onClick={reset}>OK</button>
          )}
        </div>
      </div>
    </div>
  );
}
