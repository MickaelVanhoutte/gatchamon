import { useState } from 'react';
import type { SkillDefinition } from '@gatchamon/shared';
import { SkillCard } from './SkillCard';
import './PassiveChoiceModal.css';

interface Props {
  originalPassive: SkillDefinition;
  alternatePassive: SkillDefinition;
  currentSelection: 0 | 1;
  skillLevel: number;
  onConfirm: (selected: 0 | 1) => void;
  onClose: () => void;
}

export function PassiveChoiceModal({ originalPassive, alternatePassive, currentSelection, skillLevel, onConfirm, onClose }: Props) {
  const [selected, setSelected] = useState<0 | 1>(currentSelection);
  const [loading, setLoading] = useState(false);

  const handleConfirm = () => {
    if (selected === currentSelection) {
      onClose();
      return;
    }
    setLoading(true);
    onConfirm(selected);
  };

  return (
    <div className="pcm-overlay" onClick={onClose}>
      <div className="pcm-modal" onClick={e => e.stopPropagation()}>
        <button className="pcm-close" onClick={onClose}>&times;</button>
        <div className="pcm-title">Choose Passive Ability</div>

        <div
          className={`pcm-option ${selected === 0 ? 'pcm-option--active' : ''}`}
          onClick={() => setSelected(0)}
        >
          <SkillCard skill={originalPassive} index={3} skillLevel={skillLevel} isAbility />
        </div>

        <div
          className={`pcm-option ${selected === 1 ? 'pcm-option--active' : ''}`}
          onClick={() => setSelected(1)}
        >
          <SkillCard skill={alternatePassive} index={3} skillLevel={skillLevel} isAbility />
        </div>

        <button
          className="pcm-confirm"
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? 'Switching...' : selected === currentSelection ? 'Close' : 'Confirm'}
        </button>
      </div>
    </div>
  );
}
