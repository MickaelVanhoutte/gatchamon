import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTutorial } from '../../hooks/useTutorial';
import './TutorialOverlay.css';

/** Which page each step expects */
const STEP_ROUTE: Record<number, string> = {
  1: '/',
  2: '/',
  3: '/',
  4: '/summon',
  5: '/summon',
  6: '/',
  7: '/',
};

const SPOTLIGHT_STEPS = new Set([2, 3, 4, 5, 7]);
const TOP_DIALOG_STEPS = new Set([2, 3, 7]);
const INTERACT_STEPS = new Set([2, 3, 4, 5, 7]);

interface SpotRect {
  top: number; left: number; width: number; height: number; borderRadius: string;
}

/**
 * Convert viewport rect to the .app container's local coordinate system.
 * Uses the bbox center to avoid corner-mapping issues with CSS rotation.
 */
function getAppLocalRect(el: HTMLElement): SpotRect | null {
  const appEl = document.querySelector<HTMLElement>('.app');
  if (!appEl) return null;

  const elRect = el.getBoundingClientRect();
  const style = getComputedStyle(appEl);
  const matrix = new DOMMatrix(style.transform);

  // Place a marker at app-local (0,0) to find the viewport origin
  const marker = document.createElement('div');
  marker.style.cssText = 'position:absolute;top:0;left:0;width:0;height:0;pointer-events:none';
  appEl.appendChild(marker);
  const originRect = marker.getBoundingClientRect();
  appEl.removeChild(marker);

  const inv = matrix.inverse();

  // Use bbox CENTER — after rotation the bbox top-left maps to a different corner
  const cx = elRect.left + elRect.width / 2 - originRect.left;
  const cy = elRect.top + elRect.height / 2 - originRect.top;
  const localCX = inv.a * cx + inv.c * cy;
  const localCY = inv.b * cx + inv.d * cy;
  const localW = Math.abs(inv.a * elRect.width + inv.c * elRect.height);
  const localH = Math.abs(inv.b * elRect.width + inv.d * elRect.height);

  return {
    top: localCY - localH / 2,
    left: localCX - localW / 2,
    width: localW,
    height: localH,
    borderRadius: getComputedStyle(el).borderRadius,
  };
}

export function TutorialOverlay() {
  const { step, isActive, advanceStep, completeTutorial, dialogLines, highlightTarget } = useTutorial();
  const location = useLocation();
  const navigate = useNavigate();
  const [lineIndex, setLineIndex] = useState(0);
  const [spot, setSpot] = useState<SpotRect | null>(null);
  const prevStep = useRef(step);

  // Reset line index when step changes
  useEffect(() => {
    if (step !== prevStep.current) {
      setLineIndex(0);
      setSpot(null);
      prevStep.current = step;
    }
  }, [step]);

  // Step 6: auto-navigate home and advance
  useEffect(() => {
    if (step === 6) {
      navigate('/');
      const t = setTimeout(() => advanceStep(), 300);
      return () => clearTimeout(t);
    }
  }, [step, navigate, advanceStep]);

  // Step 8: tutorial done
  useEffect(() => {
    if (step === 8) {
      completeTutorial();
    }
  }, [step, completeTutorial]);

  // Redirect to correct page if on wrong page mid-tutorial
  useEffect(() => {
    if (!isActive) return;
    const expected = STEP_ROUTE[step];
    if (expected && location.pathname !== expected) {
      navigate(expected);
    }
  }, [step, isActive, location.pathname, navigate]);

  // Position spotlight over target element
  useEffect(() => {
    if (!isActive || !highlightTarget || !SPOTLIGHT_STEPS.has(step)) {
      setSpot(null);
      return;
    }

    let prev: string | null = null;
    const update = () => {
      const el = document.querySelector<HTMLElement>(`[data-tutorial-id="${highlightTarget}"]`);
      if (el) {
        const rect = getAppLocalRect(el);
        const key = rect ? `${rect.top},${rect.left},${rect.width},${rect.height}` : null;
        if (key !== prev) { prev = key; setSpot(rect); }
      } else if (prev !== null) {
        prev = null;
        setSpot(null);
      }
    };

    update();
    const t1 = setTimeout(update, 200);
    const t2 = setTimeout(update, 500);

    // Poll for element removal (e.g. summon button disappearing during animation)
    const interval = setInterval(update, 600);

    return () => { clearTimeout(t1); clearTimeout(t2); clearInterval(interval); };
  }, [step, isActive, highlightTarget]);

  const handleDialogTap = useCallback(() => {
    if (lineIndex < dialogLines.length - 1) {
      setLineIndex(i => i + 1);
    } else if (!INTERACT_STEPS.has(step)) {
      advanceStep();
    }
  }, [step, lineIndex, dialogLines.length, advanceStep]);

  if (!isActive) return null;

  const hasSpotlight = spot && SPOTLIGHT_STEPS.has(step);
  const hasDialog = dialogLines.length > 0;
  // During interact steps, if the target element has unmounted (spot is null),
  // don't block the screen — the user needs to interact with other UI (e.g. OK button)
  const targetGone = !spot && INTERACT_STEPS.has(step) && SPOTLIGHT_STEPS.has(step);
  const pad = 6;

  // Spotlight cutout bounds
  const cutTop = spot ? spot.top - pad : 0;
  const cutLeft = spot ? spot.left - pad : 0;
  const cutW = spot ? spot.width + pad * 2 : 0;
  const cutH = spot ? spot.height + pad * 2 : 0;

  return (
    <>
      {/* Dark overlay — skip when target unmounted during interact step */}
      {!targetGone && (
        <div className="tutorial-overlay">
          {hasSpotlight ? (
            <>
              <div className="tutorial-overlay-bg" style={{ top: 0, left: 0, right: 0, height: cutTop }} />
              <div className="tutorial-overlay-bg" style={{ top: cutTop + cutH, left: 0, right: 0, bottom: 0 }} />
              <div className="tutorial-overlay-bg" style={{ top: cutTop, left: 0, width: cutLeft, height: cutH }} />
              <div className="tutorial-overlay-bg" style={{ top: cutTop, left: cutLeft + cutW, right: 0, height: cutH }} />
            </>
          ) : (
            <div className="tutorial-overlay-bg" />
          )}
        </div>
      )}

      {/* Ring rendered OUTSIDE overlay so its z-index is above .tutorial-target (205) */}
      {hasSpotlight && (
        <div
          className="tutorial-spotlight-ring"
          style={{
            top: cutTop - 4, left: cutLeft - 4,
            width: cutW + 8, height: cutH + 8,
            borderRadius: spot?.borderRadius ?? '16px',
          }}
        />
      )}

      {/* Professor dialog — passthrough clicks when user must interact with the page */}
      {hasDialog && (
        <div
          className={`tutorial-dialog ${TOP_DIALOG_STEPS.has(step) ? 'tutorial-dialog--top' : ''}`}
          style={INTERACT_STEPS.has(step) && lineIndex >= dialogLines.length - 1 ? { pointerEvents: 'none' } : undefined}
          onClick={handleDialogTap}
        >
          <div className="professor-avatar">
            <span role="img" aria-label="Professor">👨‍🔬</span>
          </div>
          <div className="speech-bubble">
            <p className="speech-bubble-text">{dialogLines[lineIndex]}</p>
            {lineIndex < dialogLines.length - 1 ? (
              <span className="speech-bubble-tap">Tap to continue...</span>
            ) : !INTERACT_STEPS.has(step) ? (
              <span className="speech-bubble-tap">Tap to proceed</span>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
