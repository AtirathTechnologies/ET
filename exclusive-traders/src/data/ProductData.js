// ProductData.js - Centralized helper functions only
// All product data (packing, quantity) must be fetched from Firebase.
// Transport data has been moved to TransportPage.jsx.

// ============================================
// RICE PACKING OPTIONS - Empty; fetch from Firebase
// ============================================
export const ricePackingOptions = [];

// ============================================
// QUANTITY OPTIONS - No static data; compute from Firebase product.quantity
// ============================================

export const getQuantityOptionsForProduct = (product) => {
  if (!product) return [];
  if (product.quantity && typeof product.quantity === 'object' && Object.keys(product.quantity).length > 0) {
    return Object.keys(product.quantity).map(key => ({
      value: key,
      label: key,
      multiplier: 1,
      unit: 'pack',
      actualQuantity: 1,
      actualUnit: 'pack'
    }));
  }
  return [];
};

export const getQuantityUnit = (product) => {
  if (!product) return 'units';
  if (product.quantity && typeof product.quantity === 'object' && Object.keys(product.quantity).length > 0) {
    const firstKey = Object.keys(product.quantity)[0];
    const match = firstKey.match(/(kg|g|ml|l|liter|carton|unit|piece)$/i);
    if (match) return match[1].toLowerCase();
    return 'pack';
  }
  return 'units';
};

// ============================================
// HELPER FUNCTIONS (keep as is, they don't contain data)
// ============================================

export const getPackingUnit = (packingValue) => {
  if (!packingValue) return "unit";
  const packingLower = packingValue.toLowerCase();
  if (packingLower.includes('box') || packingLower.includes('case')) return "box";
  if (packingLower.includes('bag') || packingLower.includes('pouch') || packingLower.includes('sack')) return "bag";
  if (packingLower.includes('bottle') || packingLower.includes('jar') || packingLower.includes('vial')) return "bottle";
  if (packingLower.includes('can') || packingLower.includes('tin') || packingLower.includes('drum')) return "can";
  if (packingLower.includes('crate') || packingLower.includes('pallet')) return "crate";
  if (packingLower.includes('wrap') || packingLower.includes('foil') || packingLower.includes('cellophane')) return "wrap";
  if (packingLower.includes('set') || packingLower.includes('pack') || packingLower.includes('multi-pack')) return "set";
  if (packingLower.includes('bundle') || packingLower.includes('coil')) return "bundle";
  return "unit";
};

export const getUnitType = (productType, productName = '') => {
  if (productType === 'construction') {
    if (productName.includes('cement') || productName.includes('steel') || 
        productName.includes('sand') || productName.includes('gravel') || 
        productName.includes('aggregate')) return 'kg';
    else if (productName.includes('brick') || productName.includes('block') || 
               productName.includes('tile') || productName.includes('slab')) return 'piece';
  }
  const unitTypeMap = {
    oil: 'liter', rice: 'kg', pulses: 'kg', spices: 'kg', dryfruits: 'kg',
    tea: 'kg', fruits: 'kg', vegetables: 'kg', chocolate: 'kg', beverages: 'liter',
    gadgets: 'piece', clothing: 'piece', perfume: 'piece', flowers: 'piece', default: 'kg'
  };
  return unitTypeMap[productType] || 'kg';
};