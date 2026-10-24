import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { articles } from "../data/articles";
export default function Blog() {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const categories = ["All", "Tic-Tac-Toe", "Connect 4", "Memory"];
  const filtered = articles.filter(
    (a) =>
      (category === "All" ||
        (category === "Connect 4"
          ? a.slug.includes("connect4")
          : category === "Memory"
            ? a.slug.includes("memory")
            : a.slug.includes("tic-tac-toe"))) &&
      `${a.title} ${a.excerpt} ${a.content}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  return (
    <main className="guides-page">
      <Helmet>
        <title>DoStrike Blog - Game Strategy, Guides, and Tutorials</title>
        <meta
          name="description"
          content="Read original strategy guides and practical tutorials for Tic-Tac-Toe, Connect 4, and Memory Game on DoStrike Gaming Portal."
        />
        <link rel="canonical" href="https://dostrike.com/blog" />
      </Helmet>
      <header className="page-intro">
        <p className="eyebrow">MAKE THE NEXT ROUND YOURS</p>
        <h1>A better move starts here.</h1>
        <p>
          Practical guides for the games you play. Learn a pattern, try it on a
          board, then come back stronger.
        </p>
      </header>
      <section className="guide-filters" aria-label="Find a guide">
        <label>
          Search the guides
          <input
            type="search"
            placeholder="Try forks, openings or memory…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div
          className="guide-categories"
          role="group"
          aria-label="Filter by game"
        >
          {categories.map((c) => (
            <button
              key={c}
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </section>
      <p className="guide-count" role="status">
        {filtered.length} {filtered.length === 1 ? "guide" : "guides"}
        {query.trim() ? ` matching “${query.trim()}”` : " to explore"}
      </p>
      <div className="guide-grid">
        {filtered.map((a, index) => (
          <article className="guide-card" key={a.slug}>
            <Link to={`/blog/${a.slug}`}>
              <div
                className={`guide-card-art guide-art-${index % 3}`}
                aria-hidden="true"
              >
                <span>
                  {a.slug.includes("memory")
                    ? "✦"
                    : a.slug.includes("connect4")
                      ? "● ● ● ○"
                      : "× ○"}
                </span>
              </div>
              <div className="guide-card-copy">
                <p className="eyebrow">
                  {a.category} <span>· {a.readTime}</span>
                </p>
                <h2>{a.title}</h2>
                <p>{a.excerpt}</p>
                <strong>Read the guide →</strong>
              </div>
            </Link>
          </article>
        ))}
      </div>
      {filtered.length === 0 && (
        <section className="guide-empty">
          <h2>No guides found.</h2>
          <p>Try a game name or a shorter search.</p>
          <button
            className="ds-button"
            onClick={() => {
              setQuery("");
              setCategory("All");
            }}
          >
            Clear filters
          </button>
        </section>
      )}
      <aside className="guide-practice">
        <div>
          <p className="eyebrow">PUT THE IDEA INTO PLAY</p>
          <h2>Reading is the first move.</h2>
          <p>
            Try a short strategy puzzle with an explanation for every answer.
          </p>
        </div>
        <Link className="ds-button ds-button-primary" to="/practice">
          Practice a pattern ↗
        </Link>
      </aside>
    </main>
  );
}
