import React from 'react';
import { Helmet } from 'react-helmet-async';

const FAQ: React.FC = () => (
  <>
    <Helmet>
      <title>FAQ - DoStrike Gaming Portal</title>
      <meta
        name="description"
        content="Answers about DoStrike games (Tic-Tac-Toe, Connect 4, Memory), AI modes, privacy, ads, and how to contact us."
      />
      <link rel="canonical" href="https://dostrike.com/faq" />
    </Helmet>
    <div
      className="container"
      style={{
        maxWidth: 800,
        margin: '40px auto',
        background: 'var(--surface)',
        color: 'var(--text)',
        padding: '32px 24px',
        boxShadow: '0 4px 16px rgba(30,136,229,0.07)',
        borderRadius: 10,
      }}
    >
      <h1 style={{ color: 'var(--primary)', fontSize: '2em', marginBottom: '1em' }}>Frequently Asked Questions</h1>
      <p style={{ marginBottom: '2em', lineHeight: 1.6, color: 'var(--text-muted)' }}>
        Quick answers about DoStrike. For privacy, cookies, and how we use advertising, see our policy pages and{' '}
        <a href="/editorial" style={{ color: 'var(--primary)' }}>
          editorial &amp; ads disclosure
        </a>
        .
      </p>

      <div style={{ marginBottom: '1.5em' }}>
        <h2 style={{ color: 'var(--secondary)', fontSize: '1.2em' }}>What games can I play on DoStrike?</h2>
        <p style={{ lineHeight: 1.7 }}>
          You can play <strong>Tic-Tac-Toe</strong> (including private room style play), <strong>Connect 4</strong>{' '}
          with AI or two humans, and a <strong>Memory</strong> matching game with difficulty options. Start from the{' '}
          <a href="/" style={{ color: 'var(--primary)' }}>
            home portal
          </a>
          .
        </p>
      </div>

      <div style={{ marginBottom: '1.5em' }}>
        <h2 style={{ color: 'var(--secondary)', fontSize: '1.2em' }}>How do you win at Tic-Tac-Toe?</h2>
        <p style={{ lineHeight: 1.7 }}>
          Control the center when possible, block immediate threats, and learn to create <em>forks</em> (two ways to
          win at once). With perfect play the game draws; wins come when your opponent misses a threat. Our{' '}
          <a href="/blog" style={{ color: 'var(--primary)' }}>
            blog
          </a>{' '}
          has step-by-step strategy guides.
        </p>
      </div>

      <div style={{ marginBottom: '1.5em' }}>
        <h2 style={{ color: 'var(--secondary)', fontSize: '1.2em' }}>Any quick tips for Connect 4?</h2>
        <p style={{ lineHeight: 1.7 }}>
          Favor center columns, plan two moves ahead, and always check for immediate wins and blocks. Stronger play
          comes from building <em>supported</em> threats (lines you can actually reach). See our Connect 4 articles on
          the blog for a full blueprint and endgame checklist.
        </p>
      </div>

      <div style={{ marginBottom: '1.5em' }}>
        <h2 style={{ color: 'var(--secondary)', fontSize: '1.2em' }}>How can I improve at the Memory game?</h2>
        <p style={{ lineHeight: 1.7 }}>
          Use fixed board <em>zones</em>, scan in a steady order, and remember mismatch locations—not just symbols.
          Raise difficulty when your move count stabilizes. The blog includes a dedicated memory improvement guide.
        </p>
      </div>

      <div style={{ marginBottom: '1.5em' }}>
        <h2 style={{ color: 'var(--secondary)', fontSize: '1.2em' }}>Can I play against the computer?</h2>
        <p style={{ lineHeight: 1.7 }}>
          Yes. Tic-Tac-Toe and Connect 4 support AI opponents at different skill levels so you can practice tactics
          without a second person.
        </p>
      </div>

      <div style={{ marginBottom: '1.5em' }}>
        <h2 style={{ color: 'var(--secondary)', fontSize: '1.2em' }}>Is DoStrike free? Do I need an account?</h2>
        <p style={{ lineHeight: 1.7 }}>
          The site is free to use for casual play. You do not need an account for the main single-player and local
          two-player experiences described on the portal.
        </p>
      </div>

      <div style={{ marginBottom: '1.5em' }}>
        <h2 style={{ color: 'var(--secondary)', fontSize: '1.2em' }}>Does the site use ads or cookies?</h2>
        <p style={{ lineHeight: 1.7 }}>
          We may show ads through Google AdSense and use cookies as described in our{' '}
          <a href="/privacy" style={{ color: 'var(--primary)' }}>
            Privacy Policy
          </a>{' '}
          and{' '}
          <a href="/cookies" style={{ color: 'var(--primary)' }}>
            Cookie Policy
          </a>
          . You will see a banner to accept or decline non-essential cookies on your first visit. Details on editorial
          separation from ads are on the{' '}
          <a href="/editorial" style={{ color: 'var(--primary)' }}>
            disclosure page
          </a>
          .
        </p>
      </div>

      <div style={{ marginBottom: '1.5em' }}>
        <h2 style={{ color: 'var(--secondary)', fontSize: '1.2em' }}>Who writes the blog?</h2>
        <p style={{ lineHeight: 1.7 }}>
          Articles are published under the <strong>DoStrike Editorial Team</strong> label. Guides are written for this
          site and updated when gameplay or guidance changes materially.
        </p>
      </div>

      <div style={{ marginBottom: '1.5em' }}>
        <h2 style={{ color: 'var(--secondary)', fontSize: '1.2em' }}>How can I contact you?</h2>
        <p style={{ lineHeight: 1.7 }}>
          Use the{' '}
          <a href="/contact" style={{ color: 'var(--primary)' }}>
            Contact
          </a>{' '}
          page or email{' '}
          <a href="mailto:dostrike0@gmail.com" style={{ color: 'var(--primary)' }}>
            dostrike0@gmail.com
          </a>
          .
        </p>
      </div>
    </div>
  </>
);

export default FAQ;
