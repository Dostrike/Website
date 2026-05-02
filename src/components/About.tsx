import React from 'react';
import { Helmet } from 'react-helmet-async';
import AdSenseAd from './AdSenseAd';
import BackToPortal from './BackToPortal';

const About: React.FC = () => (
  <>
    <Helmet>
      <title>About - DoStrike Gaming Portal</title>
      <meta name="description" content="Learn who publishes DoStrike: classic browser games (Tic-Tac-Toe, Connect 4, Memory), original strategy guides, privacy-first ads, and how to reach us." />
      <link rel="canonical" href="https://dostrike.com/about" />
    </Helmet>
    <div className="container" style={{ maxWidth: 800, margin: '40px auto', background: 'var(--surface)', color: 'var(--text)', padding: '32px 24px', boxShadow: '0 4px 16px rgba(30,136,229,0.07)', borderRadius: 10 }}>
      <BackToPortal />
      <h1 style={{ color: 'var(--primary)', fontSize: '2em', marginBottom: '1em', fontWeight: 700 }}>About This Site</h1>
      <p style={{ fontSize: '1.1em', color: 'var(--text)', marginBottom: '2em', lineHeight: 1.6 }}>
        Welcome to DoStrike Gaming Portal. We publish fast, accessible browser games—Tic-Tac-Toe, Connect 4, and Memory—together with original strategy articles so players can learn while they play.
      </p>
      <p style={{ fontSize: '1em', color: 'var(--text)', marginBottom: '2em', lineHeight: 1.6 }}>
        For how we handle editorial independence and advertising (Google AdSense), see our{' '}
        <a href="/editorial" style={{ color: 'var(--primary)' }}>
          Editorial standards &amp; advertising disclosure
        </a>
        .
      </p>
      <h2 style={{ color: 'var(--secondary)', fontSize: '1.2em', margin: '1.5em 0 0.5em 0', fontWeight: 600 }}>Our Mission</h2>
      <p>
        We believe simple games stay engaging when the rules are clear and improvement feels achievable. Our goal is to help visitors practice tactics, read honest guides, and enjoy reliable gameplay on phones and desktops—without needing an account for casual play.
      </p>
      <h2 style={{ color: 'var(--secondary)', fontSize: '1.2em', margin: '1.5em 0 0.5em 0', fontWeight: 600 }}>Development Story</h2>
      <p>
        DoStrike began as a focused Tic-Tac-Toe project and grew into a small portal: multiple games, difficulty options where it matters (AI and Memory levels), and a blog maintained by our editorial label. We iterate based on accessibility, mobile usability, and transparent privacy choices.
      </p>
      <h2 style={{ color: 'var(--secondary)', fontSize: '1.2em', margin: '1.5em 0 0.5em 0', fontWeight: 600 }}>Our Commitment</h2>
      <p>
        We are committed to providing a safe, enjoyable, and ad-compliant experience. We respect your privacy and strive to be transparent about how we use data and ads. If you have feedback or suggestions, please <a href="/contact" style={{ color: 'var(--primary)' }}>contact us</a>.
      </p>
      <h2 style={{ color: 'var(--secondary)', fontSize: '1.2em', margin: '1.5em 0 0.5em 0', fontWeight: 600 }}>Our Team</h2>
      <p>
        Our team consists of passionate developers, educators, and game enthusiasts who believe in the power of simple games to teach complex concepts. We come from diverse backgrounds in computer science, education, and game design, united by our love for strategic thinking and learning.
      </p>
      
      <h2 style={{ color: 'var(--secondary)', fontSize: '1.2em', margin: '1.5em 0 0.5em 0', fontWeight: 600 }}>Our Values</h2>
      <ul style={{ marginLeft: '1.5em', marginBottom: '1em' }}>
        <li><strong>Accessibility:</strong> We believe everyone should have access to quality educational games</li>
        <li><strong>Innovation:</strong> We continuously improve our platform with new features and content</li>
        <li><strong>Community:</strong> We foster a supportive community of learners and players</li>
        <li><strong>Education:</strong> We prioritize learning and skill development over competition</li>
        <li><strong>Quality:</strong> We maintain high standards in everything we create</li>
      </ul>

      <h2 style={{ color: 'var(--secondary)', fontSize: '1.2em', margin: '1.5em 0 0.5em 0', fontWeight: 600 }}>Our Achievements</h2>
      <p>
        Since our launch, we've helped thousands of players improve their strategic thinking skills. Our platform has been used in classrooms, community centers, and homes around the world. We're proud to have created a space where learning and fun go hand in hand.
      </p>

      <h2 style={{ color: 'var(--secondary)', fontSize: '1.2em', margin: '1.5em 0 0.5em 0', fontWeight: 600 }}>Contact & Address</h2>
      <p>
        <strong>Address:</strong><br />
        33 Raimonde Road,<br />
        Eastwood, NSW, 2122<br />
        Australia
      </p>
      
      <p style={{ marginTop: '1em' }}>
        <strong>Email:</strong> <a href="mailto:dostrike0@gmail.com" style={{ color: 'var(--primary)' }}>dostrike0@gmail.com</a><br />
        <strong>Business Hours:</strong> Monday - Friday, 9:00 AM - 5:00 PM AEST
      </p>

      {/* AdSense Ad */}
      <div style={{ marginTop: '2em', textAlign: 'center' }}>
        <AdSenseAd slot="8488726423" style={{ display: 'block', width: '100%', minHeight: 90 }} />
      </div>
    </div>
  </>
);

export default About; 
