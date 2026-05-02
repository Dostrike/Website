import React from 'react';
import { Link } from 'react-router-dom';
import { FaRocket } from 'react-icons/fa';

type BackToPortalProps = {
  /** Use in dense headers (game setup) so outer spacing does not stack */
  variant?: 'default' | 'inline';
};

const BackToPortal: React.FC<BackToPortalProps> = ({ variant = 'default' }) => (
  <div
    className={
      variant === 'inline'
        ? 'back-to-portal-wrap back-to-portal-wrap--inline'
        : 'back-to-portal-wrap'
    }
  >
    <Link to="/" className="back-to-portal">
      <FaRocket className="back-to-portal-icon" aria-hidden />
      Back to portal
    </Link>
  </div>
);

export default BackToPortal;
