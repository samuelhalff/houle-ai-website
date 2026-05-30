"use client";

import dynamic from "next/dynamic";

const ContactForm = dynamic(() => import("@/src/components/ui/contact-form"), {
  ssr: false,
  loading: () => null,
});

export { ContactForm };
