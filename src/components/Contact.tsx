import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { FaPaperPlane } from 'react-icons/fa';
import BackToPortal from './BackToPortal';

/**
 * Netlify Forms: registered via hidden form in root index.html at build time.
 * Native POST is used instead of fetch so submissions are handled at the CDN edge
 * (fetch/AJAX often fails or mis-reports with SPA fallbacks).
 */
const Contact: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const sent = searchParams.get('sent') === '1';

  const dismissSent = () => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('sent');
        return next;
      },
      { replace: true }
    );
  };

  return (
    <>
      <Helmet>
        <title>Contact - DoStrike Gaming Portal</title>
        <meta name="description" content="Contact the DoStrike Gaming Portal team with questions, feedback, or suggestions. Use our contact form or email us directly." />
        <link rel="canonical" href="https://dostrike.com/contact" />
      </Helmet>
      <div className="container" style={{ maxWidth: 800, margin: '40px auto', background: 'var(--surface)', color: 'var(--text)', padding: '32px 24px', boxShadow: '0 4px 16px rgba(30,136,229,0.07)', borderRadius: 10 }}>
        <BackToPortal />
        <h1 style={{ color: 'var(--primary)', fontSize: '2em', marginBottom: '1em', fontWeight: 700 }}>Contact Us</h1>
        <p style={{ fontSize: '1.1em', color: 'var(--text)', marginBottom: '2em', lineHeight: 1.6 }}>
          Have a question, suggestion, or feedback? Send the form below—we read every message. You can also email us directly at{' '}
          <a href="mailto:dostrike0@gmail.com" style={{ color: 'var(--primary)' }}>
            dostrike0@gmail.com
          </a>
          .
        </p>
        <div style={{ marginBottom: '2em' }}>
          <strong>Address:</strong>
          <br />
          33 Raimonde Road,
          <br />
          Eastwood, NSW, 2122
          <br />
          Australia
        </div>

        {sent && (
          <div
            role="status"
            style={{
              marginBottom: '1.5em',
              padding: '1rem 1.25rem',
              borderRadius: 8,
              background: 'var(--background)',
              border: '1px solid var(--primary)',
              color: 'var(--text)',
              lineHeight: 1.6,
            }}
          >
            <strong style={{ color: 'var(--primary)' }}>Thank you.</strong> Your message was submitted. We’ll reply by email when we can.
            <button type="button" onClick={dismissSent} style={{ marginLeft: 12, background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}>
              Dismiss
            </button>
          </div>
        )}

        <form name="contact" method="POST" action="/" style={{ maxWidth: 500, margin: '0 auto', position: 'relative' }}>
          <input type="hidden" name="form-name" value="contact" />
          <input type="hidden" name="redirect" value="/contact?sent=1" />

          <div className="contact-form-honeypot" aria-hidden="true">
            <label htmlFor="contact-bot-field">Leave empty</label>
            <input id="contact-bot-field" name="bot-field" tabIndex={-1} autoComplete="off" defaultValue="" />
          </div>

          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
            Name
            <input
              type="text"
              name="name"
              required
              autoComplete="name"
              style={{ width: '100%', padding: '0.75em', marginTop: 4, marginBottom: 16, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)', color: 'var(--text)', fontSize: '1em' }}
            />
          </label>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
            Email
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              style={{ width: '100%', padding: '0.75em', marginTop: 4, marginBottom: 16, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)', color: 'var(--text)', fontSize: '1em' }}
            />
          </label>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
            Message
            <textarea
              name="message"
              required
              rows={5}
              style={{ width: '100%', padding: '0.75em', marginTop: 4, marginBottom: 16, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)', color: 'var(--text)', fontSize: '1em', resize: 'vertical' }}
            />
          </label>

          <div className="contact-form-actions">
            <button type="submit" className="btn-primary-action">
              <FaPaperPlane className="btn-primary-action-icon" aria-hidden />
              Send message
            </button>
          </div>
          <p style={{ marginTop: '1rem', fontSize: '0.9em', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Prefer email?{' '}
            <a href="mailto:dostrike0@gmail.com" style={{ color: 'var(--primary)' }}>
              dostrike0@gmail.com
            </a>
          </p>
        </form>
      </div>
    </>
  );
};

export default Contact;
