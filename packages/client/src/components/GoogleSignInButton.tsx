import { useEffect, useRef } from 'react';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

interface Props {
  onToken: (idToken: string) => void;
}

export function GoogleSignInButton({ onToken }: Props) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || !buttonRef.current) return;

    function setup() {
      if (!window.google || !buttonRef.current) return;
      initialized.current = true;
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (response) => onToken(response.credential),
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme: 'filled_blue',
        size: 'large',
        text: 'signin_with',
        shape: 'pill',
        width: 280,
      });
    }

    // Google script may already be loaded
    if (window.google) {
      setup();
    } else {
      // Wait for the script to load
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval);
          setup();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [onToken]);

  return <div ref={buttonRef} />;
}
