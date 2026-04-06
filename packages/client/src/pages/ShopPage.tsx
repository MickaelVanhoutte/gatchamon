import { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { SHOP_ITEMS, purchaseShopItem } from '../services/shop.service';
import type { SummonResult } from '../services/gacha.service';
import { hasGrantedFlag } from '../services/storage';
import { GameIcon, StarRating } from '../components/icons';
import { getTemplate } from '@gatchamon/shared';
import './ShopPage.css';

type Phase = 'browse' | 'confirm' | 'results';

export function ShopPage() {
  const { player, refreshPlayer, loadCollection } = useGameStore();
  const [phase, setPhase] = useState<Phase>('browse');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [results, setResults] = useState<SummonResult[]>([]);
  const [error, setError] = useState('');

  if (!player) return null;

  const stardust = player.stardust ?? 0;

  function handleBuy(itemId: string) {
    setSelectedItemId(itemId);
    setPhase('confirm');
    setError('');
  }

  function handleConfirm() {
    if (!selectedItemId) return;
    try {
      const { results: summonResults } = purchaseShopItem(selectedItemId);
      setResults(summonResults);
      setPhase('results');
      refreshPlayer();
      loadCollection();
    } catch (e: any) {
      setError(e.message ?? 'Purchase failed');
      setPhase('browse');
    }
  }

  function handleBack() {
    setPhase('browse');
    setSelectedItemId(null);
    setResults([]);
    setError('');
  }

  const selectedDef = SHOP_ITEMS.find(i => i.id === selectedItemId);

  return (
    <div className="shop-page">
      <div className="shop-header">
        <h2>Shop</h2>
        <div className="shop-balance">
          <GameIcon id="stardust" size={16} className="shop-stardust-icon" />
          <span>{stardust.toLocaleString()}</span>
        </div>
      </div>

      {error && <div className="shop-error">{error}</div>}

      {phase === 'browse' && (
        <div className="shop-items">
          {SHOP_ITEMS.filter(item => !(item.id === 'speed_x3' && hasGrantedFlag('speed_x3'))).map(item => {
            const canAfford = stardust >= item.cost;
            return (
              <div key={item.id} className={`shop-card ${!canAfford ? 'shop-card-disabled' : ''}`}>
                <div className="shop-card-icon">
                  <GameIcon id={item.icon} size={40} />
                </div>
                <div className="shop-card-info">
                  <h3>{item.name}</h3>
                  <p className="shop-card-desc">{item.description}</p>
                </div>
                <div className="shop-card-footer">
                  <button
                    className="shop-buy-btn"
                    disabled={!canAfford}
                    onClick={() => handleBuy(item.id)}
                  >
                    Buy · <GameIcon id="stardust" size={12} /> {item.cost.toLocaleString()}
                  </button>
                </div>
              </div>
            );
          })}

          <div className="shop-coming-soon">
            <p>More items coming soon...</p>
          </div>
        </div>
      )}

      {phase === 'confirm' && selectedDef && (
        <div className="shop-confirm-overlay">
          <div className="shop-confirm-modal">
            <h3>Confirm Purchase</h3>
            <div className="shop-confirm-item">
              <GameIcon id={selectedDef.icon} size={32} />
              <span>{selectedDef.name}</span>
            </div>
            <p className="shop-confirm-desc">{selectedDef.description}</p>
            <div className="shop-confirm-cost">
              <GameIcon id="stardust" size={16} />
              <span>{selectedDef.cost.toLocaleString()} Stardust</span>
            </div>
            <div className="shop-confirm-buttons">
              <button className="shop-confirm-yes" onClick={handleConfirm}>Confirm</button>
              <button className="shop-confirm-no" onClick={handleBack}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {phase === 'results' && (
        <div className="shop-results">
          {results.length > 0 ? (
            <>
              <h3>Summon Results ({results.length} monsters)</h3>
              <div className="shop-results-grid">
                {results.map((r, i) => {
                  const tmpl = getTemplate(r.pokemon.templateId) ?? r.template;
                  return (
                    <div key={i} className={`shop-result-card star-${tmpl.naturalStars}`}>
                      <img
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${tmpl.id}.png`}
                        alt={tmpl.name}
                        className="shop-result-sprite"
                      />
                      <span className="shop-result-name">{tmpl.name}</span>
                      <StarRating count={tmpl.naturalStars} size={8} />
                      {r.pokemon.isShiny && <span className="shop-result-shiny">Shiny!</span>}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="shop-purchase-success">
              <GameIcon id={selectedDef?.icon ?? 'energy'} size={48} />
              <h3>Purchase Complete!</h3>
              <p>{selectedDef?.description}</p>
            </div>
          )}
          <button className="shop-back-btn" onClick={handleBack}>Back to Shop</button>
        </div>
      )}
    </div>
  );
}
