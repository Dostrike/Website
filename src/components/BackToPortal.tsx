import React from "react";
import { Link } from "react-router-dom";

type BackToPortalProps = {
  /** Use in dense headers (game setup) so outer spacing does not stack */
  variant?: "default" | "inline";
  /** Runs before navigation (e.g. socket cleanup in private games) */
  beforeNavigate?: () => void;
};

const BackToPortal: React.FC<BackToPortalProps> = ({
  variant = "default",
  beforeNavigate,
}) => (
  <div
    className={
      variant === "inline"
        ? "back-to-portal-wrap back-to-portal-wrap--inline"
        : "back-to-portal-wrap"
    }
  >
    <Link
      to="/"
      className="back-to-portal"
      onClick={() => {
        beforeNavigate?.();
      }}
    >
      <span aria-hidden="true">←</span>
      Game lobby
    </Link>
  </div>
);

export default BackToPortal;
