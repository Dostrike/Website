import { useEffect } from 'react';

interface AdSenseAdProps {
  slot: string;
  style?: React.CSSProperties;
}

const AdSenseAd: React.FC<AdSenseAdProps> = ({ slot, style }) => {
  useEffect(() => {
    try {
      const adsWindow = window as Window & { adsbygoogle?: unknown[] };
      adsWindow.adsbygoogle = adsWindow.adsbygoogle || [];
      adsWindow.adsbygoogle.push({});
    } catch (e) {
      // Ignore errors
    }
  }, []);

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