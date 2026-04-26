import React from 'react';

interface SocialShareProps {
  title?: string;
  url?: string;
  description?: string;
}

const SocialShare: React.FC<SocialShareProps> = ({ 
  title = 'DoStrike Gaming Portal', 
  url = window.location.href,
  description = 'Play the classic game with AI or friends. Learn strategies and improve your skills!'
}) => {
  const shareData = {
    title,
    text: description,
    url
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const handleLinkedInShare = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=400');
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(`${description}\n\n${url}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      padding: '1.5em',
      borderRadius: 12,
      margin: '1.5em 0',
      boxShadow: '0 2px 8px rgba(30,136,229,0.05)'
    }}>
      <h3 style={{ 
        color: 'var(--primary)', 
        fontSize: '1.2em', 
        marginBottom: '1em',
        textAlign: 'center'
      }}>
        Share This Page
      </h3>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '1em', 
        flexWrap: 'wrap' 
      }}>
        {'share' in navigator ? (
          <button
            onClick={handleNativeShare}
            style={{
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              padding: '0.75em 1.5em',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: '0.9em',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5em'
            }}
          >
            📱 Share
          </button>
        ) : null}
        
        <button
          onClick={handleTwitterShare}
          style={{
            background: '#1DA1F2',
            color: 'white',
            border: 'none',
            padding: '0.75em 1.5em',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: '0.9em',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5em'
          }}
        >
          🐦 Twitter
        </button>
        
        <button
          onClick={handleFacebookShare}
          style={{
            background: '#4267B2',
            color: 'white',
            border: 'none',
            padding: '0.75em 1.5em',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: '0.9em',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5em'
          }}
        >
          📘 Facebook
        </button>
        
        <button
          onClick={handleLinkedInShare}
          style={{
            background: '#0077B5',
            color: 'white',
            border: 'none',
            padding: '0.75em 1.5em',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: '0.9em',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5em'
          }}
        >
          💼 LinkedIn
        </button>
        
        <button
          onClick={handleEmailShare}
          style={{
            background: '#EA4335',
            color: 'white',
            border: 'none',
            padding: '0.75em 1.5em',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: '0.9em',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5em'
          }}
        >
          📧 Email
        </button>
      </div>
      
      <p style={{
        fontSize: '0.9em',
        color: 'var(--text-muted)',
        textAlign: 'center',
        marginTop: '1em'
      }}>
        Help others discover the joy of strategic thinking!
      </p>
    </div>
  );
};

export default SocialShare; 
