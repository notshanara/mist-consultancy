export const site = {
  name: 'MIST Consultancy',
  description:
    'Operational assessment and improvement for transport, fleet, logistics, warehousing and distribution businesses.',
  email: {
    enquiries: 'enquiries@mistconsultancy.co.uk',
  },
  phone: {
    display: '+44 7869 654471',
    href: 'tel:+447869654471',
  },
};

export const nav = [
  { href: '/', label: 'Home' },
  { href: '/services/', label: 'Our Services' },
  { href: '/about/', label: 'About' },
  { href: '/approach/', label: 'Our Approach' },
];

export const contactLink = { href: '/contact/', label: 'Contact' };

// The header shows these, and keeps the rest under More.
export const headerNav = [{ href: '/services/', label: 'Our Services' }, { href: '/approach/', label: 'Our Approach' }, contactLink];

export const moreNav = [
  { href: '/about/', label: 'About' },
  { href: '/privacy/', label: 'Privacy and cookies' },
];
