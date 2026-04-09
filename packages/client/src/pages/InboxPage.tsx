import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import type { InboxItem, MissionReward } from '@gatchamon/shared';
import { GameIcon } from '../components/icons';
import * as serverApi from '../services/server-api.service';
import './InboxPage.css';

export function InboxPage() {
  const navigate = useNavigate();
  const { refreshPlayer } = useGameStore();
  const [claimedReward, setClaimedReward] = useState<MissionReward | null>(null);

  // Server mode state
  const [serverItems, setServerItems] = useState<InboxItem[] | null>(null);

  useEffect(() => {
    reloadInbox();
    const interval = setInterval(reloadInbox, 30_000);
    return () => clearInterval(interval);
  }, []);

  const reloadInbox = () => {
    serverApi.getInbox().then((res: any) => {
      setServerItems(res.items ?? res ?? []);
    }).catch(() => {});
  };

  const items: InboxItem[] = serverItems ?? [];

  const handleClaim = async (item: InboxItem) => {
    // Retry summon: navigate — the destination page handles claiming
    if (item.specialItem === 'retry-summon-100') {
      navigate('/retry-summon');
      return;
    }

    try {
      const res = await serverApi.claimInboxReward(item.id);
      if (res?.reward) {
        setClaimedReward(res.reward);
        setTimeout(() => setClaimedReward(null), 2000);
      }
    } catch {
      // claim may still have succeeded server-side
    }
    refreshPlayer();
    reloadInbox();
  };

  const handleRead = (_item: InboxItem) => {
    // Server handles read status automatically
  };

  return (
    <div className="page inbox-page">
      <div className="inbox-header">
        <h2 className="inbox-title">Inbox</h2>
        <button className="inbox-clear-btn" onClick={reloadInbox}>
          Refresh
        </button>
      </div>

      <div className="inbox-list">
        {items.length === 0 && (
          <div className="inbox-empty">No messages</div>
        )}
        {items.map(item => (
          <div
            key={item.id}
            className={`inbox-card ${item.claimed ? 'claimed' : ''} ${!item.read ? 'unread' : ''}`}
            onClick={() => handleRead(item)}
          >
            <div className="inbox-card-icon">
              <GameIcon id={item.specialItem === 'beginner-item-set' ? 'crown' : item.specialItem ? 'summon' : 'gift'} size={20} />
            </div>
            <div className="inbox-card-info">
              <div className="inbox-card-title">
                {!item.read && !item.claimed && <span className="unread-dot" />}
                {item.title}
              </div>
              <div className="inbox-card-message">{item.message}</div>
              {item.reward && !item.claimed && (
                <div className="inbox-card-rewards">
                  {item.reward.regularPokeballs && (
                    <span>{item.reward.regularPokeballs} <GameIcon id="pokeball" size={12} /></span>
                  )}
                  {item.reward.premiumPokeballs && (
                    <span>{item.reward.premiumPokeballs} <GameIcon id="premiumPokeball" size={12} /></span>
                  )}
                  {item.reward.energy && (
                    <span>{item.reward.energy} <GameIcon id="energy" size={12} /></span>
                  )}
                </div>
              )}
              {item.specialItem === 'retry-summon-100' && !item.claimed && (
                <div className="inbox-card-special">
                  <GameIcon id="premiumPokeball" size={12} /> 100x Retry Premium Summon
                </div>
              )}
              {item.specialItem === 'beginner-item-set' && !item.claimed && (
                <div className="inbox-card-special">
                  <GameIcon id="crown" size={12} /> 4x King's Rock + 2x Quick Claw (6★ Lv.15)
                </div>
              )}
            </div>
            <div className="inbox-card-action">
              {item.claimed ? (
                <span className="inbox-claimed-tag"><GameIcon id="check" size={14} /></span>
              ) : (
                <button
                  className="inbox-claim-btn"
                  onClick={(e) => { e.stopPropagation(); handleClaim(item); }}
                >
                  {item.specialItem ? 'Open' : 'Claim'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

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
