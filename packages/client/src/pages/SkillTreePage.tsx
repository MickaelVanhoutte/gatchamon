import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getTemplate,
  getSkillsForPokemon,
  SKILLS,
  ESSENCES,
  HOMUNCULUS_TYPES,
  getHomunculusType,
  getHomunculusSwitchCost,
  getHomunculusTree,
  resolveHomunculusSkills,
} from '@gatchamon/shared';
import type { HomunculusType, HomunculusNode } from '@gatchamon/shared';
import { useGameStore } from '../stores/gameStore';
import { GameIcon } from '../components/icons';
import { assetUrl } from '../utils/asset-url';
import './SkillTreePage.css';

function essenceLabel(essId: string): string {
  const ess = ESSENCES[essId];
  return ess?.name ?? essId;
}

function costEntries(cost: Record<string, number>): Array<[string, number]> {
  return Object.entries(cost);
}

export function SkillTreePage() {
  const { instanceId } = useParams<{ instanceId: string }>();
  const navigate = useNavigate();
  const {
    collection, player, loadCollection,
    unlockHomunculusNode, resetHomunculusTree, switchHomunculusType,
  } = useGameStore();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [switching, setSwitching] = useState<HomunculusType | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!collection.length) loadCollection();
  }, [collection.length, loadCollection]);

  const owned = collection.find(o => o.instance.instanceId === instanceId);
  const hType = owned ? getHomunculusType(owned.instance.templateId) : null;
  const tree = hType ? getHomunculusTree(hType) : null;
  const unlocked = owned?.instance.homunculusTree?.unlocked ?? [];
  const unlockedSet = useMemo(() => new Set(unlocked), [unlocked]);

  const effectiveSkillIds = useMemo(() => {
    return hType ? resolveHomunculusSkills(hType, unlocked) : null;
  }, [hType, unlocked]);

  const effectiveSkills = useMemo(() => {
    return effectiveSkillIds ? getSkillsForPokemon(effectiveSkillIds) : [];
  }, [effectiveSkillIds]);

  if (!owned) {
    return (
      <div className="skilltree-page">
        <div className="skilltree-header">
          <button className="skilltree-back" onClick={() => navigate('/collection')}>← Back</button>
          <span className="skilltree-title">Homunculus not found</span>
        </div>
      </div>
    );
  }

  if (!hType || !tree) {
    return (
      <div className="skilltree-page">
        <div className="skilltree-header">
          <button className="skilltree-back" onClick={() => navigate('/collection')}>← Back</button>
          <span className="skilltree-title">This monster is not a fused Homunculus</span>
        </div>
      </div>
    );
  }

  const materials = player?.materials ?? {};
  const selectedNode: HomunculusNode | null = selectedNodeId
    ? tree.nodes.find(n => n.id === selectedNodeId) ?? null
    : null;

  function canAfford(cost: Record<string, number>): boolean {
    return Object.entries(cost).every(([essId, n]) => (materials[essId] ?? 0) >= n);
  }

  function parentIsUnlocked(node: HomunculusNode): boolean {
    return !node.parent || unlockedSet.has(node.parent);
  }

  async function handleUnlock() {
    if (!selectedNode || !owned) return;
    if (unlockedSet.has(selectedNode.id)) return;
    if (!parentIsUnlocked(selectedNode)) { setToast('Unlock the prerequisite first'); return; }
    if (!canAfford(selectedNode.cost)) { setToast('Not enough essences'); return; }
    await unlockHomunculusNode(owned.instance.instanceId, selectedNode.id);
    setToast(`Unlocked: ${selectedNode.label}`);
  }

  async function handleReset() {
    if (!owned) return;
    setShowResetConfirm(false);
    setResetting(true);
    try {
      const refunded = await resetHomunculusTree(owned.instance.instanceId);
      const parts = Object.entries(refunded).map(([k, v]) => `${v}× ${essenceLabel(k)}`);
      setToast(parts.length ? `Refunded ${parts.join(', ')}` : 'Tree reset');
      setSelectedNodeId(null);
    } finally {
      setResetting(false);
    }
  }

  async function handleSwitch(target: HomunculusType) {
    if (!owned || target === hType) return;
    setSwitching(target);
    try {
      const refunded = await switchHomunculusType(owned.instance.instanceId, target);
      const parts = Object.entries(refunded).map(([k, v]) => `${v}× ${essenceLabel(k)}`);
      setToast(parts.length ? `Switched. Refunded ${parts.join(', ')}` : `Switched to ${target}`);
      setSelectedNodeId(null);
    } finally {
      setSwitching(null);
    }
  }

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const template = getTemplate(owned.instance.templateId);

  // Tree layout constants — absolute positioning + SVG overlay
  const CELL_W = 130;
  const CELL_H = 86;
  const PADDING = 16;
  const maxCol = tree.nodes.reduce((m, n) => Math.max(m, n.col), 0);
  const maxRow = tree.nodes.reduce((m, n) => Math.max(m, n.row), 0);
  const treeWidth = (maxCol + 1) * CELL_W + PADDING * 2;
  const treeHeight = (maxRow + 1) * CELL_H + PADDING * 2;
  const nodeW = CELL_W - 16;
  const nodeH = CELL_H - 16;

  function nodeCenter(node: HomunculusNode): { cx: number; cy: number } {
    return {
      cx: PADDING + node.col * CELL_W + CELL_W / 2,
      cy: PADDING + node.row * CELL_H + CELL_H / 2,
    };
  }

  const connectors = tree.nodes
    .filter(n => n.parent !== null)
    .map(child => {
      const parent = tree.nodes.find(p => p.id === child.parent);
      if (!parent) return null;
      const p = nodeCenter(parent);
      const c = nodeCenter(child);
      const bothUnlocked = unlockedSet.has(parent.id) && unlockedSet.has(child.id);
      const parentOnly = unlockedSet.has(parent.id) && !unlockedSet.has(child.id);
      return { id: `${parent.id}-${child.id}`, p, c, bothUnlocked, parentOnly };
    })
    .filter(Boolean);

  return (
    <div className="skilltree-page">
      <div className="skilltree-header">
        <button className="skilltree-back" onClick={() => navigate('/collection')}>← Back</button>
        {template && (
          <img src={assetUrl(template.spriteUrl)} alt={template.name} className="skilltree-sprite" />
        )}
        <div className="skilltree-titlecol">
          <span className="skilltree-title">{template?.name ?? 'Homunculus'}</span>
          <span className="skilltree-subtitle">Type: <span className={`skilltree-type skilltree-type-${hType}`}>{hType}</span></span>
        </div>
      </div>

      {/* Type switcher */}
      <div className="skilltree-typeswitch">
        <span className="skilltree-typeswitch-label">Switch Type:</span>
        {HOMUNCULUS_TYPES.map(t => {
          const cost = getHomunculusSwitchCost(t).essences;
          const affordable = t === hType || canAfford(cost);
          const isCurrent = t === hType;
          return (
            <button
              key={t}
              className={`skilltree-typechip skilltree-type-${t} ${isCurrent ? 'current' : ''}`}
              disabled={isCurrent || !affordable || !!switching}
              onClick={() => {
                if (isCurrent) return;
                if (confirm(`Switch to ${t}? Your current tree will be refunded and the new tree will start empty.`)) {
                  handleSwitch(t);
                }
              }}
              title={isCurrent ? 'Current type' : Object.entries(cost).map(([k, v]) => `${v}× ${essenceLabel(k)}`).join(', ')}
            >
              {t}{isCurrent ? ' (current)' : ''}
            </button>
          );
        })}
      </div>

      {/* Tree */}
      <div className="skilltree-body">
        <div className="skilltree-tree-scroll">
          <div className="skilltree-tree-canvas" style={{ width: treeWidth, height: treeHeight }}>
            <svg
              className="skilltree-connectors"
              width={treeWidth}
              height={treeHeight}
              viewBox={`0 0 ${treeWidth} ${treeHeight}`}
              aria-hidden
            >
              {connectors.map(con => con && (
                <line
                  key={con.id}
                  x1={con.p.cx}
                  y1={con.p.cy}
                  x2={con.c.cx}
                  y2={con.c.cy}
                  className={
                    'skilltree-connector ' +
                    (con.bothUnlocked ? 'unlocked ' : '') +
                    (con.parentOnly ? 'unlockable' : '')
                  }
                />
              ))}
            </svg>
            {tree.nodes.map(node => {
              const { cx, cy } = nodeCenter(node);
              const isUnlocked = unlockedSet.has(node.id);
              const canUnlock = !isUnlocked && parentIsUnlocked(node) && canAfford(node.cost);
              const parentLocked = !parentIsUnlocked(node);
              return (
                <button
                  key={node.id}
                  className={
                    'skilltree-node ' +
                    (isUnlocked ? 'unlocked ' : '') +
                    (canUnlock ? 'affordable ' : '') +
                    (parentLocked ? 'parent-locked ' : '') +
                    (selectedNodeId === node.id ? 'selected' : '')
                  }
                  style={{
                    position: 'absolute',
                    left: cx - nodeW / 2,
                    top: cy - nodeH / 2,
                    width: nodeW,
                    height: nodeH,
                  }}
                  onClick={() => setSelectedNodeId(node.id)}
                >
                  <span className="skilltree-node-label">{node.label}</span>
                  <span className="skilltree-node-slot">T{node.tier} · slot {node.slot + 1}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail panel */}
        <div className="skilltree-detail">
          {selectedNode ? (
            <>
              <h3 className="skilltree-detail-label">{selectedNode.label}</h3>
              <p className="skilltree-detail-desc">{selectedNode.description}</p>
              {selectedNode.replaceSkillId && SKILLS[selectedNode.replaceSkillId] && (
                <div className="skilltree-skill-preview">
                  <span className="skilltree-skill-name">{SKILLS[selectedNode.replaceSkillId].name}</span>
                  <span className="skilltree-skill-desc">{SKILLS[selectedNode.replaceSkillId].description}</span>
                </div>
              )}
              <div className="skilltree-detail-reqs">
                {costEntries(selectedNode.cost).map(([essId, needed]) => {
                  const owned = materials[essId] ?? 0;
                  const ess = ESSENCES[essId];
                  return (
                    <div key={essId} className="skilltree-detail-req">
                      <span><GameIcon id={ess?.icon} size={14} /> {essenceLabel(essId)}</span>
                      <span className={owned >= needed ? 'req-met' : 'req-unmet'}>{owned}/{needed}</span>
                    </div>
                  );
                })}
              </div>
              {unlockedSet.has(selectedNode.id) ? (
                <button className="skilltree-unlock-btn" disabled>Already unlocked</button>
              ) : !parentIsUnlocked(selectedNode) ? (
                <button className="skilltree-unlock-btn" disabled>Prerequisite locked</button>
              ) : !canAfford(selectedNode.cost) ? (
                <button className="skilltree-unlock-btn" disabled>Not enough essences</button>
              ) : (
                <button className="skilltree-unlock-btn" onClick={handleUnlock}>Unlock</button>
              )}
            </>
          ) : (
            <p className="skilltree-detail-hint">Select a node to see its effect and cost.</p>
          )}
        </div>
      </div>

      {/* Current effective skills */}
      <div className="skilltree-currentskills">
        <span className="skilltree-current-label">Current skills</span>
        <div className="skilltree-current-list">
          {effectiveSkills.map(sk => (
            <div key={sk.id} className="skilltree-current-skill">
              <span className="skilltree-current-name">{sk.name}</span>
              <span className="skilltree-current-cat">{sk.category}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer: reset */}
      <div className="skilltree-footer">
        <button
          className="skilltree-reset-btn"
          onClick={() => setShowResetConfirm(true)}
          disabled={resetting || !unlocked.length}
        >
          {resetting ? 'Resetting…' : `Reset Skill Tree${unlocked.length ? ` (${unlocked.length} node${unlocked.length > 1 ? 's' : ''})` : ''}`}
        </button>
      </div>

      {toast && <div className="skilltree-toast">{toast}</div>}

      {showResetConfirm && (
        <div className="skilltree-modal-overlay" onClick={() => setShowResetConfirm(false)}>
          <div className="skilltree-modal" onClick={e => e.stopPropagation()}>
            <h3>Reset Skill Tree?</h3>
            <p>All {unlocked.length} unlocked node{unlocked.length > 1 ? 's' : ''} will be refunded. The tree will be cleared.</p>
            <div className="skilltree-modal-actions">
              <button onClick={() => setShowResetConfirm(false)}>Cancel</button>
              <button className="skilltree-modal-confirm" onClick={handleReset}>Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
