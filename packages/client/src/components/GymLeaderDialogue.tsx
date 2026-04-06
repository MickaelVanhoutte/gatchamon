import { useCallback } from 'react';
import { assetUrl } from '../utils/asset-url';
import './tutorial/TutorialOverlay.css';

interface GymLeaderDialogueProps {
  name: string;
  icon: string;
  dialogue: string;
  onComplete: () => void;
}

export function GymLeaderDialogue({ name, icon, dialogue, onComplete }: GymLeaderDialogueProps) {
  const handleTap = useCallback(() => {
    onComplete();
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.7)',
      }}
      onClick={handleTap}
    >
      <div
        className="tutorial-dialog"
        style={{
          position: 'relative',
          bottom: 'auto',
          left: 'auto',
          right: 'auto',
          maxWidth: '90%',
        }}
      >
        <div className="professor-avatar">
          <img src={assetUrl(`portraits/${icon}`)} alt={name} className="portrait-img" />
        </div>
        <div className="speech-bubble">
          <p style={{ fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
            {name}
          </p>
          <p className="speech-bubble-text">{dialogue}</p>
          <span className="speech-bubble-tap">Tap to battle...</span>
        </div>
      </div>
    </div>
  );
}
