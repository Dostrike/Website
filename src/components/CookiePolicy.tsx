import React from 'react';
import { Helmet } from 'react-helmet-async';
import BackToPortal from './BackToPortal';

const CookiePolicy: React.FC = () => (
  <>
    <Helmet>
      <title>Cookie Policy - DoStrike Gaming Portal</title>
      <meta name="description" content="Learn how DoStrike Gaming Portal uses cookies, including for Google AdSense and analytics. Manage your cookie preferences here." />
      <link rel="canonical" href="https://dostrike.com/cookies" />
    </Helmet>
    <div className="container" style={{ maxWidth: 800, margin: '40px auto', background: 'var(--surface)', color: 'var(--text)', padding: '32px 24px', boxShadow: '0 4px 16px rgba(30,136,229,0.07)', borderRadius: 10 }}>
      <BackToPortal />
      <h1 style={{ color: 'var(--primary)', fontSize: '2em', marginBottom: '1em', fontWeight: 700 }}>Cookie Policy</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95em', marginBottom: '2em' }}>Last updated: May 3, 2026</p>
      <h2 style={{ color: 'var(--secondary)', fontSize: '1.2em', margin: '1.5em 0 0.5em 0', fontWeight: 600 }}>What Are Cookies?</h2>
      <p>Cookies are small text files stored on your device by your browser. They help websites remember your preferences, improve your experience, and provide analytics and advertising.</p>
      <h2 style={{ color: 'var(--secondary)', fontSize: '1.2em', margin: '1.5em 0 0.5em 0', fontWeight: 600 }}>How We Use Cookies</h2>
      <ul style={{ marginLeft: '1.5em', marginBottom: '1em' }}>
        <li>To remember your preferences and settings</li>
        <li>To analyze site traffic and usage</li>
        <li>To display personalized ads via Google AdSense</li>
      </ul>
      <h2 style={{ color: 'var(--secondary)', fontSize: '1.2em', margin: '1.5em 0 0.5em 0', fontWeight: 600 }}>Third-Party Cookies</h2>
      <p>We use Google AdSense, which may set cookies to personalize ads and measure their effectiveness. These cookies are managed by Google and subject to their privacy policies.</p>
      <h2 style={{ color: 'var(--secondary)', fontSize: '1.2em', margin: '1.5em 0 0.5em 0', fontWeight: 600 }}>Managing Cookies</h2>
      <p>You can control or delete cookies through your browser settings. Most browsers allow you to block or delete cookies, but this may affect your experience on our site.</p>
      <h2 style={{ color: 'var(--secondary)', fontSize: '1.2em', margin: '1.5em 0 0.5em 0', fontWeight: 600 }}>More Information</h2>
      <p>For more details about cookies and how to manage them, visit <a href="https://www.allaboutcookies.org/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>allaboutcookies.org</a>.</p>
      <p style={{ marginBottom: '1.5em', lineHeight: 1.7 }}>
        For how ads relate to editorial pages on DoStrike, see our{' '}
        <a href="/editorial" style={{ color: 'var(--primary)' }}>
          Editorial standards &amp; advertising disclosure
        </a>
        .
      </p>
      <h2 style={{ color: 'var(--secondary)', fontSize: '1.2em', margin: '1.5em 0 0.5em 0', fontWeight: 600 }}>Contact</h2>
      <p>If you have questions about our Cookie Policy, please <a href="/contact" style={{ color: 'var(--primary)' }}>contact us</a>.</p>
    </div>
  </>
);

export default CookiePolicy; 
