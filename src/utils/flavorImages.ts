// Flavor image mapping
export const flavorImages: Record<string, string> = {
  'Buffalo Blaze': '/images/flavors/buffalo-blaze.jpg',
  'Soy Garlic Glaze': '/images/flavors/soy-garlic-glaze.jpg',
  'Honey Butter Bliss': '/images/flavors/honey-butter-bliss.jpg',
  'Garlic Parmesan Charm': '/images/flavors/garlic-parmesan-charm.jpg',
  'Snow Cheese Magic': '/images/flavors/snow-cheese-magic.jpg',
  'Teriyaki Twist': '/images/flavors/teriyaki-twist.jpg',
  'Yangneum Heat': '/images/flavors/yangneum-heat.jpg',
  'BBQ Buzz': '/images/flavors/bbq-buzz.jpg'
};

export const getFlavorImage = (flavorName: string): string | undefined => {
  return flavorImages[flavorName];
};

// Fallback image if flavor image is not found
export const FALLBACK_FLAVOR_IMAGE = '/images/flavors/default-flavor.jpg';

