import React from 'react';
import { Helmet } from 'react-helmet-async';
import BackToPortal from './BackToPortal';

const TermsOfService: React.FC = () => (
  <>
    <Helmet>
      <title>Terms of Service - DoStrike Gaming Portal</title>
      <meta name="description" content="Read the Terms of Service for DoStrike Gaming Portal. Learn about your rights, responsibilities, and our policies." />
      <link rel="canonical" href="https://dostrike.com/terms" />
    </Helmet>
    <div className="container" style={{ maxWidth: 800, margin: '40px auto', background: 'var(--surface)', color: 'var(--text)', padding: '32px 24px', boxShadow: '0 4px 16px rgba(30,136,229,0.07)', borderRadius: 10 }}>
      <BackToPortal />
      <h1 style={{ color: 'var(--primary)', fontSize: '2em', marginBottom: '1em', fontWeight: 700 }}>Terms of Service</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95em', marginBottom: '2em' }}>Last updated: May 3, 2026</p>
      <h2 style={{ color: 'var(--secondary)', fontSize: '1.2em', margin: '1.5em 0 0.5em 0', fontWeight: 600 }}>1. Acceptance of Terms</h2>
      <p>By accessing or using this website (the "Service"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree, please do not use the Service.</p>
      <h2 style={{ color: 'var(--secondary)', fontSize: '1.2em', margin: '1.5em 0 0.5em 0', fontWeight: 600 }}>2. Use of the Service</h2>
      <p>You may use the Service for personal, non-commercial purposes only. You agree not to misuse the Service or attempt to disrupt its operation.</p>
      <h2 style={{ color: 'var(--secondary)', fontSize: '1.2em', margin: '1.5em 0 0.5em 0', fontWeight: 600 }}>3. Intellectual Property</h2>
      <p>All content, trademarks, and code on this site are the property of the site owner or its licensors. You may not copy, reproduce, or distribute any part of the Service without permission.</p>
      <h2 style={{ color: 'var(--secondary)', fontSize: '1.2em', margin: '1.5em 0 0.5em 0', fontWeight: 600 }}>4. Disclaimer</h2>
      <p>The Service is provided "as is" without warranties of any kind. We do not guarantee the accuracy, completeness, or availability of the Service. Use at your own risk.</p>
      <h2 style={{ color: 'var(--secondary)', fontSize: '1.2em', margin: '1.5em 0 0.5em 0', fontWeight: 600 }}>5. Limitation of Liability</h2>
      <p>To the fullest extent permitted by law, we are not liable for any damages arising from your use of the Service.</p>
      <h2 style={{ color: 'var(--secondary)', fontSize: '1.2em', margin: '1.5em 0 0.5em 0', fontWeight: 600 }}>6. Third-Party Services & Ads</h2>
      <p>This site uses Google AdSense and may display third-party ads. We are not responsible for the content or privacy practices of third-party sites.</p>
      <h2 style={{ color: 'var(--secondary)', fontSize: '1.2em', margin: '1.5em 0 0.5em 0', fontWeight: 600 }}>7. Cookies</h2>
      <p>This site uses cookies to improve your experience and serve ads. By using the Service, you consent to our use of cookies as described in our Cookie Policy.</p>
      <h2 style={{ color: 'var(--secondary)', fontSize: '1.2em', margin: '1.5em 0 0.5em 0', fontWeight: 600 }}>8. Changes to Terms</h2>
      <p>We may update these Terms at any time. Continued use of the Service means you accept the revised Terms.</p>
      <h2 style={{ color: 'var(--secondary)', fontSize: '1.2em', margin: '1.5em 0 0.5em 0', fontWeight: 600 }}>9. Contact</h2>
      <p>If you have questions about these Terms, please <a href="/contact" style={{ color: 'var(--primary)' }}>contact us</a>.</p>
    </div>
  </>
);

export default TermsOfService; 
