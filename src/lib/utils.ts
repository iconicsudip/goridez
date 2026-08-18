export const slugify = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const getCarSlug = (car: { make: string; model: string }) => {
  return slugify(`${car.make} ${car.model}`);
};

/** Canonical absolute site origin (no trailing slash), used to build absolute URLs for
 * sitemap.xml, robots.txt and llms.txt. Mirrors the pattern already used for the OAuth
 * redirect URI and the admin integrations "site URL" default. */
export const getSiteUrl = (): string =>
  (process.env.NEXTAUTH_URL || 'https://goridez.com').replace(/\/$/, '');

/**
 * Normalizes a page path used as the SEO settings lookup key. Admins often paste a full
 * URL (copied from the browser address bar — complete with domain, "www.", and live query
 * params) instead of a bare relative path. Since this value is the unique key the live site
 * looks up SEO content by (see getSeoForPath in src/lib/seo.ts), an unnormalized value never
 * matches any real page and the saved content silently never appears on the site. Used on
 * both the admin form (for immediate feedback) and the server action (as the source of truth).
 */
export const normalizePagePath = (raw: string): string => {
  let path = (raw || '').trim();
  if (!path) return '/';
  try {
    if (/^https?:\/\//i.test(path)) {
      path = new URL(path).pathname;
    }
  } catch {
    // Not a parseable absolute URL — fall through and treat as a raw path.
  }
  path = path.split('?')[0].split('#')[0]; // strip query string / hash fragment
  if (!path.startsWith('/')) path = `/${path}`;
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1); // strip trailing slash
  return path || '/';
};

export interface PackageDecompositionResult {
  basePrice: number;
  extraInfo: string;
  usedPkgIds: Set<string>;
  breakdownParts: { pkgName: string; count: number; subtotal: number }[];
  extraHours: number;
  selectedPkg: any;
}

export const getPackageDurationHours = (pkg: any): number => {
  if (!pkg) return 24;

  // Try to parse duration from name first, as it's more specific for packages like "12 Hours Limit Package"
  const lowerName = pkg.name.toLowerCase();
  const dayMatch = lowerName.match(/(\d+(\.\d+)?)\s*(day|days|d)\b/);
  if (dayMatch) {
    return parseFloat(dayMatch[1]) * 24;
  }
  const hourMatch = lowerName.match(/(\d+(\.\d+)?)\s*(hour|hours|hr|hrs|h)\b/);
  if (hourMatch) {
    return parseFloat(hourMatch[1]);
  }

  // Fallback to type check if name doesn't specify duration
  if (pkg.type === 'HOUR' && pkg.limitValue) {
    const val = parseFloat(pkg.limitValue);
    if (!isNaN(val) && val > 0) return val;
  }

  return 24;
};

export const calculatePackagePricing = (
  packages: any[],
  hours: number
): PackageDecompositionResult => {
  const allowedPkgs = (packages || []).filter(pkg => {
    if (!pkg?.name) return false;
    const lowerName = pkg.name.toLowerCase();
    return lowerName.includes('12 hour') || lowerName.includes('24 hour') || lowerName.includes('12hour') || lowerName.includes('24hour');
  });

  if (allowedPkgs.length === 0) {
    return {
      basePrice: 0,
      extraInfo: 'No package configured',
      usedPkgIds: new Set<string>(),
      breakdownParts: [],
      extraHours: 0,
      selectedPkg: null
    };
  }

  // Sort packages by duration descending
  const sortedPkgs = [...allowedPkgs].sort(
    (a, b) => getPackageDurationHours(b) - getPackageDurationHours(a)
  );

  let remaining = hours;
  let totalPrice = 0;
  const breakdownParts: { pkgName: string; count: number; subtotal: number }[] = [];
  const usedPkgIds = new Set<string>();

  sortedPkgs.forEach(pkg => {
    const pkgHours = getPackageDurationHours(pkg);
    if (pkgHours <= 0) return;

    const count = Math.floor(remaining / pkgHours);
    if (count > 0) {
      const subtotal = count * pkg.basePrice;
      totalPrice += subtotal;
      remaining -= count * pkgHours;
      breakdownParts.push({
        pkgName: pkg.name,
        count,
        subtotal
      });
      usedPkgIds.add(pkg.id);
    }
  });

  const extraHours = Math.max(0, Math.round(remaining));

  // Format description
  const partsLabel = breakdownParts
    .map(p => `${p.count}x ${p.pkgName}`)
    .join(' + ');

  const extraLabel = extraHours > 0 ? ` (+${extraHours} hrs extra billed later)` : '';
  const extraInfo = partsLabel ? `${partsLabel}${extraLabel}` : `${extraHours} Hours (billed later)`;

  // Define the "selectedPkg" as the highest duration package used, or default to first
  const selectedPkg = allowedPkgs.find(p => usedPkgIds.has(p.id)) || allowedPkgs[0];

  return {
    basePrice: totalPrice,
    extraInfo,
    usedPkgIds,
    breakdownParts,
    extraHours,
    selectedPkg
  };
};
