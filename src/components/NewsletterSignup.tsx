import React, { useState } from 'react';

const NewsletterSignup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setSubscribed(true);
      setLoading(false);
      setEmail('');
    }, 1000);
  };

  if (subscribed) {
    return (
      <div style={{
        background: 'var(--primary)',
        color: 'white',
        padding: '2em',
        borderRadius: 12,
        textAlign: 'center',
        margin: '2em 0'
      }}>
        <h3 style={{ marginBottom: '1em', fontSize: '1.3em' }}>🎉 Welcome to Our Community!</h3>
        <p style={{ marginBottom: '1em', opacity: 0.9 }}>
          Thank you for subscribing! You'll receive updates about new features, strategy tips, and community events.
        </p>
        <button
          onClick={() => setSubscribed(false)}
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            padding: '0.5em 1em',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: '0.9em'
          }}
        >
          Subscribe Another Email
        </button>
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      padding: '2em',
      borderRadius: 12,
      margin: '2em 0',
      boxShadow: '0 4px 16px rgba(30,136,229,0.07)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5em' }}>
        <h3 style={{ color: 'var(--primary)', fontSize: '1.4em', marginBottom: '0.5em' }}>
          Stay Updated with Tic-Tac-Toe Strategy
        </h3>
        <p style={{ color: 'var(--text)', fontSize: '1.1em' }}>
          Get the latest strategy tips, game variations, and community updates delivered to your inbox!
        </p>
      </div>
      
      <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '1em', flexWrap: 'wrap' }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            style={{
              flex: 1,
              minWidth: 200,
              padding: '0.75em 1em',
              border: '1px solid var(--border)',
              borderRadius: 8,
              background: 'var(--surface)',
              color: 'var(--text)',
              fontSize: '1em',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--primary)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border)';
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'var(--primary)',
              color: 'white',
              padding: '0.75em 1.5em',
              border: 'none',
              borderRadius: 8,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1em',
              fontWeight: 600,
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </div>
      </form>
      
      <p style={{
        fontSize: '0.9em',
        color: 'var(--text-muted)',
        textAlign: 'center',
        marginTop: '1em'
      }}>
        We respect your privacy. Unsubscribe at any time.
      </p>
    </div>
  );
};

export default NewsletterSignup; 