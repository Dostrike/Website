import React, { useState, useEffect } from "react";

type ConsentValue = "true" | "false";

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

  window.gtag("consent", "update", {
    ad_storage: consent === "true" ? "granted" : "denied",
    analytics_storage: consent === "true" ? "granted" : "denied",
    ad_user_data: consent === "true" ? "granted" : "denied",
    ad_personalization: consent === "true" ? "granted" : "denied",
  });
};

const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const reopen = () => setShowBanner(true);
    window.addEventListener("openCookiePreferences", reopen);
    // Check if user has already accepted cookies
    const storedConsent = localStorage.getItem(
      "cookieConsent",
    ) as ConsentValue | null;
    if (!storedConsent) {
      // Consent Mode v2 default state before user action.
      applyConsentMode("false");
      setShowBanner(true);
      return () => window.removeEventListener("openCookiePreferences", reopen);
    }

    applyConsentMode(storedConsent);
    return () => window.removeEventListener("openCookiePreferences", reopen);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "true");
    applyConsentMode("true");
    window.dispatchEvent(new Event("cookieConsentChanged"));
    setShowBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem("cookieConsent", "false");
    applyConsentMode("false");
    window.dispatchEvent(new Event("cookieConsentChanged"));
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <section className="cookie-banner" aria-label="Cookie choices">
      <div>
        <strong>Your game. Your choice.</strong>
        <p>
          Allow optional advertising cookies? Games work either way. Your choice
          is saved on this device. <a href="/cookies">Read the cookie policy</a>
          .
        </p>
      </div>
      <div className="cookie-actions">
        <button className="ds-button" onClick={declineCookies}>
          Decline optional
        </button>
        <button className="ds-button ds-button-primary" onClick={acceptCookies}>
          Accept optional
        </button>
      </div>
    </section>
  );
};
export default CookieConsent;
