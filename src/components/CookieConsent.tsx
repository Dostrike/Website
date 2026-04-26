import React, { useState, useEffect } from 'react';

type ConsentValue = 'true' | 'false';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const applyConsentMode = (consent: ConsentValue) => {
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };

  window.gtag('consent', 'update', {
    ad_storage: consent === 'true' ? 'granted' : 'denied',
    analytics_storage: consent === 'true' ? 'granted' : 'denied',
    ad_user_data: consent === 'true' ? 'granted' : 'denied',
    ad_personalization: consent === 'true' ? 'granted' : 'denied',
  });
};

const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const storedConsent = localStorage.getItem('cookieConsent') as ConsentValue | null;
    if (!storedConsent) {
      // Consent Mode v2 default state before user action.
      applyConsentMode('false');
      setShowBanner(true);
      return;
    }

    applyConsentMode(storedConsent);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'true');
    applyConsentMode('true');
    window.dispatchEvent(new Event('cookieConsentChanged'));
    setShowBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookieConsent', 'false');
    applyConsentMode('false');
    window.dispatchEvent(new Event('cookieConsentChanged'));
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'var(--surface)',
      borderTop: '1px solid var(--border)',
      padding: '16px',
      zIndex: 1000,
      boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      maxWidth: '100%'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: window.innerWidth > 768 ? 'row' : 'column',
        alignItems: window.innerWidth > 768 ? 'center' : 'flex-start',
        justifyContent: 'space-between',
        gap: '12px',
        maxWidth: 1200,
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{ flex: 1 }}>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: 'var(--text)',
            lineHeight: 1.4
          }}>
            We use cookies to enhance your experience and display personalized ads via Google AdSense. 
            By continuing to use this site, you consent to our use of cookies. 
            See our <a href="/cookies" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Cookie Policy</a> for more details.
          </p>
        </div>
        <div style={{
          display: 'flex',
          gap: '8px',
          flexShrink: 0
        }}>
          <button
            onClick={declineCookies}
            style={{
              padding: '8px 16px',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            Decline
          </button>
          <button
            onClick={acceptCookies}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: 'var(--primary)',
              color: 'white',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent; 