import React from 'react';
import { Helmet } from 'react-helmet-async';
import BackToPortal from './BackToPortal';

const PrivacyPolicy: React.FC = () => (
  <>
  <Helmet>
    <title>Privacy Policy - DoStrike Gaming Portal</title>
    <meta name="description" content="Read the DoStrike Gaming Portal Privacy Policy, including how we use cookies, analytics, and advertising services." />
    <link rel="canonical" href="https://dostrike.com/privacy" />
  </Helmet>
  <div className="container" style={{ maxWidth: 800, margin: '40px auto', background: 'var(--surface)', color: 'var(--text)', padding: '32px 24px', boxShadow: '0 4px 16px rgba(30,136,229,0.07)', borderRadius: 10 }}>
    <BackToPortal />
    <h1 style={{ color: 'var(--primary)', fontSize: '2.2em', marginBottom: '0.2em' }}>Privacy Policy</h1>
    <p><strong>Effective Date:</strong> June 1, 2025</p>
    <p>
      Thank you for choosing DoStrike Gaming Portal. Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our <strong>website</strong>.
    </p>
    <p>
      For how we separate editorial content from advertising and how Google AdSense may appear on the site, see our{' '}
      <a href="/editorial" style={{ color: 'var(--primary)' }}>
        Editorial standards &amp; advertising disclosure
      </a>
      .
    </p>
    <h2 style={{ color: 'var(--secondary)', fontSize: '1.3em', marginTop: '1.6em' }}>1. Information We Collect</h2>
    <ul>
      <li><strong>Personal Data:</strong> We do not require personal information to play games or read content on this website, and we do not operate a contact form that uploads messages through the site. If you choose to email us (via the address on our Contact page), anything you send—such as your email address, name, or other details you include—is ordinary email correspondence handled for support purposes only.</li>
      <li><strong>Cookies & Usage Data:</strong> We use cookies and similar technologies to analyze website traffic and usage. Third-party services, including Google AdSense, may use cookies to serve personalized ads and measure ad performance. See <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">Google’s Advertising Policy</a> for more details.</li>
      <li><strong>Advertising Data:</strong> Google AdSense and its partners may collect data (including advertising identifiers and cookies) to show you personalized ads.</li>
    </ul>
    <h2 style={{ color: 'var(--secondary)', fontSize: '1.3em', marginTop: '1.6em' }}>2. How We Use Your Information</h2>
    <ul>
      <li>Provide and improve the website’s functionality and user experience.</li>
      <li>Display relevant advertisements.</li>
      <li>Analyze usage to improve features and resolve bugs.</li>
      <li>Comply with legal obligations.</li>
    </ul>
    <h2 style={{ color: 'var(--secondary)', fontSize: '1.3em', marginTop: '1.6em' }}>3. Sharing of Information</h2>
    <ul>
      <li><strong>Google AdSense:</strong> We use Google AdSense to display ads on our website. AdSense and its partners may collect and use data (including cookies and advertising identifiers) to show you personalized ads. For more information, see <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google’s Privacy Policy</a>.</li>
      <li><strong>No Sale of Personal Data:</strong> We do not sell your personal data to third parties.</li>
    </ul>
    <h2 style={{ color: 'var(--secondary)', fontSize: '1.3em', marginTop: '1.6em' }}>4. Data Retention and Security</h2>
    <ul>
      <li>We retain your data only as long as necessary to provide our services and for legitimate business purposes.</li>
      <li>We use industry-standard security measures to protect your information from unauthorized access or disclosure.</li>
      <li>Data related to advertising and analytics may be retained by third-party partners according to their policies.</li>
    </ul>
    <h2 style={{ color: 'var(--secondary)', fontSize: '1.3em', marginTop: '1.6em' }}>5. User Rights and Choices</h2>
    <ul>
      <li><strong>Ad Personalization:</strong> You can opt out of personalized ads via your browser settings. See <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer">Google Ad Settings</a>.</li>
      <li><strong>Access and Deletion:</strong> If you wish to access or delete personal information tied to correspondence with us, email us at dostrike0@gmail.com. We will comply with applicable data protection laws.</li>
    </ul>
    <h2 style={{ color: 'var(--secondary)', fontSize: '1.3em', marginTop: '1.6em' }}>6. Children’s Privacy</h2>
    <p>
      Our website is not directed to children under the age of 13. We do not knowingly collect personal information from children. If you believe we have collected such information, please contact us so we can promptly delete it.
    </p>
    <h2 style={{ color: 'var(--secondary)', fontSize: '1.3em', marginTop: '1.6em' }}>7. Changes to This Policy</h2>
    <p>
      We may update this Privacy Policy from time to time. We will notify you of any material changes by updating the effective date and, where appropriate, providing a notice within the website.
    </p>
    <h2 style={{ color: 'var(--secondary)', fontSize: '1.3em', marginTop: '1.6em' }}>8. Contact Us</h2>
    <p>
      If you have any questions or concerns about this Privacy Policy or your data, please contact us:
    </p>
    <ul style={{ marginLeft: '1.5em', marginBottom: '1em' }}>
      <li><strong>Email:</strong>{' '}<a href="mailto:dostrike0@gmail.com" style={{ color: 'var(--primary)' }}>dostrike0@gmail.com</a></li>
      <li><strong>Contact page:</strong>{' '}<a href="https://dostrike.com/contact" style={{ color: 'var(--primary)' }}>dostrike.com/contact</a></li>
      <li><strong>Publisher:</strong> DoStrike Gaming Portal</li>
      <li><strong>Address:</strong> 33 Raimonde Road,<br />Eastwood, NSW, 2122<br />Australia</li>
    </ul>
    <p style={{ marginTop: '2em' }}>
      <em>By using DoStrike Gaming Portal, you consent to the practices described in this Privacy Policy.</em>
    </p>
  </div>
  </>
);

export default PrivacyPolicy; 
