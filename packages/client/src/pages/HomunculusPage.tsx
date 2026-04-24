import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getTemplate,
  ESSENCES,
  HOMUNCULUS_TYPES,
  HOMUNCULUS_FORMS,
  TYPENULL_TEMPLATE_ID,
  getFusionCost,
  getHomunculusType,
  isHomunculusForm,
} from '@gatchamon/shared';
import type { HomunculusType } from '@gatchamon/shared';
import { useGameStore } from '../stores/gameStore';
import { GameIcon } from '../components/icons';
import { assetUrl } from '../utils/asset-url';
import * as serverApi from '../services/server-api.service';
import './HomunculusPage.css';

type Stage = 'craft' | 'fuse' | 'manage';

const CRAFT_FALLBACK_COST: Record<string, number> = { magic_high: 30 };

function essenceLabel(essId: string): string {
  return ESSENCES[essId]?.name ?? essId;
}

export function HomunculusPage() {
  const navigate = useNavigate();
  const { player, collection, loadCollection, craftTypenull, fuseHomunculus } = useGameStore();

  const [craftCost, setCraftCost] = useState<Record<string, number>>(CRAFT_FALLBACK_COST);
  const [crafting, setCrafting] = useState(false);
  const [fusing, setFusing] = useState<HomunculusType | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    serverApi.getTypenullCraftCost()
      .then(res => setCraftCost(res.cost))
      .catch(() => { /* keep fallback */ });
  }, []);

  useEffect(() => {
    if (!collection.length) loadCollection();
  }, [collection.length, loadCollection]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const materials = player?.materials ?? {};

  const typenullInstance = useMemo(
    () => collection.find(o => o.instance.templateId === TYPENULL_TEMPLATE_ID),
    [collection],
  );
  const homunculusInstance = useMemo(
    () => collection.find(o => isHomunculusForm(o.instance.templateId)),
    [collection],
  );

  const alreadyFused = player?.grantedFlags?.includes('homunculus_fused') ?? false;

  let stage: Stage;
  if (homunculusInstance || alreadyFused) stage = 'manage';
  else if (typenullInstance) stage = 'fuse';
  else stage = 'craft';

  function canAfford(cost: Record<string, number>): boolean {
    return Object.entries(cost).every(([essId, n]) => (materials[essId] ?? 0) >= n);
  }

  async function handleCraft() {
    if (crafting) return;
    setCrafting(true);
    try {
      await craftTypenull();
      setToast('Typenull crafted');
    } catch (e: any) {
      setToast(e?.message ?? 'Craft failed');
    } finally {
      setCrafting(false);
    }
  }

  async function handleFuse(target: HomunculusType) {
    if (!typenullInstance || fusing) return;
    setFusing(target);
    try {
      await fuseHomunculus(typenullInstance.instance.instanceId, target);
      setToast('Fusion complete');
    } finally {
      setFusing(null);
    }
  }

  const typenullTemplate = getTemplate(TYPENULL_TEMPLATE_ID);
  const currentHType = homunculusInstance ? getHomunculusType(homunculusInstance.instance.templateId) : null;
  const homunculusTemplate = homunculusInstance ? getTemplate(homunculusInstance.instance.templateId) : null;

  return (
    <div className="page homunculus-page">
      <div className="hmc-header">
        <button className="hmc-back" onClick={() => navigate(-1)}>← Back</button>
        <span className="hmc-title">Silvally Altar</span>
      </div>

      <div className="hmc-intro">
        Craft a Typenull from essences, then fuse it into a typed Silvally and grow its skill tree.
      </div>

      {/* ── Stage: craft ── */}
      {stage === 'craft' && (
        <div className="hmc-panel">
          <div className="hmc-panel-head">
            {typenullTemplate && (
              <img src={assetUrl(typenullTemplate.spriteUrl)} alt="Typenull" className="hmc-panel-sprite" />
            )}
            <div className="hmc-panel-titlecol">
              <span className="hmc-panel-title">Craft Typenull</span>
              <span className="hmc-panel-sub">A blank-slate 5★ monster you can fuse into a typed Silvally.</span>
            </div>
          </div>

          <div className="hmc-reqs">
            {Object.entries(craftCost).map(([essId, needed]) => {
              const owned = materials[essId] ?? 0;
              const ess = ESSENCES[essId];
              return (
                <div key={essId} className="hmc-req-row">
                  <span><GameIcon id={ess?.icon} size={16} /> {essenceLabel(essId)}</span>
                  <span className={owned >= needed ? 'req-met' : 'req-unmet'}>{owned}/{needed}</span>
                </div>
              );
            })}
          </div>

          <button
            className="hmc-cta"
            disabled={crafting || !canAfford(craftCost)}
            onClick={() => {
              if (confirm('Craft Typenull? This consumes the essences shown.')) handleCraft();
            }}
          >
            {crafting ? 'Crafting…' : canAfford(craftCost) ? 'Craft Typenull' : 'Requirements not met'}
          </button>
        </div>
      )}

      {/* ── Stage: fuse ── */}
      {stage === 'fuse' && typenullInstance && (
        <div className="hmc-panel">
          <div className="hmc-panel-head">
            {typenullTemplate && (
              <img src={assetUrl(typenullTemplate.spriteUrl)} alt="Typenull" className="hmc-panel-sprite" />
            )}
            <div className="hmc-panel-titlecol">
              <span className="hmc-panel-title">Choose a Fusion</span>
              <span className="hmc-panel-sub">Pick a type for your Silvally. You can switch type later.</span>
            </div>
          </div>

          <div className="hmc-fusion-grid">
            {HOMUNCULUS_TYPES.map(type => {
              const template = getTemplate(HOMUNCULUS_FORMS[type]);
              if (!template) return null;
              const cost = getFusionCost(type).essences;
              const affordable = canAfford(cost);
              return (
                <div key={type} className={`hmc-fusion-card hmc-type-${type}`}>
                  <img src={assetUrl(template.spriteUrl)} alt={template.name} className="hmc-fusion-sprite" />
                  <div className="hmc-fusion-name">{template.name}</div>
                  <div className="hmc-reqs">
                    {Object.entries(cost).map(([essId, needed]) => {
                      const owned = materials[essId] ?? 0;
                      const ess = ESSENCES[essId];
                      return (
                        <div key={essId} className="hmc-req-row">
                          <span><GameIcon id={ess?.icon} size={14} /> {essenceLabel(essId)}</span>
                          <span className={owned >= needed ? 'req-met' : 'req-unmet'}>{owned}/{needed}</span>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    className="hmc-cta"
                    disabled={!affordable || fusing !== null}
                    onClick={() => {
                      if (confirm(`Fuse Typenull into ${template.name}?`)) handleFuse(type);
                    }}
                  >
                    {fusing === type ? 'Fusing…' : affordable ? 'Fuse' : 'Requirements not met'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Stage: manage ── */}
      {stage === 'manage' && homunculusInstance && homunculusTemplate && currentHType && (
        <div className="hmc-panel">
          <div className="hmc-panel-head">
            <img src={assetUrl(homunculusTemplate.spriteUrl)} alt={homunculusTemplate.name} className="hmc-panel-sprite" />
            <div className="hmc-panel-titlecol">
              <span className="hmc-panel-title">{homunculusTemplate.name}</span>
              <span className="hmc-panel-sub">
                Type: <span className={`hmc-type-chip hmc-type-${currentHType}`}>{currentHType}</span>
              </span>
            </div>
          </div>
          <p className="hmc-manage-hint">
            Your Silvally is ready. Open the skill tree to unlock nodes, switch type, or reset.
          </p>
          <button
            className="hmc-cta"
            onClick={() => navigate(`/homunculus/${homunculusInstance.instance.instanceId}`)}
          >
            Open Skill Tree
          </button>
        </div>
      )}

      {/* Fallback for stuck-state edge cases (flag set but instance missing) */}
      {stage === 'manage' && !homunculusInstance && (
        <div className="hmc-panel">
          <p className="hmc-manage-hint">
            You've already fused a Silvally but it isn't in your collection right now. Check your PC box.
          </p>
        </div>
      )}

      {toast && <div className="hmc-toast">{toast}</div>}
    </div>
  );
}
