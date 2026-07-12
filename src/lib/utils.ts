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
  if (pkg.type === 'HOUR' && pkg.limitValue) {
    const val = parseFloat(pkg.limitValue);
    if (!isNaN(val) && val > 0) return val;
  }
  const lowerName = pkg.name.toLowerCase();
  const numMatch = lowerName.match(/(\d+(\.\d+)?)/);
  if (numMatch) {
    const num = parseFloat(numMatch[0]);
    if (lowerName.includes('day')) {
      return num * 24;
    }
    if (lowerName.includes('hour') || lowerName.includes('hr')) {
      return num;
    }
  }
  return 24;
};

export const calculatePackagePricing = (
  packages: any[],
  hours: number
): PackageDecompositionResult => {
  const allowedPkgs = (packages || []).filter(
    pkg => pkg.name === '12 Hours' || pkg.name === '24 Hours'
  );

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
