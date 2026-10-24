import React from "react";
import { useParams, Link } from "react-router-dom";
import { getArticleBySlug, articles } from "../data/articles";
import { Helmet } from "react-helmet-async";
import BackToPortal from "./BackToPortal";
import NotFound from "./NotFound";

const ARTICLE_AUTHOR = "DoStrike Editorial Team";

const Article: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = getArticleBySlug(slug || "");

  if (!article) return <NotFound />;
  const url = `https://dostrike.com/blog/${article.slug}`;

  // Convert markdown-like content to HTML
  const formatContent = (content: string) => {
    const inline = (text: string) =>
      text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    return content
      .trim()
      .split(/\n\s*\n/)
      .map((block) => {
        const lines = block.trim().split("\n");
        if (lines.every((line) => /^- /.test(line)))
          return `<ul>${lines.map((line) => `<li>${inline(line.slice(2))}</li>`).join("")}</ul>`;
        if (lines.every((line) => /^\d+\. /.test(line)))
          return `<ol>${lines.map((line) => `<li>${inline(line.replace(/^\d+\. /, ""))}</li>`).join("")}</ol>`;
        return lines
          .map((line) => {
            if (line.startsWith("### "))
              return `<h3>${inline(line.slice(4))}</h3>`;
            if (line.startsWith("## "))
              return `<h2>${inline(line.slice(3))}</h2>`;
            return `<p>${inline(line)}</p>`;
          })
          .join("");
      })
      .join("");
  };

  return (
    <>
      <Helmet>
        <title>{article.title} | DoStrike Blog</title>
        <meta name="description" content={article.excerpt} />
        <meta name="author" content={ARTICLE_AUTHOR} />
        <link rel="canonical" href={url} />
      </Helmet>
      <div
        className="container reading-page"
        style={{
          maxWidth: 800,
          margin: "40px auto",
          background: "var(--surface)",
          color: "var(--text)",
          padding: "32px 24px",
          boxShadow: "0 4px 16px rgba(30,136,229,0.07)",
          borderRadius: 10,
        }}
      >
        <BackToPortal />
        {/* Breadcrumb Navigation */}
        <nav
          style={{
            marginBottom: "2em",
            fontSize: "0.9em",
            color: "var(--text-muted)",
          }}
        >
          <Link
            to="/blog"
            style={{ color: "var(--primary)", textDecoration: "none" }}
          >
            Guides
          </Link>
          {" > "}
          <span style={{ color: "var(--text-muted)" }}>{article.category}</span>
        </nav>

        {/* Article Header */}
        <header style={{ marginBottom: "2em" }}>
          <h1
            style={{
              color: "var(--primary)",
              fontSize: "2.2em",
              marginBottom: "0.5em",
              fontWeight: 700,
              lineHeight: 1.3,
            }}
          >
            {article.title}
          </h1>
          <div
            style={{
              display: "flex",
              gap: "1em",
              alignItems: "center",
              marginBottom: "1em",
              fontSize: "0.9em",
              color: "var(--text-muted)",
            }}
          >
            <span>
              {new Date(article.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span>•</span>
            <span>{article.readTime}</span>
          </div>
          <div
            style={{
              display: "flex",
              gap: "1em",
              alignItems: "center",
              marginBottom: "1em",
              fontSize: "0.9em",
              color: "var(--text-muted)",
            }}
          >
            <span>By {ARTICLE_AUTHOR}</span>
            <span>•</span>
            <span>
              Last updated:{" "}
              {new Date(article.updated || article.date).toLocaleDateString(
                "en-US",
                { year: "numeric", month: "short", day: "numeric" },
              )}
            </span>
          </div>
          <p
            style={{
              fontSize: "1.1em",
              color: "var(--text)",
              lineHeight: 1.6,
              fontStyle: "italic",
            }}
          >
            {article.excerpt}
          </p>
        </header>

        {/* Article Content */}
        <article style={{ marginBottom: "3em" }}>
          <aside className="article-play">
            <strong>Try the idea on a board.</strong>
            <Link
              to={
                article.slug.includes("connect4")
                  ? "/connect4-setup"
                  : article.slug.includes("memory")
                    ? "/memory"
                    : "/practice"
              }
            >
              {article.slug.includes("connect4")
                ? "Play Connect 4"
                : article.slug.includes("memory")
                  ? "Play Memory"
                  : "Practice wins, blocks and forks"}{" "}
              →
            </Link>
          </aside>

          <div
            className="article-copy"
            dangerouslySetInnerHTML={{ __html: formatContent(article.content) }}
            style={{ lineHeight: 1.7 }}
          />
          {article.updated && (
            <p>
              Implementation reference:{" "}
              <a
                href={`https://github.com/Dostrike/Website/blob/main/src/utils/${article.slug === "mathematical-proof-tic-tac-toe-draw" ? "practiceEngine" : "gameLogic"}.ts`}
              >
                DoStrike Tic-Tac-Toe game logic
              </a>
              . <Link to="/contact">Report a correction</Link>.
            </p>
          )}
        </article>

        {/* Related Articles */}
        <section style={{ marginBottom: "3em" }}>
          <h2
            style={{
              color: "var(--secondary)",
              fontSize: "1.5em",
              marginBottom: "1em",
              fontWeight: 600,
            }}
          >
            Related Articles
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1em" }}>
            {articles
              .filter((a) => a.slug !== article.slug)
              .sort(
                (a, b) =>
                  Number(b.category === article.category) -
                  Number(a.category === article.category),
              )
              .slice(0, 3)
              .map((relatedArticle) => (
                <Link
                  key={relatedArticle.slug}
                  to={`/blog/${relatedArticle.slug}`}
                  style={{
                    display: "block",
                    padding: "1em",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    textDecoration: "none",
                    color: "inherit",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(30,136,229,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <h3
                    style={{
                      color: "var(--secondary)",
                      fontSize: "1.1em",
                      marginBottom: "0.5em",
                      fontWeight: 600,
                    }}
                  >
                    {relatedArticle.title}
                  </h3>
                  <p
                    style={{
                      color: "var(--text)",
                      fontSize: "0.9em",
                      marginBottom: "0.5em",
                      lineHeight: 1.5,
                    }}
                  >
                    {relatedArticle.excerpt}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "0.8em",
                      color: "var(--text-muted)",
                    }}
                  >
                    <span>{relatedArticle.category}</span>
                    <span>{relatedArticle.readTime}</span>
                  </div>
                </Link>
              ))}
          </div>
        </section>

        {/* Article Footer */}
        <footer
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: "2em",
            marginTop: "2em",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1em",
            }}
          >
            <Link
              to="/blog"
              style={{
                color: "var(--primary)",
                textDecoration: "none",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: "0.5em",
              }}
            >
              ← Back to Blog
            </Link>
            <div
              style={{
                display: "flex",
                gap: "1em",
                fontSize: "0.9em",
                color: "var(--text-muted)",
              }}
            >
              <span>Share:</span>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(url)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--primary)", textDecoration: "none" }}
              >
                Twitter
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--primary)", textDecoration: "none" }}
              >
                Facebook
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Article;
