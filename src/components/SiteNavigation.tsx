import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function SiteNavigation() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return <footer style={{ maxWidth: 1000, margin: '24px auto', padding: '20px 16px', lineHeight: 2 }}>
    <nav aria-label="Site navigation" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 20px' }}>
      <Link to="/">Games</Link><Link to="/practice">Strategy practice</Link><Link to="/blog">Guides</Link>
      <Link to="/about">About</Link><Link to="/contact">Contact</Link><Link to="/privacy">Privacy</Link>
      <Link to="/terms">Terms</Link><Link to="/cookies">Cookies</Link><Link to="/editorial">Editorial standards</Link>
      <button onClick={() => window.dispatchEvent(new Event('openCookiePreferences'))} style={{ background: 'none', border: 0, color: 'inherit', font: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}>Cookie preferences</button>
    </nav>
  </footer>;
}
