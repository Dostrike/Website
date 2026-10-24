import { Component, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

class PageErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    return <main style={{ maxWidth: 720, margin: '40px auto', padding: 24 }} data-route-error>
      <h1>This page could not be opened</h1>
      <p>Your connection may have been interrupted, or a new version of the site may have just been published. Try loading the page again.</p>
      <button onClick={() => window.location.reload()}>Reload this page</button>
      <p><a href="/">Return to the games</a></p>
    </main>;
  }
}
export default function PageBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return <PageErrorBoundary key={pathname}>{children}</PageErrorBoundary>;
}
