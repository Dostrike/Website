import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaPaperPlane } from 'react-icons/fa';
import BackToPortal from './BackToPortal';

const CONTACT_EMAIL = 'dostrike0@gmail.com';

/**
 * Client-side contact helper only: no server submit (no Netlify Forms / fetch).
 * Visitors still reach us reliably via the mailto link below.
 */
const Contact: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [showThanks, setShowThanks] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowThanks(true);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <>
      <Helmet>
        <title>Contact - DoStrike Gaming Portal</title>
        <meta name="description" content="Contact the DoStrike Gaming Portal team: email dostrike0@gmail.com or use the on-page message helper (no data stored on our servers)." />
        <link rel="canonical" href="https://dostrike.com/contact" />
      </Helmet>
      <div className="container" style={{ maxWidth: 800, margin: '40px auto', background: 'var(--surface)', color: 'var(--text)', padding: '32px 24px', boxShadow: '0 4px 16px rgba(30,136,229,0.07)', borderRadius: 10 }}>
        <BackToPortal />
        <h1 style={{ color: 'var(--primary)', fontSize: '2em', marginBottom: '1em', fontWeight: 700 }}>Contact Us</h1>
        <p style={{ fontSize: '1.05em', color: 'var(--text-muted)', marginBottom: '1.25em', lineHeight: 1.6 }}>
          The fields below help you compose a message; we don’t store submissions on this page. To reach us, use the email address below—we read that inbox regularly.
        </p>
        <p style={{ fontSize: '1.1em', color: 'var(--text)', marginBottom: '2em', lineHeight: 1.6 }}>
          Direct email:{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>
            {CONTACT_EMAIL}
          </a>
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

        {showThanks && (
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
            <strong style={{ color: 'var(--primary)' }}>Thanks.</strong> Nothing was uploaded from this screen—send your note to{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--primary)' }}>
              {CONTACT_EMAIL}
            </a>{' '}
            when you’re ready.
            <button type="button" onClick={() => setShowThanks(false)} style={{ marginLeft: 12, background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}>
              Dismiss
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: '0 auto' }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
            Name
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
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
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              style={{ width: '100%', padding: '0.75em', marginTop: 4, marginBottom: 16, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)', color: 'var(--text)', fontSize: '1em' }}
            />
          </label>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
            Message
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
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
        </form>
      </div>
    </>
  );
};

export default Contact;
