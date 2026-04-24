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

// Tree cell geometry (absolute positioning inside each panel).
const CELL_W = 110;
const CELL_H = 84;
const PADDING = 18;
const NODE_W = CELL_W - 16;
const NODE_H = CELL_H - 16;

// Which grid columns belong to which SW-style panel (col 1 / col 2 / col 3).
const PANEL_COLS: Record<number, 1 | 2 | 3> = { 0: 1, 1: 2, 2: 2, 3: 3 };

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
  const unlockedSet = useMemo(() => {
    const s = new Set(unlocked);
    if (tree) {
      for (const n of tree.nodes) if (n.alwaysUnlocked) s.add(n.id);
    }
    return s;
  }, [unlocked, tree]);

  const effectiveSkillIds = useMemo(() => {
    return hType ? resolveHomunculusSkills(hType, unlocked) : null;
  }, [hType, unlocked]);

  const effectiveSkills = useMemo(() => {
    return effectiveSkillIds ? getSkillsForPokemon(effectiveSkillIds) : [];
  }, [effectiveSkillIds]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  if (!owned) {
    return (
      <div className="skilltree-page">
        <div className="skilltree-header">
          <button className="skilltree-back" onClick={() => navigate('/collection')}>← Back</button>
          <span className="skilltree-title">Silvally not found</span>
        </div>
      </div>
    );
  }

  if (!hType || !tree) {
    return (
      <div className="skilltree-page">
        <div className="skilltree-header">
          <button className="skilltree-back" onClick={() => navigate('/collection')}>← Back</button>
          <span className="skilltree-title">This monster is not a fused Silvally</span>
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

  function mutexBlocker(node: HomunculusNode): HomunculusNode | null {
    if (!tree || !node.mutexGroup) return null;
    return tree.nodes.find(
      n => n.id !== node.id && n.mutexGroup === node.mutexGroup && unlockedSet.has(n.id),
    ) ?? null;
  }

  async function handleUnlock() {
    if (!selectedNode || !owned) return;
    if (unlockedSet.has(selectedNode.id)) return;
    if (!parentIsUnlocked(selectedNode)) { setToast('Unlock the prerequisite first'); return; }
    if (mutexBlocker(selectedNode)) { setToast('Another path in this branch is active — reset first'); return; }
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

  const template = getTemplate(owned.instance.templateId);

  // Split nodes into 3 panels.
  const panels: { id: 1 | 2 | 3; title: string; nodes: HomunculusNode[] }[] = [
    { id: 1, title: 'Skill 1', nodes: [] },
    { id: 2, title: 'Skill 2', nodes: [] },
    { id: 3, title: 'Skill 3', nodes: [] },
  ];
  for (const node of tree.nodes) {
    const panelId = PANEL_COLS[node.col] ?? 1;
    panels.find(p => p.id === panelId)!.nodes.push(node);
  }

  function panelGeometry(nodes: HomunculusNode[]) {
    const cols = Math.max(...nodes.map(n => n.col)) - Math.min(...nodes.map(n => n.col)) + 1;
    const rows = Math.max(...nodes.map(n => n.row)) + 1;
    return {
      cols,
      width: cols * CELL_W + PADDING * 2,
      height: rows * CELL_H + PADDING * 2,
      minCol: Math.min(...nodes.map(n => n.col)),
    };
  }

  function nodeCenter(node: HomunculusNode, minCol: number): { cx: number; cy: number } {
    return {
      cx: PADDING + (node.col - minCol) * CELL_W + CELL_W / 2,
      cy: PADDING + node.row * CELL_H + CELL_H / 2,
    };
  }

  return (
    <div className="skilltree-page">
      <div className="skilltree-header">
        <button className="skilltree-back" onClick={() => navigate('/collection')}>← Back</button>
        {template && (
          <img src={assetUrl(template.spriteUrl)} alt={template.name} className="skilltree-sprite" />
        )}
        <div className="skilltree-titlecol">
          <span className="skilltree-title">{template?.name ?? 'Silvally'}</span>
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

      {/* Tree: 3 brown-shaded panels */}
      <div className="skilltree-body">
        <div className="skilltree-tree-scroll">
          <div className="skilltree-panels">
            {panels.map(panel => {
              const geo = panelGeometry(panel.nodes);
              const connectors = panel.nodes
                .filter(n => n.parent !== null)
                .map(child => {
                  const parent = panel.nodes.find(p => p.id === child.parent)
                    ?? tree.nodes.find(p => p.id === child.parent);
                  if (!parent) return null;
                  // Only draw connectors when the parent is inside the same panel,
                  // otherwise the line would escape the panel and look broken.
                  if (!panel.nodes.find(p => p.id === parent.id)) return null;
                  const p = nodeCenter(parent, geo.minCol);
                  const c = nodeCenter(child, geo.minCol);
                  const bothUnlocked = unlockedSet.has(parent.id) && unlockedSet.has(child.id);
                  const parentOnly = unlockedSet.has(parent.id) && !unlockedSet.has(child.id);
                  return { id: `${parent.id}-${child.id}`, p, c, bothUnlocked, parentOnly };
                })
                .filter(Boolean);

              return (
                <div
                  key={panel.id}
                  className={`skilltree-panel skilltree-panel-${panel.id}`}
                >
                  <div className="skilltree-panel-title">{panel.title}</div>
                  <div
                    className="skilltree-panel-canvas"
                    style={{ width: geo.width, height: geo.height }}
                  >
                    <svg
                      className="skilltree-connectors"
                      width={geo.width}
                      height={geo.height}
                      viewBox={`0 0 ${geo.width} ${geo.height}`}
                      aria-hidden
                    >
                      {connectors.map(con => con && (
                        <line
                          key={con.id}
                          x1={con.p.cx} y1={con.p.cy}
                          x2={con.c.cx} y2={con.c.cy}
                          className={
                            'skilltree-connector ' +
                            (con.bothUnlocked ? 'unlocked ' : '') +
                            (con.parentOnly ? 'unlockable' : '')
                          }
                        />
                      ))}
                    </svg>
                    {panel.nodes.map(node => {
                      const { cx, cy } = nodeCenter(node, geo.minCol);
                      const isUnlocked = unlockedSet.has(node.id);
                      const blocker = mutexBlocker(node);
                      const parentLocked = !parentIsUnlocked(node);
                      const canUnlock = !isUnlocked && !blocker && !parentLocked && !node.alwaysUnlocked && canAfford(node.cost);
                      const classes = [
                        'skilltree-node',
                        `skilltree-node-kind-${node.kind}`,
                        isUnlocked ? 'unlocked' : '',
                        canUnlock ? 'affordable' : '',
                        parentLocked ? 'parent-locked' : '',
                        blocker && !isUnlocked ? 'mutex-blocked' : '',
                        node.alwaysUnlocked ? 'always-on' : '',
                        selectedNodeId === node.id ? 'selected' : '',
                      ].filter(Boolean).join(' ');
                      return (
                        <button
                          key={node.id}
                          className={classes}
                          style={{
                            position: 'absolute',
                            left: cx - NODE_W / 2,
                            top: cy - NODE_H / 2,
                            width: NODE_W,
                            height: NODE_H,
                          }}
                          onClick={() => setSelectedNodeId(node.id)}
                        >
                          <span className="skilltree-node-label">{node.label}</span>
                          {node.kind === 'gate' && (
                            <span className="skilltree-node-slot">gate</span>
                          )}
                          {node.alwaysUnlocked && (
                            <span className="skilltree-node-slot">always on</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
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
              {selectedNode.kind === 'gate' && (
                <div className="skilltree-skill-preview">
                  <span className="skilltree-skill-desc">
                    Gate node — unlocking this grants access to the two leaves below but doesn't grant a skill on its own.
                  </span>
                </div>
              )}
              {costEntries(selectedNode.cost).length > 0 && (
                <div className="skilltree-detail-reqs">
                  {costEntries(selectedNode.cost).map(([essId, needed]) => {
                    const ownedAmt = materials[essId] ?? 0;
                    const ess = ESSENCES[essId];
                    return (
                      <div key={essId} className="skilltree-detail-req">
                        <span><GameIcon id={ess?.icon} size={14} /> {essenceLabel(essId)}</span>
                        <span className={ownedAmt >= needed ? 'req-met' : 'req-unmet'}>{ownedAmt}/{needed}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              {(() => {
                const blocker = mutexBlocker(selectedNode);
                if (selectedNode.alwaysUnlocked) {
                  return <button className="skilltree-unlock-btn" disabled>Always unlocked</button>;
                }
                if (unlockedSet.has(selectedNode.id)) {
                  return <button className="skilltree-unlock-btn" disabled>Already unlocked</button>;
                }
                if (blocker) {
                  return <button className="skilltree-unlock-btn" disabled>Blocked by "{blocker.label}" — reset to switch</button>;
                }
                if (!parentIsUnlocked(selectedNode)) {
                  return <button className="skilltree-unlock-btn" disabled>Prerequisite locked</button>;
                }
                if (!canAfford(selectedNode.cost)) {
                  return <button className="skilltree-unlock-btn" disabled>Not enough essences</button>;
                }
                return <button className="skilltree-unlock-btn" onClick={handleUnlock}>Unlock</button>;
              })()}
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
