import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, textAlign: 'center', color: '#eef1f6', background: '#1a1d23', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Algo salio mal</h1>
          <p style={{ color: '#9aa3b2' }}>{this.state.error.message}</p>
          <button onClick={() => { this.setState({ error: null }); window.location.reload(); }}
            style={{ padding: '10px 24px', background: '#3498db', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
