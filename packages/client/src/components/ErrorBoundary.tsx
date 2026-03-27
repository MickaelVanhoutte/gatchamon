import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          padding: '2rem',
          textAlign: 'center',
          color: '#fff',
        }}>
          <h2>Something went wrong</h2>
          <p style={{ opacity: 0.7, marginBottom: '1rem' }}>
            The game encountered an error.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.hash = '#/';
              window.location.reload();
            }}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              background: '#3b82f6',
              color: '#fff',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            Reload Game
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
