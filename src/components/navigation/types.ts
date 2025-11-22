export type NavData = {
  labels: {
    home: string;
    products: string;
    contact: string;
    mobileNavigation: string;
  };
  products: Array<{
    href: string;
    title: string;
    description?: string;
  }>;
  hideProducts?: boolean;
};
