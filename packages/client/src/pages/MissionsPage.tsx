import { useState, useCallback } from 'react';
import { useGameStore } from '../stores/gameStore';
import {
  getDailyMissions,
  claimMissionReward,
  claimAllDailiesBonus,
  claimAllMissions,
  claimAllTrophyTiers,
  getUnclaimedMissionCount,
  getUnclaimedTrophyCount,
  claimTrophyTier,
  loadOrInitRewardState,
} from '../services/reward.service';
import {
  selectDailyMissions,
  TROPHIES,
  getTrophyStat,
} from '@gatchamon/shared';
import type { MissionReward, TrophyDefinition, TrophyProgress } from '@gatchamon/shared';
import { GameIcon, StarRating } from '../components/icons';
import './MissionsPage.css';

type Tab = 'daily' | 'trophies';

export function MissionsPage() {
  const { refreshPlayer } = useGameStore();
  const [tab, setTab] = useState<Tab>('daily');
  const [claimedReward, setClaimedReward] = useState<MissionReward | null>(null);
  const [, setTick] = useState(0);
  const forceUpdate = useCallback(() => setTick(t => t + 1), []);

  const dailyState = getDailyMissions();
  const dailyDefs = selectDailyMissions(dailyState.date);
  const rewardState = loadOrInitRewardState();

  const handleClaimMission = (missionId: string) => {
    const reward = claimMissionReward(missionId);
    if (reward) {
      setClaimedReward(reward);
      refreshPlayer();
      forceUpdate();
      setTimeout(() => setClaimedReward(null), 2000);
    }
  };

  const handleClaimAllBonus = () => {
    const reward = claimAllDailiesBonus();
    if (reward) {
      setClaimedReward(reward);
      refreshPlayer();
      forceUpdate();
      setTimeout(() => setClaimedReward(null), 2000);
    }
  };

  const handleClaimTrophy = (trophyId: string, tierIndex: number) => {
    const reward = claimTrophyTier(trophyId, tierIndex);
    if (reward) {
      setClaimedReward(reward);
      refreshPlayer();
      forceUpdate();
      setTimeout(() => setClaimedReward(null), 2000);
    }
  };

  const handleClaimAllMissions = () => {
    const reward = claimAllMissions();
    if (reward) {
      setClaimedReward(reward);
      refreshPlayer();
      forceUpdate();
      setTimeout(() => setClaimedReward(null), 2000);
    }
  };

  const handleClaimAllTrophies = () => {
    const reward = claimAllTrophyTiers();
    if (reward) {
      setClaimedReward(reward);
      refreshPlayer();
      forceUpdate();
      setTimeout(() => setClaimedReward(null), 2000);
    }
  };

  const completedCount = dailyState.missions.filter(m => m.claimed).length;

  return (
    <div className="page missions-page">
      {/* Tabs */}
      <div className="missions-tabs">
        <button
          className={`missions-tab ${tab === 'daily' ? 'active' : ''}`}
          onClick={() => setTab('daily')}
        >
          Daily Missions
          {getUnclaimedMissionCount() > 0 && (
            <span className="tab-badge">{getUnclaimedMissionCount()}</span>
          )}
        </button>
        <button
          className={`missions-tab ${tab === 'trophies' ? 'active' : ''}`}
          onClick={() => setTab('trophies')}
        >
          Trophies
          {getUnclaimedTrophyCount() > 0 && (
            <span className="tab-badge">{getUnclaimedTrophyCount()}</span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="missions-content">
        {tab === 'daily' && (
          <div className="daily-missions">
            {getUnclaimedMissionCount() > 0 && (
              <button className="claim-all-btn" onClick={handleClaimAllMissions}>
                Claim All ({getUnclaimedMissionCount()})
              </button>
            )}
            {dailyState.missions.map(mission => {
              const def = dailyDefs.find(d => d.id === mission.missionId);
              if (!def) return null;
              const isComplete = mission.current >= def.target;
              const isClaimed = mission.claimed;

              return (
                <div
                  key={mission.missionId}
                  className={`mission-card ${isClaimed ? 'claimed' : ''} ${isComplete && !isClaimed ? 'ready' : ''}`}
                >
                  <div className="mission-icon"><GameIcon id={def.icon} size={16} /></div>
                  <div className="mission-info">
                    <div className="mission-desc">{def.description}</div>
                    <div className="mission-progress-bar">
                      <div
                        className="mission-progress-fill"
                        style={{ width: `${Math.min(100, (mission.current / def.target) * 100)}%` }}
                      />
                    </div>
                    <div className="mission-progress-text">
                      {mission.current}/{def.target}
                    </div>
                  </div>
                  <div className="mission-reward-info">
                    {def.reward.regularPokeballs && <span className="reward-pokeballs">{def.reward.regularPokeballs} <GameIcon id="pokeball" size={14} /></span>}
                    {def.reward.premiumPokeballs && <span className="reward-pokeballs">{def.reward.premiumPokeballs} <GameIcon id="premiumPokeball" size={14} /></span>}
                    {def.reward.energy && <span className="reward-energy">{def.reward.energy} <GameIcon id="energy" size={14} /></span>}
                  </div>
                  <button
                    className="mission-claim-btn"
                    disabled={!isComplete || isClaimed}
                    onClick={() => handleClaimMission(mission.missionId)}
                  >
                    {isClaimed ? <GameIcon id="check" size={14} /> : 'Claim'}
                  </button>
                </div>
              );
            })}

            {/* All dailies bonus */}
            <div className={`all-dailies-bonus ${completedCount === dailyState.missions.length && !dailyState.allClaimedBonus ? 'ready' : ''} ${dailyState.allClaimedBonus ? 'claimed' : ''}`}>
              <div className="bonus-info">
                <span className="bonus-icon"><GameIcon id="gift" size={16} /></span>
                <span className="bonus-text">Complete All Missions</span>
                <span className="bonus-progress">{completedCount}/{dailyState.missions.length}</span>
              </div>
              <div className="bonus-reward">
                <span>15 <GameIcon id="pokeball" size={14} /> + 5 <GameIcon id="premiumPokeball" size={14} /> + 10 <GameIcon id="energy" size={14} /></span>
              </div>
              <button
                className="mission-claim-btn bonus-claim"
                disabled={completedCount < dailyState.missions.length || dailyState.allClaimedBonus}
                onClick={handleClaimAllBonus}
              >
                {dailyState.allClaimedBonus ? <GameIcon id="check" size={14} /> : 'Claim'}
              </button>
            </div>
          </div>
        )}

        {tab === 'trophies' && (
          <div className="trophies-list">
            {getUnclaimedTrophyCount() > 0 && (
              <button className="claim-all-btn" onClick={handleClaimAllTrophies}>
                Claim All ({getUnclaimedTrophyCount()})
              </button>
            )}
            {TROPHIES.map(trophy => {
              const progress = rewardState.trophyProgress.find(t => t.trophyId === trophy.id);
              if (!progress) return null;

              return (
                <TrophyCard
                  key={trophy.id}
                  trophy={trophy}
                  progress={progress}
                  onClaim={handleClaimTrophy}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Claim toast */}
      {claimedReward && (
        <div className="claim-toast">
          <span>Reward claimed!</span>
          {claimedReward.regularPokeballs && <span> +{claimedReward.regularPokeballs} <GameIcon id="pokeball" size={14} /></span>}
          {claimedReward.premiumPokeballs && <span> +{claimedReward.premiumPokeballs} <GameIcon id="premiumPokeball" size={14} /></span>}
          {claimedReward.energy && <span> +{claimedReward.energy} <GameIcon id="energy" size={14} /></span>}
        </div>
      )}
    </div>
  );
}

function TrophyCard({
  trophy,
  progress,
  onClaim,
}: {
  trophy: TrophyDefinition;
  progress: TrophyProgress;
  onClaim: (trophyId: string, tierIndex: number) => void;
}) {
  // Find the current active tier (first unclaimed one where threshold is reachable)
  const currentTierIndex = trophy.tiers.findIndex(
    (_, i) => !progress.claimedTiers.includes(i)
  );
  const nextTier = currentTierIndex >= 0 ? trophy.tiers[currentTierIndex] : null;

  return (
    <div className="trophy-card">
      <div className="trophy-header">
        <span className="trophy-icon"><GameIcon id={trophy.icon} size={16} /></span>
        <div className="trophy-name-area">
          <span className="trophy-name">{trophy.name}</span>
          <span className="trophy-desc">
            {trophy.description.replace('{threshold}', nextTier ? String(nextTier.threshold) : 'MAX')}
          </span>
        </div>
        <span className="trophy-current">{progress.current}</span>
      </div>
      <div className="trophy-tiers">
        {trophy.tiers.map((tier, i) => {
          const claimed = progress.claimedTiers.includes(i);
          const reached = progress.current >= tier.threshold;

          return (
            <div
              key={i}
              className={`trophy-tier ${claimed ? 'claimed' : ''} ${reached && !claimed ? 'ready' : ''}`}
            >
              <span className="tier-threshold">{tier.threshold}</span>
              <div className="tier-progress-bar">
                <div
                  className="tier-progress-fill"
                  style={{ width: `${Math.min(100, (progress.current / tier.threshold) * 100)}%` }}
                />
              </div>
              <span className="tier-reward">
                {tier.reward.regularPokeballs && <>{tier.reward.regularPokeballs} <GameIcon id="pokeball" size={14} /></>}
                {tier.reward.premiumPokeballs && <>{tier.reward.premiumPokeballs} <GameIcon id="premiumPokeball" size={14} /></>}
              </span>
              <button
                className="tier-claim-btn"
                disabled={!reached || claimed}
                onClick={() => onClaim(trophy.id, i)}
              >
                {claimed ? <GameIcon id="check" size={14} /> : reached ? 'Claim' : <GameIcon id="lock" size={14} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
