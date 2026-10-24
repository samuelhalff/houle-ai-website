"use client";

import { type ComponentProps } from "react";
import { trackEvent } from "@/src/lib/analytics";

type ContactChannelLinkProps = ComponentProps<"a"> & {
  /** Channel name reported to GA4, for example "email" or "whatsapp". */
  channel: string;
  /** Where on the site the link sits, for example "footer". */
  placement: string;
};

/**
 * Plain anchor (mailto, wa.me, ...) that reports a `contact_channel_click`
 * event. Usable from server components.
 */
const ContactChannelLink = ({
  channel,
  placement,
  onClick,
  ...props
}: ContactChannelLinkProps) => (
  <a
    {...props}
    onClick={(event) => {
      onClick?.(event);
      trackEvent("contact_channel_click", { channel, placement });
    }}
  />
);

export default ContactChannelLink;
