import { useEffect, useState } from 'react';

interface AdSenseAdProps {
  slot: string;
  style?: React.CSSProperties;
}

const AdSenseAd: React.FC<AdSenseAdProps> = ({ slot, style }) => {
  const [consent, setConsent] = useState<string | null>(null);

  useEffect(() => {
    const handleConsentChange = () => {
      setConsent(localStorage.getItem('cookieConsent'));
    };

    handleConsentChange();
    window.addEventListener('cookieConsentChanged', handleConsentChange);

    return () => {
      window.removeEventListener('cookieConsentChanged', handleConsentChange);
    };
  }, []);

  useEffect(() => {
    if (consent !== 'true') {
      return;
    }

    const scriptId = 'adsbygoogle-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4621807979883911';
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }

    try {
      const adsWindow = window as Window & { adsbygoogle?: unknown[] };
      adsWindow.adsbygoogle = adsWindow.adsbygoogle || [];
      adsWindow.adsbygoogle.push({});
    } catch (e) {
      // Ignore errors
    }
  }, [consent]);

  if (consent !== 'true') {
    return null;
  }

  return (
    <ins className="adsbygoogle"
      style={style || { display: 'block' }}
      data-ad-client="ca-pub-4621807979883911"
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
};

export default AdSenseAd; 