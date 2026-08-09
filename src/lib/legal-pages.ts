// Canonical list of legal pages editable from /admin/legal. `id` matches the LegalPage row id
// and the LEGAL_PAGE_ROUTES map in src/app/admin/actions.ts; `defaultTitle` is only shown until
// the admin saves a custom title for that page.
export const LEGAL_PAGES: { id: string; path: string; defaultTitle: string }[] = [
  { id: 'terms', path: '/terms', defaultTitle: 'Terms of Service' },
  { id: 'privacy', path: '/privacy', defaultTitle: 'Privacy Policy' },
  { id: 'cancellation-refund', path: '/cancellation-refund', defaultTitle: 'Cancellation & Refund' },
  { id: 'shipping-policy', path: '/shipping-policy', defaultTitle: 'Shipping Policy' },
  { id: 'contact', path: '/contact', defaultTitle: 'Contact Us' },
];
