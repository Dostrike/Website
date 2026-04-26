import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';

const Contact: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(false);
    setError('');
    setSubmitting(true);

    try {
      const payload = new URLSearchParams();
      payload.append('form-name', 'contact');
      payload.append('name', form.name);
      payload.append('email', form.email);
      payload.append('message', form.message);

      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: payload.toString(),
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      setSubmitted(true);
      setForm({ name: '', email: '', message: '' });
    } catch {
      setError('We could not send your message right now. Please email us at dostrike0@gmail.com.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact - DoStrike Gaming Portal</title>
        <meta name="description" content="Contact the DoStrike Gaming Portal team with questions, feedback, or suggestions. Use our contact form or email us directly." />
      </Helmet>
      <div className="container" style={{ maxWidth: 800, margin: '40px auto', background: 'var(--surface)', color: 'var(--text)', padding: '32px 24px', boxShadow: '0 4px 16px rgba(30,136,229,0.07)', borderRadius: 10 }}>
        <h1 style={{ color: 'var(--primary)', fontSize: '2em', marginBottom: '1em', fontWeight: 700 }}>Contact Us</h1>
        <p style={{ fontSize: '1.1em', color: 'var(--text)', marginBottom: '2em', lineHeight: 1.6 }}>
          Have a question, suggestion, or feedback? Fill out the form below or email us directly at <a href="mailto:dostrike0@gmail.com" style={{ color: 'var(--primary)' }}>dostrike0@gmail.com</a>.
        </p>
        <div style={{ marginBottom: '2em' }}>
          <strong>Address:</strong><br />
          33 Raimonde Road,<br />
          Eastwood, NSW, 2122<br />
          Australia
        </div>
        <form onSubmit={handleSubmit} name="contact" style={{ maxWidth: 500, margin: '0 auto' }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
            Name
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
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
          <button
            type="submit"
            disabled={submitting}
            style={{ background: 'var(--primary)', color: 'white', padding: '0.75em 2em', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '1em', cursor: 'pointer' }}
          >
            {submitting ? 'Sending...' : 'Send Message'}
          </button>
          {error && (
            <div style={{ marginTop: 24, color: '#c53030', fontWeight: 500, fontSize: '1em' }}>
              {error}
            </div>
          )}
          {submitted && (
            <div style={{ marginTop: 24, color: 'var(--primary)', fontWeight: 500, fontSize: '1.1em' }}>
              Thank you for contacting us! We’ll get back to you soon.
            </div>
          )}
        </form>
      </div>
    </>
  );
};

export default Contact; 