import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import BackToPortal from './BackToPortal';

const EditorialDisclosure: React.FC = () => (
  <>
    <Helmet>
      <title>Editorial Standards & Advertising Disclosure - DoStrike</title>
      <meta
        name="description"
        content="How DoStrike publishes games and strategy content, how we use advertising (Google AdSense), and how editorial independence applies across our portal."
      />
      <link rel="canonical" href="https://dostrike.com/editorial" />
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
      <BackToPortal />
      <h1 style={{ color: 'var(--primary)', fontSize: '2em', marginBottom: '0.75em', fontWeight: 700 }}>
        Editorial Standards & Advertising Disclosure
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95em', marginBottom: '2em' }}>
        Last updated: May 1, 2026 · Publisher: DoStrike Gaming Portal (Australia)
      </p>

      <h2 style={{ color: 'var(--secondary)', fontSize: '1.25em', margin: '1.5em 0 0.5em', fontWeight: 600 }}>
        Who we are
      </h2>
      <p style={{ lineHeight: 1.7 }}>
        DoStrike Gaming Portal (<strong>dostrike.com</strong>) publishes browser-based classic games—currently{' '}
        <Link to="/tictactoe-setup" style={{ color: 'var(--primary)' }}>
          Tic-Tac-Toe
        </Link>
        ,{' '}
        <Link to="/connect4-setup" style={{ color: 'var(--primary)' }}>
          Connect 4
        </Link>
        , and{' '}
        <Link to="/memory" style={{ color: 'var(--primary)' }}>
          Memory
        </Link>
        —alongside original strategy articles on our{' '}
        <Link to="/blog" style={{ color: 'var(--primary)' }}>
          blog
        </Link>
        . Our goal is practical learning: clear rules, honest tactics, and respectful user experience.
      </p>

      <h2 style={{ color: 'var(--secondary)', fontSize: '1.25em', margin: '1.5em 0 0.5em', fontWeight: 600 }}>
        Editorial approach
      </h2>
      <ul style={{ marginLeft: '1.5em', lineHeight: 1.7 }}>
        <li>
          <strong>Original writing:</strong> Blog posts are written for DoStrike readers. We do not copy other
          sites, and we do not accept payment to change game recommendations or editorial conclusions.
        </li>
        <li>
          <strong>Accuracy:</strong> Game rules and strategy notes are kept aligned with the playable versions on
          this site. When we correct a material error, we update the article and refresh the visible &quot;last
          updated&quot; context on that page where applicable.
        </li>
        <li>
          <strong>Transparency:</strong> If a page is primarily educational (how-to-play, strategy), we label it
          clearly. Game pages are for play; policy pages explain data and ads.
        </li>
      </ul>

      <h2 style={{ color: 'var(--secondary)', fontSize: '1.25em', margin: '1.5em 0 0.5em', fontWeight: 600 }}>
        Advertising (Google AdSense)
      </h2>
      <p style={{ lineHeight: 1.7 }}>
        We may display ads through{' '}
        <a href="https://www.google.com/adsense/start/" target="_blank" rel="noopener noreferrer">
          Google AdSense
        </a>
        . AdSense and its partners may use cookies or similar technologies to measure performance and personalize
        ads where allowed. You can review our{' '}
        <Link to="/privacy" style={{ color: 'var(--primary)' }}>
          Privacy Policy
        </Link>
        ,{' '}
        <Link to="/cookies" style={{ color: 'var(--primary)' }}>
          Cookie Policy
        </Link>
        , and Google&apos;s ad &amp; privacy resources linked from those pages.
      </p>
      <p style={{ lineHeight: 1.7 }}>
        <strong>Your choice:</strong> When you first visit, you can accept or decline non-essential cookies through
        our banner. We also use consent-related signals consistent with Google&apos;s requirements for ad serving.
        Declining personalization may result in fewer tailored ads, but core site playability should remain available.
      </p>

      <h2 style={{ color: 'var(--secondary)', fontSize: '1.25em', margin: '1.5em 0 0.5em', fontWeight: 600 }}>
        Separating editorial and ads
      </h2>
      <p style={{ lineHeight: 1.7 }}>
        Editorial content is not written to mimic ads, and ads are not styled to look like part of our articles. We
        avoid layouts that encourage accidental clicks. Sponsored or paid placements are not used on DoStrike at this
        time; if that ever changes, affected pages will be labeled clearly at the top of the content.
      </p>

      <h2 style={{ color: 'var(--secondary)', fontSize: '1.25em', margin: '1.5em 0 0.5em', fontWeight: 600 }}>
        Contact & corrections
      </h2>
      <p style={{ lineHeight: 1.7 }}>
        Questions about this disclosure, editorial concerns, or correction requests: use our{' '}
        <Link to="/contact" style={{ color: 'var(--primary)' }}>
          Contact
        </Link>{' '}
        page or email{' '}
        <a href="mailto:dostrike0@gmail.com" style={{ color: 'var(--primary)' }}>
          dostrike0@gmail.com
        </a>
        .
      </p>

      <p style={{ marginTop: '2em', fontSize: '0.95em', color: 'var(--text-muted)', lineHeight: 1.6 }}>
        Related:{' '}
        <Link to="/terms" style={{ color: 'var(--primary)' }}>
          Terms of Service
        </Link>{' '}
        ·{' '}
        <Link to="/about" style={{ color: 'var(--primary)' }}>
          About
        </Link>
      </p>
    </div>
  </>
);

export default EditorialDisclosure;
