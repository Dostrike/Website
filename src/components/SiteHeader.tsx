import { Link, useLocation } from "react-router-dom";

export default function SiteHeader() {
  const { pathname } = useLocation();
  if (pathname === "/") return null;
  return (
    <>
      <a className="skip-link" href="#page-content">
        Skip to content
      </a>
      <header className="site-header">
        <Link className="site-brand" to="/" aria-label="DoStrike home">
          <span aria-hidden="true">d.</span>dostrike
        </Link>
        <nav aria-label="Main navigation">
          <Link to="/">Games</Link>
          <Link
            to="/practice"
            aria-current={pathname === "/practice" ? "page" : undefined}
          >
            Daily challenge
          </Link>
          <Link
            to="/blog"
            aria-current={pathname.startsWith("/blog") ? "page" : undefined}
          >
            Guides
          </Link>
        </nav>
        <Link className="site-header-help" to="/how-to-play">
          How to play ↗
        </Link>
      </header>
    </>
  );
}
