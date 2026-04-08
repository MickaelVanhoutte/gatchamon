import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import {
  getInboxItems,
  claimInboxReward as claimInboxLocal,
  markAsRead,
  clearReadMessages,
} from '../services/inbox.service';
import type { InboxItem, MissionReward } from '@gatchamon/shared';
import { GameIcon } from '../components/icons';
import { USE_SERVER } from '../config';
import * as serverApi from '../services/server-api.service';
import './InboxPage.css';

export function InboxPage() {
  const navigate = useNavigate();
  const { refreshPlayer } = useGameStore();
  const [claimedReward, setClaimedReward] = useState<MissionReward | null>(null);
  const [claimedSpecial, setClaimedSpecial] = useState<string | null>(null);
  const [, setTick] = useState(0);
  const forceUpdate = useCallback(() => setTick(t => t + 1), []);

  // Server mode state
  const [serverItems, setServerItems] = useState<InboxItem[] | null>(null);

  useEffect(() => {
    if (!USE_SERVER) return;
    reloadInbox();
    const interval = setInterval(reloadInbox, 30_000);
    return () => clearInterval(interval);
  }, []);

  const reloadInbox = () => {
    if (USE_SERVER) {
      serverApi.getInbox().then((res: any) => {
        setServerItems(res.items ?? res ?? []);
      }).catch(() => {});
    }
  };

  const items: InboxItem[] = USE_SERVER ? (serverItems ?? []) : getInboxItems();
  const readCount = items.filter(i => i.read || i.claimed).length;

  const handleClearRead = () => {
    if (USE_SERVER) {
      // Server doesn't have a clear-read endpoint; just reload
      reloadInbox();
      return;
    }
    const removed = clearReadMessages();
    if (removed > 0) {
      refreshPlayer();
      forceUpdate();
    }
  };

  const handleClaim = async (item: InboxItem) => {
    // Retry summon: navigate — the destination page handles claiming
    if (item.specialItem === 'retry-summon-100') {
      navigate('/retry-summon');
      return;
    }

    if (USE_SERVER) {
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
      return;
    }

    const result = claimInboxLocal(item.id);
    if (!result) return;

    refreshPlayer();
    forceUpdate();

    if (result.specialItem === 'beginner-item-set') {
      setClaimedSpecial('Starter Item Set received! Check your held items.');
      setTimeout(() => setClaimedSpecial(null), 3000);
    } else if (result.reward) {
      setClaimedReward(result.reward);
      setTimeout(() => setClaimedReward(null), 2000);
    }
  };

  const handleRead = (item: InboxItem) => {
    if (!item.read && !USE_SERVER) {
      markAsRead(item.id);
      forceUpdate();
    }
  };

  return (
    <div className="page inbox-page">
      <div className="inbox-header">
        <h2 className="inbox-title">Inbox</h2>
        {USE_SERVER && (
          <button className="inbox-clear-btn" onClick={reloadInbox}>
            Refresh
          </button>
        )}
        {!USE_SERVER && readCount > 0 && (
          <button className="inbox-clear-btn" onClick={handleClearRead}>
            Clear read ({readCount})
          </button>
        )}
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
      {claimedSpecial && (
        <div className="claim-toast">{claimedSpecial}</div>
      )}
    </div>
  );
}
