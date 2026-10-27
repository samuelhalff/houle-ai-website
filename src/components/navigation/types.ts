export type NavData = {
  labels: {
    home: string;
    products: string;
    services: string;
    ressources: string;
    contact: string;
    mobileNavigation: string;
    allProducts?: string;
    allServices?: string;
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
