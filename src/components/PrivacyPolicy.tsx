import React from "react";
import { Helmet } from "react-helmet-async";
import BackToPortal from "./BackToPortal";

const PrivacyPolicy: React.FC = () => (
  <>
    <Helmet>
      <title>Privacy Policy - DoStrike Gaming Portal</title>
      <meta
        name="description"
        content="Read the DoStrike Gaming Portal Privacy Policy, including how we use cookies, analytics, and advertising services."
      />
      <link rel="canonical" href="https://dostrike.com/privacy" />
    </Helmet>
    <div
      className="container reading-page"
      style={{
        maxWidth: 800,
        margin: "40px auto",
        background: "var(--surface)",
        color: "var(--text)",
        padding: "32px 24px",
        boxShadow: "0 4px 16px rgba(30,136,229,0.07)",
        borderRadius: 10,
      }}
    >
      <BackToPortal />
      <h1
        style={{
          color: "var(--primary)",
          fontSize: "2.2em",
          marginBottom: "0.2em",
        }}
      >
        Privacy Policy
      </h1>
      <p>
        <strong>Last updated:</strong> October 27, 2026
      </p>
      <p>
        Thank you for choosing DoStrike Gaming Portal. Your privacy is important
        to us. This Privacy Policy explains how we collect, use, disclose, and
        safeguard your information when you use our <strong>website</strong>.
      </p>
      <p>
        For how we separate editorial content from advertising and how Google
        AdSense may appear on the site, see our{" "}
        <a href="/editorial" style={{ color: "var(--primary)" }}>
          Editorial standards &amp; advertising disclosure
        </a>
        .
      </p>
      <h2
        style={{
          color: "var(--secondary)",
          fontSize: "1.3em",
          marginTop: "1.6em",
        }}
      >
        1. Information We Collect
      </h2>
      <ul>
        <li>
          <strong>Personal Data:</strong> We do not require personal information
          to play games or read content on this website, and we do not operate a
          contact form that uploads messages through the site. If you choose to
          email us (via the address on our Contact page), anything you send—such
          as your email address, name, or other details you include—is ordinary
          email correspondence handled for support purposes only.
        </li>
        <li>
          <strong>Browser storage:</strong> Game settings, theme, scores, daily
          challenge progress and cookie preferences are saved locally on your
          device. These records are not an aggregate visitor tracking service.
          Google Analytics and Netlify Web Analytics are not enabled in the
          current release. If advertising is enabled in a future release,
          Google and its partners may use cookies and other identifiers to
          personalize ads and measure performance, subject to applicable consent
          choices. See{" "}
          <a
            href="https://policies.google.com/technologies/ads"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google’s Advertising Policy
          </a>{" "}
          for more details.
        </li>
        <li>
          <strong>Service connections:</strong> Our hosting provider processes
          connection information, such as IP addresses and requested pages, to
          deliver the website. Private online games send room identifiers and
          moves through our game server to the other player; this differs from
          local play against the computer or on the same device.
        </li>
      </ul>
      <h2
        style={{
          color: "var(--secondary)",
          fontSize: "1.3em",
          marginTop: "1.6em",
        }}
      >
        2. How We Use Your Information
      </h2>
      <ul>
        <li>
          Provide and improve the website’s functionality and user experience.
        </li>
        <li>Connect players who choose a private online game.</li>
        <li>Respond to support emails and investigate reported bugs.</li>
        <li>Comply with legal obligations.</li>
      </ul>
      <h2
        style={{
          color: "var(--secondary)",
          fontSize: "1.3em",
          marginTop: "1.6em",
        }}
      >
        3. Sharing of Information
      </h2>
      <ul>
        <li>
          <strong>Advertising status:</strong> Ad requests are disabled in the
          current release while the site is under review. Accepting optional
          cookies does not enable ads while this restriction is in place. If
          Google AdSense is enabled later, Google and its partners may collect and use data
          (including cookies and advertising identifiers) to show you
          personalized ads. For more information, see{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google’s Privacy Policy
          </a>
          .
        </li>
        <li>
          <strong>No Sale of Personal Data:</strong> We do not sell your
          personal data to third parties.
        </li>
      </ul>
      <h2
        style={{
          color: "var(--secondary)",
          fontSize: "1.3em",
          marginTop: "1.6em",
        }}
      >
        4. Data Retention and Security
      </h2>
      <ul>
        <li>
          Browser-local records remain until you clear this site's stored data
          or your browser removes them. Clearing them resets saved settings,
          scores, daily progress and cookie preferences on that browser.
        </li>
        <li>
          We retain your data only as long as necessary to provide our services
          and for legitimate business purposes.
        </li>
        <li>
          We use industry-standard security measures to protect your information
          from unauthorized access or disclosure.
        </li>
        <li>
          Data related to advertising and analytics may be retained by
          third-party partners according to their policies.
        </li>
      </ul>
      <h2
        style={{
          color: "var(--secondary)",
          fontSize: "1.3em",
          marginTop: "1.6em",
        }}
      >
        5. User Rights and Choices
      </h2>
      <ul>
        <li>
          <strong>Advertising choices:</strong> Use Cookie preferences in the
          site navigation to change the saved optional-cookie choice. This
          control does not replace a certified consent message where required
          before advertising is enabled. You can also manage Google's ad
          personalization settings at{" "}
          <a
            href="https://adssettings.google.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Ad Settings
          </a>
          .
        </li>
        <li>
          <strong>Access and Deletion:</strong> If you wish to access or delete
          personal information tied to correspondence with us, email us at
          dostrike0@gmail.com. We will comply with applicable data protection
          laws.
        </li>
      </ul>
      <h2
        style={{
          color: "var(--secondary)",
          fontSize: "1.3em",
          marginTop: "1.6em",
        }}
      >
        6. Children’s Privacy
      </h2>
      <p>
        Our website is not directed to children under the age of 13. We do not
        knowingly collect personal information from children. If you believe we
        have collected such information, please contact us so we can promptly
        delete it.
      </p>
      <h2
        style={{
          color: "var(--secondary)",
          fontSize: "1.3em",
          marginTop: "1.6em",
        }}
      >
        7. Changes to This Policy
      </h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you
        of any material changes by updating the effective date and, where
        appropriate, providing a notice within the website.
      </p>
      <h2
        style={{
          color: "var(--secondary)",
          fontSize: "1.3em",
          marginTop: "1.6em",
        }}
      >
        8. Contact Us
      </h2>
      <p>
        If you have any questions or concerns about this Privacy Policy or your
        data, please contact us:
      </p>
      <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
        <li>
          <strong>Email:</strong>{" "}
          <a
            href="mailto:dostrike0@gmail.com"
            style={{ color: "var(--primary)" }}
          >
            dostrike0@gmail.com
          </a>
        </li>
        <li>
          <strong>Contact page:</strong>{" "}
          <a
            href="https://dostrike.com/contact"
            style={{ color: "var(--primary)" }}
          >
            dostrike.com/contact
          </a>
        </li>
        <li>
          <strong>Publisher:</strong> DoStrike Gaming Portal
        </li>
        <li>
          <strong>Address:</strong> 33 Raimonde Road,
          <br />
          Eastwood, NSW, 2122
          <br />
          Australia
        </li>
      </ul>
      <p style={{ marginTop: "2em" }}>
        <em>
          Optional advertising cookie choices can be changed through Cookie
          preferences in the site navigation. Browsing the site alone does not
          grant consent to optional cookies.
        </em>
      </p>
    </div>
  </>
);

export default PrivacyPolicy;
