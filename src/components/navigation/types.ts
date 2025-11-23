export type NavData = {
  labels: {
    home: string;
    products: string;
    services: string;
    ressources: string;
    contact: string;
    mobileNavigation: string;
  };
  products: Array<{
    href: string;
    title: string;
    description?: string;
  }>;
  services: Array<{
    href: string;
    title: string;
    description?: string;
  }>;
  hideProducts?: boolean;
};
