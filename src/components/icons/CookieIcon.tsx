export const CookieIcon = ({
  className = "",
  size = 20,
}: {
  className?: string;
  size?: number;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    <circle cx="9" cy="10" r="1.4" fill="currentColor" />
    <circle cx="15.5" cy="9" r="1.2" fill="currentColor" />
    <circle cx="15" cy="14.5" r="1.3" fill="currentColor" />
  </svg>
);
