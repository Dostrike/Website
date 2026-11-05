import React from "react";
import { useParams, Link, Navigate, useLocation } from "react-router-dom";
import { getArticleBySlug, articles } from "../data/articles";
import { Helmet } from "react-helmet-async";
import BackToPortal from "./BackToPortal";
import NotFound from "./NotFound";
import { articleRedirects } from "../data/articleRedirects";
import GuideExercises from "./GuideExercises";
import { blockFitLessonRows } from "../data/blockFitLesson";
import "./BlockFitLesson.css";
import Connect4Lessons from './Connect4Lessons';

const ARTICLE_AUTHOR = "DoStrike Editorial Team";
const IMPLEMENTATION_REFERENCES: Record<string, string> = {
  'block-fit-piece-order-lines-and-combos': 'blockFitEngine',
  'chess-checks-promotion-and-draws': 'chessEngine',
  'sea-battle-hidden-fleets-and-search': 'seaBattleEngine',
  'dots-and-boxes-extra-turns-and-control': 'dotsAndBoxesEngine',
  'colour-sort-runs-space-and-recovery': 'colourSortEngine',
  'slide-merge-pairs-space-and-undo': 'slideMergeEngine',
  'minimax-algorithm-tic-tac-toe': 'gameLogic',
  'history-of-tic-tac-toe': 'practiceEngine',
  'mathematical-proof-tic-tac-toe-draw': 'practiceEngine',
  'future-tic-tac-toe-ai-vr-innovation': 'roundReview',
  'complete-tic-tac-toe-strategy-guide': 'practiceEngine',
  'tic-tac-toe-education-teaching-resource': 'practiceEngine',
  'connect4-strategy-blueprint': 'connect4Logic',
  'connect4-endgame-guide': 'connect4Logic',
  'minesweeper-safe-moves-flags-and-subsets': 'minesweeperEngine',
  'sudoku-candidates-singles-and-pencil-notes': 'sudokuEngine',
  'checkers-captures-kings-and-complete-jumps': 'checkersEngine',
  'mancala-extra-turns-captures-and-counting': 'mancalaEngine',
};

const Article: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const article = getArticleBySlug(slug || "");

  const destination = slug && Object.prototype.hasOwnProperty.call(articleRedirects, slug) ? articleRedirects[slug] : null;
  if (destination) return <Navigate replace to={`/blog/${destination}${location.search}${location.hash}`} />;
  if (!article) return <NotFound />;
  const url = `https://dostrike.com/blog/${article.slug}`;
  const implementationReference = IMPLEMENTATION_REFERENCES[article.slug];

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
                article.slug === "tic-tac-toe-tournaments-community-building" ? "/tictactoe-setup" : article.slug.includes("block-fit") ? "/block-fit-setup" : article.slug.includes("chess") ? "/chess-setup" : article.slug.includes("sea-battle") ? "/sea-battle-setup" : article.slug.includes("dots-and-boxes") ? "/dots-and-boxes-setup" : article.slug.includes("colour-sort") ? "/colour-sort-setup" : article.slug.includes("slide-merge") ? "/slide-merge-setup" : article.slug.includes("minesweeper") ? "/minesweeper-setup" : article.slug.includes("sudoku") ? "/sudoku-setup" : article.slug.includes("checkers") ? "/checkers-setup" : article.slug.includes("mancala")
                  ? "/mancala-setup"
                  : article.slug.includes("reversi")
                  ? "/reversi-setup"
                  : article.slug.includes("gomoku")
                  ? "/gomoku-setup"
                  : article.slug.includes("connect4")
                  ? "/connect4-setup"
                  : article.slug.includes("memory")
                    ? "/memory"
                    : "/practice"
              }
            >
              {article.slug === "tic-tac-toe-tournaments-community-building" ? "Set up local Tic-Tac-Toe" : article.slug.includes("block-fit") ? "Play Block Fit" : article.slug.includes("chess") ? "Play Chess" : article.slug.includes("sea-battle") ? "Play Sea Battle" : article.slug.includes("dots-and-boxes") ? "Play Dots and Boxes" : article.slug.includes("colour-sort") ? "Play Colour Sort" : article.slug.includes("slide-merge") ? "Play Slide Merge" : article.slug.includes("minesweeper") ? "Play Minesweeper" : article.slug.includes("sudoku") ? "Play Sudoku" : article.slug.includes("checkers") ? "Play Checkers" : article.slug.includes("mancala")
                ? "Play Mancala"
                : article.slug.includes("reversi")
                ? "Play Reversi"
                : article.slug.includes("gomoku")
                ? "Play Gomoku"
                : article.slug.includes("connect4")
                ? "Play Connect 4"
                : article.slug.includes("memory")
                  ? "Play Memory"
                  : "Practice wins, blocks and forks"}{" "}
              →
            </Link>
            {["complete-tic-tac-toe-strategy-guide", "tic-tac-toe-education-teaching-resource"].includes(article.slug) && <a href="#guide-exercises-title">Try the playable examples ↓</a>}
          </aside>

          {article.slug === "block-fit-piece-order-lines-and-combos" && <figure className="block-guide-figure"><table className="block-guide-board"><caption>Worked position · 73 points</caption><thead><tr><th scope="col">r/c</th>{Array.from({length:8},(_,i)=><th scope="col" key={i}>{i+1}</th>)}</tr></thead><tbody>{blockFitLessonRows.map((row,r)=><tr key={r}><th scope="row">{r+1}</th>{Array.from(row,(cell,c)=><td key={c} className={`${cell==='#'?'filled':''} ${r===4&&c===6?'lesson-anchor':''}`} aria-label={`row ${r+1} column ${c+1}: ${cell==='#'?'occupied':'empty'}`}>{cell==='#'?'#':'·'}</td>)}</tr>)}</tbody></table><figcaption># means occupied; · means empty. The outlined anchor is row5 column7. A square and a southeast elbow remain. The guide below compares their order; this is a checked reachable example, not an editable or imported game.</figcaption></figure>}
          {article.slug === 'connect4-strategy-blueprint' && <Connect4Lessons scope="strategy" />}
          {article.slug === 'connect4-endgame-guide' && <Connect4Lessons scope="endgame" />}
          <div
            className="article-copy"
            dangerouslySetInnerHTML={{ __html: formatContent(article.content) }}
            style={{ lineHeight: 1.7 }}
          />
          <GuideExercises key={article.slug} slug={article.slug} />
          {article.slug === "reversi-legal-moves-corners-and-passes" && (
            <p>
              Rules reference:{" "}
              <a href="https://worldothello.org/about/about-othello/othello-rules/official-rules/english">
                World Othello Federation playing rules
              </a>
              . DoStrike is an independent Reversi implementation.
            </p>
          )}
          {article.slug === "mancala-extra-turns-captures-and-counting" && <p>Rules reference: <a href="https://publikace.k.utb.cz/bitstream/handle/10563/1009973/Fulltext_1009973.pdf?sequence=1">Published Kalah rules, section 3.1</a>. This version requires a non-empty opposite pit for capture.</p>}
          {article.slug === "checkers-captures-kings-and-complete-jumps" && <p>Rules reference: <a href="https://wcdf.net/rules/rules_of_checkers_english.pdf">WCDF English draughts rules</a>. Automatic draw adjudication is described above.</p>}
          {article.slug === "sudoku-candidates-singles-and-pencil-notes" && <p>Classic rules reference: <a href="https://www.nikoli.co.jp/en/puzzles/sudoku/">Nikoli’s Sudoku rules</a>. DoStrike generates its own puzzles and does not reproduce Nikoli boards.</p>}
          {article.slug === "slide-merge-pairs-space-and-undo" && <p>Classic rules reference: <a href="https://github.com/gabrielecirulli/2048/blob/master/js/game_manager.js">Gabriele Cirulli’s original 2048 game manager</a>. DoStrike uses its own engine, artwork, seeded daily and assisted undo records.</p>}
          {article.slug === "minesweeper-safe-moves-flags-and-subsets" && <p>Rules and control reference: <a href="https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/mines.html">Simon Tatham’s Mines manual</a>. DoStrike has its own generator, proof checks and assisted recovery rules.</p>}
          {article.slug === "history-of-tic-tac-toe" && <p>Historical sources checked November 4, 2026: <a href="https://www.cl.cam.ac.uk/events/EDSAC99/simulators/india/examples.html">Cambridge EDSAC99 example-program catalogue</a>; <a href="https://www.cl.cam.ac.uk/relics/chron.html">Wheeler/Hartley historical chronology</a>. Modern experiments: <Link to="/blog/minimax-algorithm-tic-tac-toe">DoStrike’s AI policies</Link>, <Link to="/blog/mathematical-proof-tic-tac-toe-draw">exhaustive counts</Link> and <Link to="/blog/future-tic-tac-toe-ai-vr-innovation">reviewing your round</Link>.</p>}
          {article.slug === "tic-tac-toe-tournaments-community-building" && <p>Fixture and scoring checks: <a href="https://github.com/Dostrike/Website/blob/main/scripts/verify-community-event.mjs">DoStrike’s executable event example</a>. This is an optional house format, not a hosted tournament or an official event rulebook.</p>}
          {article.slug === "block-fit-piece-order-lines-and-combos" && <p>Worked-example evidence: <a href="https://github.com/Dostrike/Website/blob/main/scripts/fixtures/block-fit-piece-order.json">original reachable piece-order transcript</a> and <a href="https://github.com/Dostrike/Website/blob/main/scripts/verify-block-fit.mjs">independent coordinate/clear/score verifier</a>. The linked replay and separate coordinate evaluator check this guide’s board, legal anchors, clears and scores.</p>}
          {article.slug === "chess-checks-promotion-and-draws" && <p>Rules reference: <a href="https://handbook.fide.com/chapter/e012023">FIDE Laws of Chess</a>. Our casual automatic-draw policy differs from tournament claims. Legal moves use <a href="https://jhlywa.github.io/chess.js/">chess.js 1.4.0</a> under its <a href="/licenses/chess-js-1.4.0.txt">BSD-2-Clause notice</a>; DoStrike supplies the adapter, bounded opponent, interface and worked examples.</p>}
          {article.slug === "sea-battle-hidden-fleets-and-search" && <p>Rules reference: <a href="https://instructions.hasbro.com/api/download/A3264_en-us_Battleship-Classic-Board-Game-Strategy-Game.pdf">Hasbro A3264 instructions (Spanish/Portuguese file)</a>. DoStrike’s identity-on-sinking convention is explicit; its coordinate examples and search comparison use the original web engine and independent verifier.</p>}
          {article.slug === "dots-and-boxes-extra-turns-and-control" && <p>Rules reference: <a href="https://nrich.maths.org/games/put-yourself-box">Cambridge NRICH’s Put Yourself in a Box</a>. The control example is verified against DoStrike’s own rules engine and bounded search.</p>}
          {article.slug === "tic-tac-toe-variations" && <p>Ultimate routing reference checked November 4, 2026: <a href="https://mathwithbaddrawings.com/2013/06/16/ultimate-tic-tac-toe/">Ben Orlin’s Ultimate Tic-Tac-Toe account</a>. Other sections define the paper rules used here; the website’s playable game uses classic rules. Compare with <Link to="/blog/complete-tic-tac-toe-strategy-guide">solver-checked classic exercises</Link>.</p>}
          {article.slug.startsWith('connect4-') && <p>Classic rules: <a href="https://www.hasbro.com/common/documents/dad2614d1c4311ddbd0b0800200c9a66/DE3C8F8050569047F5AA9FBB9F16909B.pdf">Hasbro’s Connect 4 instructions</a>. Worked positions and outcome claims: <a href="https://github.com/Dostrike/Website/blob/main/src/data/connect4Lessons.json">original legal transcripts</a> and <a href="https://github.com/Dostrike/Website/blob/main/scripts/verify-connect4-guides.mjs">DoStrike’s independent example checks</a>. The small-ending analysis explains these examples; it is not a new analysis tool or a perfect-play claim for the game’s computer levels.</p>}
          {implementationReference && (
            <p>
              Implementation reference:{" "}
              <a
                href={`https://github.com/Dostrike/Website/blob/main/src/utils/${implementationReference}.ts`}
              >
                DoStrike implementation
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
