import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FaEnvelope } from 'react-icons/fa';
import BackToPortal from './BackToPortal';

const CONTACT_EMAIL = 'dostrike0@gmail.com';
const MAILTO_SUBJECT = encodeURIComponent('DoStrike Gaming Portal — inquiry');
const mailtoHref = `mailto:${CONTACT_EMAIL}?subject=${MAILTO_SUBJECT}`;

/**
 * Mailto-only contact: no server or client upload. Email is the working contact path.
 */
const Contact: React.FC = () => (
  <>
    <Helmet>
      <title>Contact - DoStrike Gaming Portal</title>
      <meta
        name="description"
        content="Contact DoStrike Gaming Portal by email at dostrike0@gmail.com. We do not collect messages through this page—your mail app is the channel we monitor."
      />
      <link rel="canonical" href="https://dostrike.com/contact" />
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
      <h1 style={{ color: 'var(--primary)', fontSize: '2em', marginBottom: '1em', fontWeight: 700 }}>Contact Us</h1>
      <p style={{ fontSize: '1.05em', color: 'var(--text-muted)', marginBottom: '1.25em', lineHeight: 1.6 }}>
        We read <strong style={{ color: 'var(--text)' }}>{CONTACT_EMAIL}</strong> regularly. This page does not accept or store messages in the browser or on our
        servers—use the button below to open your email app and send us a note directly.
      </p>
      <p style={{ marginBottom: '1.5em' }}>
        <a href={mailtoHref} className="btn-primary-action" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <FaEnvelope className="btn-primary-action-icon" aria-hidden />
          Email us
        </a>
      </p>
      <p style={{ fontSize: '1em', color: 'var(--text-muted)', marginBottom: '2em', lineHeight: 1.6 }}>
        Plain address (copy/paste):{' '}
        <a href={mailtoHref} style={{ color: 'var(--primary)', fontWeight: 600 }}>
          {CONTACT_EMAIL}
        </a>
      </p>
      <div style={{ marginBottom: '2em' }}>
        <strong>Postal address</strong>
        <br />
        33 Raimonde Road,
        <br />
        Eastwood, NSW, 2122
        <br />
        Australia
      </div>
    </div>
  </>
);

export default Contact;
