import { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { useGameStore } from '../stores/gameStore';
import { getTemplate, WORLD_BOSS_CONFIG } from '@gatchamon/shared';
import type { WorldBossAttackResult, MissionReward } from '@gatchamon/shared';
import { assetUrl } from '../utils/asset-url';
import { GameIcon } from '../components/icons';
import { reportError } from '../utils/report-error';
import { haptic } from '../utils/haptics';
import './WorldBossResultPage.css';

type Phase = 'loading' | 'cinematic' | 'results' | 'error';

function rewardEntries(r: MissionReward): Array<{ label: string; value: string }> {
  const out: Array<{ label: string; value: string }> = [];
  if (r.regularPokeballs) out.push({ label: 'Poké Balls', value: `×${r.regularPokeballs}` });
  if (r.premiumPokeballs) out.push({ label: 'Premium Balls', value: `×${r.premiumPokeballs}` });
  if (r.legendaryPokeballs) out.push({ label: 'Legendary Balls', value: `×${r.legendaryPokeballs}` });
  if (r.glowingPokeballs) out.push({ label: 'Glowing Balls', value: `×${r.glowingPokeballs}` });
  if (r.stardust) out.push({ label: 'Stardust', value: `+${r.stardust.toLocaleString()}` });
  if (r.pokedollars) out.push({ label: 'Pokédollars', value: `+${r.pokedollars.toLocaleString()}` });
  if (r.essences) {
    for (const [k, v] of Object.entries(r.essences)) {
      out.push({ label: k.replace('_', ' '), value: `×${v}` });
    }
  }
  return out;
}

export function WorldBossResultPage() {
  const navigate = useNavigate();
  const { collection, attackWorldBoss } = useGameStore();
  const [phase, setPhase] = useState<Phase>('loading');
  const [result, setResult] = useState<WorldBossAttackResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [displayDamage, setDisplayDamage] = useState(0);

  const stageRef = useRef<HTMLDivElement>(null);
  const bossRef = useRef<HTMLImageElement>(null);
  const monsListRef = useRef<HTMLDivElement>(null);

  const bossTemplate = useMemo(() => getTemplate(WORLD_BOSS_CONFIG.templateId), []);

  const pickedIds = useMemo<string[]>(() => {
    try {
      const raw = sessionStorage.getItem('wb_picked_team');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }, []);

  const pickedOwned = useMemo(
    () => pickedIds.map(id => collection.find(m => m.instance.instanceId === id)).filter(Boolean),
    [pickedIds, collection],
  );

  // Kick off the attack on mount.
  useEffect(() => {
    if (pickedIds.length !== WORLD_BOSS_CONFIG.teamSize) {
      setError(`Team was incomplete. Please pick ${WORLD_BOSS_CONFIG.teamSize} monsters again.`);
      setPhase('error');
      return;
    }
    attackWorldBoss(pickedIds).then(r => {
      setResult(r);
      setPhase('cinematic');
    }).catch(err => {
      reportError('WorldBossResultPage.attack', err);
      setError(err?.message ?? 'Attack failed');
      setPhase('error');
    });
  }, []);

  // Run the cinematic once we have the result.
  useEffect(() => {
    if (phase !== 'cinematic' || !result) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          haptic.tap();
          setPhase('results');
        },
      });
      // Boss pops in
      tl.from(bossRef.current, { scale: 0, opacity: 0, duration: 0.5, ease: 'back.out(1.8)' });
      // Mons stagger-slide in from bottom
      const monCards = monsListRef.current?.querySelectorAll('.wb-result-mon');
      if (monCards && monCards.length) {
        tl.from(monCards, { y: 60, opacity: 0, duration: 0.35, stagger: 0.025, ease: 'power2.out' }, '<0.2');
      }
      // Boss shakes repeatedly
      tl.to(bossRef.current, { x: -6, duration: 0.06, yoyo: true, repeat: 7, ease: 'power1.inOut' });
      // Count-up damage
      tl.to({ n: 0 }, {
        n: result.damageDealt,
        duration: 1.2,
        ease: 'power2.out',
        onUpdate: function() {
          setDisplayDamage(Math.floor((this.targets()[0] as any).n));
        },
      }, '<0.1');
      // Boss flashes if killed
      if (result.killedBoss) {
        tl.to(bossRef.current, { filter: 'brightness(3)', duration: 0.2 });
        tl.to(bossRef.current, { filter: 'brightness(1)', duration: 0.2 });
        tl.to(bossRef.current, { opacity: 0.3, duration: 0.8, ease: 'power2.in' });
      }
      tl.to({}, { duration: 0.3 });
    }, stageRef);
    return () => ctx.revert();
  }, [phase, result]);

  if (phase === 'error') {
    return (
      <div className="page wb-result-page">
        <div className="wb-result-error">
          <h2>Attack failed</h2>
          <p>{error}</p>
          <button className="wb-return-btn" onClick={() => navigate('/world-boss')}>Back</button>
        </div>
      </div>
    );
  }

  if (phase === 'loading' || !result) {
    return (
      <div className="page wb-result-page">
        <div className="wb-result-stage" ref={stageRef}>
          <p className="wb-result-status">Charging attack…</p>
        </div>
      </div>
    );
  }

  const hpBeforePct = result.hpBefore > 0 ? (result.hpAfter / result.hpBefore) * 100 : 0;

  return (
    <div className="page wb-result-page">
      <div className="wb-result-stage" ref={stageRef}>
        {phase === 'cinematic' && (
          <>
            <div className="wb-result-boss-wrap">
              <img
                ref={bossRef}
                src={assetUrl(bossTemplate?.spriteUrl ?? 'monsters/ani/eternatus.gif')}
                alt="Eternatus"
                className="wb-result-boss"
              />
            </div>
            <div className="wb-result-damage-counter">
              -{displayDamage.toLocaleString()}
            </div>
            <div className="wb-result-hp-ministrip">
              <div className="wb-result-hp-fill" style={{ width: `${Math.max(0, Math.min(100, hpBeforePct))}%` }} />
            </div>
            <div className="wb-result-mons" ref={monsListRef}>
              {pickedOwned.map(m => (
                <div key={m!.instance.instanceId} className="wb-result-mon">
                  <img
                    src={assetUrl(m!.instance.isShiny
                      ? `monsters/ani-shiny/${m!.template.name.toLowerCase()}.gif`
                      : m!.template.spriteUrl,
                    )}
                    alt={m!.template.name}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {phase === 'results' && (
          <div className="wb-result-summary">
            {result.killedBoss && <div className="wb-kill-badge">ETERNATUS HAS FALLEN</div>}
            <div className="wb-result-headline">
              Dealt <span className="wb-result-damage-big">{result.damageDealt.toLocaleString()}</span>
              <span className="wb-result-damage-label"> damage</span>
            </div>
            <div className="wb-result-rank">
              Rank <b>#{result.rank}</b> · Total dealt this week: <b>{result.totalDamage.toLocaleString()}</b>
            </div>

            <div className="wb-result-reward-block">
              <h3>Instant drop</h3>
              <div className="wb-result-reward-grid">
                {rewardEntries(result.instantReward).map((e, i) => (
                  <div key={i} className="wb-result-reward-pill">
                    <GameIcon id="gift" size={14} />
                    <span>{e.value}</span>
                    <span className="wb-reward-label">{e.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {result.killedBoss && (
              <p className="wb-result-killed-msg">
                Final tier rewards will be delivered to your Inbox momentarily.
              </p>
            )}

            <button className="wb-return-btn" onClick={() => navigate('/world-boss')}>Return</button>
          </div>
        )}
      </div>
    </div>
  );
}
