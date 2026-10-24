import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main
      className="container reading-page"
      style={{ maxWidth: 800, margin: "40px auto", padding: 24 }}
    >
      <Helmet>
        <title>Page not found | DoStrike</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <h1>Page not found</h1>
      <p>
        This address does not match a game or guide. Choose a destination below
        to continue.
      </p>
      <p>
        <Link to="/">Play games</Link> ·{" "}
        <Link to="/blog">Read strategy guides</Link> ·{" "}
        <Link to="/contact">Report a broken link</Link>
      </p>
    </main>
  );
}
