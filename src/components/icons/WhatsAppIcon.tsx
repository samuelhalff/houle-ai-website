export const WhatsAppIcon = ({
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
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path d="M20 3.5A10.5 10.5 0 1 1 9.3 22l-4.8 1.3 1.3-4.7A10.5 10.5 0 1 1 20 3.5zM7 8.5c.2-.6.7-1.2 1.3-1.4.3-.1.6 0 .8.3l1.1 1.7c.1.2.1.4 0 .6l-.5.8c.7 1.2 1.8 2.3 3 3l.8-.5c.2-.1.4-.1.6 0l1.7 1.1c.3.2.4.5.3.8-.2.6-.8 1.1-1.4 1.3-.7.2-1.5.1-2.1-.2-1.8-.8-3.5-2.4-4.3-4.2-.3-.7-.4-1.5-.2-2.2z" />
  </svg>
);
