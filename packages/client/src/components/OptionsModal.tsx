import { useState } from 'react';
import { GameIcon } from './icons';
import { haptic, areHapticsEnabled, setHapticsEnabled } from '../utils/haptics';
import { isSoundEnabled, setSoundEnabled } from '../utils/audio-settings';
import './OptionsModal.css';

interface OptionsModalProps {
  onClose: () => void;
}

interface ToggleRowProps {
  icon: string;
  label: string;
  checked: boolean;
  onToggle: () => void;
}

function ToggleRow({ icon, label, checked, onToggle }: ToggleRowProps) {
  return (
    <button
      type="button"
      className="opt-row"
      onClick={onToggle}
      aria-pressed={checked}
    >
      <span className="opt-row-label">
        <GameIcon id={icon} size={18} />
        <span>{label}</span>
      </span>
      <span className={`opt-toggle ${checked ? 'opt-toggle--on' : ''}`}>
        <span className="opt-toggle-thumb" />
      </span>
    </button>
  );
}

export function OptionsModal({ onClose }: OptionsModalProps) {
  const [sound, setSound] = useState(isSoundEnabled());
  const [haptics, setHaptics] = useState(areHapticsEnabled());

  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    setSoundEnabled(next);
    haptic.tap();
  };

  const toggleHaptics = () => {
    const next = !haptics;
    setHaptics(next);
    setHapticsEnabled(next);
    if (next) haptic.tap();
  };

  return (
    <div className="opt-overlay" onClick={onClose}>
      <div className="opt-modal" onClick={e => e.stopPropagation()}>
        <button className="opt-close" onClick={onClose} aria-label="Close">
          <GameIcon id="close" size={18} />
        </button>
        <div className="opt-header">
          <h3 className="opt-title">Options</h3>
        </div>
        <div className="opt-list">
          <ToggleRow icon="music" label="Sound" checked={sound} onToggle={toggleSound} />
          <ToggleRow icon="vibrate" label="Haptics" checked={haptics} onToggle={toggleHaptics} />
        </div>
      </div>
    </div>
  );
}
