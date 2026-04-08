import { useState, useCallback, useEffect } from 'react';
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
import { USE_SERVER } from '../config';
import * as serverApi from '../services/server-api.service';
import './MissionsPage.css';

type Tab = 'daily' | 'trophies';

export function MissionsPage() {
  const { refreshPlayer } = useGameStore();
  const [tab, setTab] = useState<Tab>('daily');
  const [claimedReward, setClaimedReward] = useState<MissionReward | null>(null);
  const [, setTick] = useState(0);
  const forceUpdate = useCallback(() => setTick(t => t + 1), []);

  // Server mode state
  const [serverMissions, setServerMissions] = useState<any>(null);
  const [serverTrophies, setServerTrophies] = useState<any>(null);

  // Load data from server on mount
  useEffect(() => {
    if (!USE_SERVER) return;
    serverApi.getDailyMissions().then(setServerMissions).catch(() => {});
    serverApi.getTrophyProgress().then(setServerTrophies).catch(() => {});
  }, []);

  const reloadServerData = () => {
    if (!USE_SERVER) return;
    serverApi.getDailyMissions().then(setServerMissions).catch(() => {});
    serverApi.getTrophyProgress().then(setServerTrophies).catch(() => {});
  };

  // Resolve mission data for either mode
  const dailyState = USE_SERVER
    ? (serverMissions?.dailyMissions ?? serverMissions ?? { date: '', missions: [], allClaimedBonus: false })
    : getDailyMissions();
  const dailyDefs = selectDailyMissions(dailyState.date);
  const rewardState = USE_SERVER ? null : loadOrInitRewardState();

  // Trophy progress
  const trophyProgress: TrophyProgress[] = USE_SERVER
    ? (serverTrophies?.progress ?? [])
    : (rewardState?.trophyProgress ?? []);

  const handleClaimMission = async (missionId: string) => {
    if (USE_SERVER) {
      try {
        const res = await serverApi.claimMission(missionId);
        if (res?.reward) setClaimedReward(res.reward);
        refreshPlayer();
        reloadServerData();
        setTimeout(() => setClaimedReward(null), 2000);
      } catch {}
      return;
    }
    const reward = claimMissionReward(missionId);
    if (reward) {
      setClaimedReward(reward);
      refreshPlayer();
      forceUpdate();
      setTimeout(() => setClaimedReward(null), 2000);
    }
  };

  const handleClaimAllBonus = async () => {
    if (USE_SERVER) {
      // Claim all-dailies bonus by claiming the special 'all_dailies' mission
      try {
        const res = await serverApi.claimMission('all_dailies_bonus');
        if (res?.reward) setClaimedReward(res.reward);
        refreshPlayer();
        reloadServerData();
        setTimeout(() => setClaimedReward(null), 2000);
      } catch {}
      return;
    }
    const reward = claimAllDailiesBonus();
    if (reward) {
      setClaimedReward(reward);
      refreshPlayer();
      forceUpdate();
      setTimeout(() => setClaimedReward(null), 2000);
    }
  };

  const handleClaimTrophy = async (trophyId: string, tierIndex: number) => {
    if (USE_SERVER) {
      try {
        const res = await serverApi.claimTrophy(trophyId, tierIndex);
        if (res?.reward) setClaimedReward(res.reward);
        refreshPlayer();
        reloadServerData();
        setTimeout(() => setClaimedReward(null), 2000);
      } catch {}
      return;
    }
    const reward = claimTrophyTier(trophyId, tierIndex);
    if (reward) {
      setClaimedReward(reward);
      refreshPlayer();
      forceUpdate();
      setTimeout(() => setClaimedReward(null), 2000);
    }
  };

  const handleClaimAllMissions = async () => {
    if (USE_SERVER) {
      // Claim each unclaimed mission + bonus
      for (const m of dailyState.missions) {
        const def = dailyDefs.find((d: any) => d.id === m.missionId);
        if (def && m.current >= def.target && !m.claimed) {
          try { await serverApi.claimMission(m.missionId); } catch {}
        }
      }
      refreshPlayer();
      reloadServerData();
      return;
    }
    const reward = claimAllMissions();
    if (reward) {
      setClaimedReward(reward);
      refreshPlayer();
      forceUpdate();
      setTimeout(() => setClaimedReward(null), 2000);
    }
  };

  const handleClaimAllTrophies = async () => {
    if (USE_SERVER) {
      for (const trophy of TROPHIES) {
        const tp = trophyProgress.find((t: any) => t.trophyId === trophy.id);
        if (!tp) continue;
        for (let i = 0; i < trophy.tiers.length; i++) {
          if (!tp.claimedTiers.includes(i) && tp.current >= trophy.tiers[i].threshold) {
            try { await serverApi.claimTrophy(trophy.id, i); } catch {}
          }
        }
      }
      refreshPlayer();
      reloadServerData();
      return;
    }
    const reward = claimAllTrophyTiers();
    if (reward) {
      setClaimedReward(reward);
      refreshPlayer();
      forceUpdate();
      setTimeout(() => setClaimedReward(null), 2000);
    }
  };

  const getUnclaimedMissions = (): number => {
    if (USE_SERVER) {
      return dailyState.missions.filter((m: any) => {
        const def = dailyDefs.find((d: any) => d.id === m.missionId);
        return def && m.current >= def.target && !m.claimed;
      }).length;
    }
    return getUnclaimedMissionCount();
  };

  const getUnclaimedTrophies = (): number => {
    if (USE_SERVER) {
      let count = 0;
      for (const trophy of TROPHIES) {
        const tp = trophyProgress.find((t: any) => t.trophyId === trophy.id);
        if (!tp) continue;
        count += trophy.tiers.filter((tier, i) => !tp.claimedTiers.includes(i) && tp.current >= tier.threshold).length;
      }
      return count;
    }
    return getUnclaimedTrophyCount();
  };

  const completedCount = dailyState.missions.filter((m: any) => m.claimed).length;

  return (
    <div className="page missions-page">
      {/* Tabs */}
      <div className="missions-tabs">
        <button
          className={`missions-tab ${tab === 'daily' ? 'active' : ''}`}
          onClick={() => setTab('daily')}
        >
          Daily Missions
          {getUnclaimedMissions() > 0 && (
            <span className="tab-badge">{getUnclaimedMissions()}</span>
          )}
        </button>
        <button
          className={`missions-tab ${tab === 'trophies' ? 'active' : ''}`}
          onClick={() => setTab('trophies')}
        >
          Trophies
          {getUnclaimedTrophies() > 0 && (
            <span className="tab-badge">{getUnclaimedTrophies()}</span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="missions-content">
        {tab === 'daily' && (
          <div className="daily-missions">
            {getUnclaimedMissions() > 0 && (
              <button className="claim-all-btn" onClick={handleClaimAllMissions}>
                Claim All ({getUnclaimedMissions()})
              </button>
            )}
            {dailyState.missions.map((mission: any) => {
              const def = dailyDefs.find((d: any) => d.id === mission.missionId);
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
            {getUnclaimedTrophies() > 0 && (
              <button className="claim-all-btn" onClick={handleClaimAllTrophies}>
                Claim All ({getUnclaimedTrophies()})
              </button>
            )}
            {TROPHIES.map(trophy => {
              const progress = trophyProgress.find((t: any) => t.trophyId === trophy.id);
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
