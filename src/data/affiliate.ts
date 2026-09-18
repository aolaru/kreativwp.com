type AffiliateLink = {
  label: string;
  href: string;
  partner: string;
};

// Add approved affiliate destinations here once their tracking URLs are available.
// Editorial content references these keys instead of duplicating URLs in page data.
export const affiliateLinks: Record<string, AffiliateLink> = {};

export function getAffiliateLink(id?: string) {
  if (!id) return undefined;
  return affiliateLinks[id];
}
