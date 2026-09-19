import React from 'react';

/**
 * Production-grade Error Boundary for React 19
 * Catches JavaScript errors anywhere in child component tree,
 * logs the error, and renders a resilient fallback UI instead of crashing the app.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            minHeight: '40vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '30px 20px',
            textAlign: 'center',
            backgroundColor: 'transparent',
            fontFamily: "'Poppins', sans-serif"
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: 'rgba(18, 185, 188, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              color: '#12B9BC',
              fontSize: '24px'
            }}
          >
            <i className="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#072E60', marginBottom: '8px' }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '420px', marginBottom: '20px' }}>
            We encountered an unexpected error while displaying this content. Please refresh the page to reload.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              padding: '10px 24px',
              backgroundColor: '#12B9BC',
              color: '#ffffff',
              border: 'none',
              borderRadius: '20px 0 20px 0',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(18, 185, 188, 0.3)'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
