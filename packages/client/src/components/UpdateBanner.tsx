import { useEffect, useState } from 'react';
import { onUpdateAvailable } from '../services/sw-update';
import './UpdateBanner.css';

export function UpdateBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    onUpdateAvailable(() => {
      setVisible(true);
      setTimeout(() => setVisible(false), 3000);
    });
  }, []);

  if (!visible) return null;

  return (
    <div className="update-banner">
      An update is available, please restart the application to discover it!
    </div>
  );
}
