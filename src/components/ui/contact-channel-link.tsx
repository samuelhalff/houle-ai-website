"use client";

import { forwardRef, type ComponentProps } from "react";
import { trackEvent } from "@/src/lib/analytics";

type ContactChannelLinkProps = ComponentProps<"a"> & {
  /** Channel name reported to GA4 and PostHog, for example "email", "whatsapp" or "booking". */
  channel: string;
  /** Where on the site the link sits, for example "footer". */
  placement: string;
};

/**
 * Plain anchor (mailto, wa.me, booking page, ...) that reports a
 * `contact_channel_click` event. Usable from server components, and as the
 * child of `<Button asChild>` (forwards its ref).
 */
const ContactChannelLink = forwardRef<HTMLAnchorElement, ContactChannelLinkProps>(
  ({ channel, placement, onClick, ...props }, ref) => (
    <a
      ref={ref}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        trackEvent("contact_channel_click", { channel, placement });
      }}
    />
  ),
);
ContactChannelLink.displayName = "ContactChannelLink";

export default ContactChannelLink;
