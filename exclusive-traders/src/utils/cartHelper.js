// src/utils/cartHelper.js

export const formatProductToCartItem = (product, categoryId, categoryName) => {
  if (!product) return null;

  const isRice = categoryId === 'rice' || 
                 product.categoryId === 'rice' || 
                 (categoryName && categoryName.toLowerCase().includes('rice')) ||
                 (product.category && product.category.toLowerCase().includes('rice'));

  // 1. Determine selected packing
  let selectedPacking = 'Standard Pack';
  if (isRice) {
    if (product.pack_type && Array.isArray(product.pack_type) && product.pack_type.length > 0) {
      selectedPacking = product.pack_type[0].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    } else if (product.pack_type && typeof product.pack_type === 'string') {
      selectedPacking = product.pack_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    } else {
      selectedPacking = 'PP Bags';
    }
  } else {
    if (product.pack_type && Array.isArray(product.pack_type) && product.pack_type.length > 0) {
      selectedPacking = product.pack_type[0];
    } else if (product.pack_type && typeof product.pack_type === 'string') {
      selectedPacking = product.pack_type;
    } else if (product.packaging) {
      if (typeof product.packaging === 'object') {
        selectedPacking = product.packaging.type || 'Standard Pack';
      } else {
        selectedPacking = product.packaging;
      }
    }
  }

  // 2. Determine quantity options and select default quantity size
  let packSize = null;
  if (isRice) {
    if (product.quantity && typeof product.quantity === 'object' && !Array.isArray(product.quantity)) {
      const keys = Object.keys(product.quantity).sort((a, b) => parseFloat(a) - parseFloat(b));
      if (keys.length > 0) {
        packSize = keys[0];
      }
    } else if (product.quantity && Array.isArray(product.quantity) && product.quantity.length > 0) {
      const first = product.quantity[0];
      packSize = first.pack_size || first.size || first.quantity || '5kg';
    } else {
      packSize = '5kg';
    }
  } else {
    const unitsPerCarton = product.packaging?.units_per_carton || 1;
    const weightMl = product.packaging?.unit_weight_ml;
    const weightG = product.packaging?.unit_weight_g;
    const unitLabel = weightMl ? 'ml' : (weightG ? 'g' : 'units');
    const unitValue = weightMl || weightG || '';
    packSize = unitValue ? `${unitsPerCarton} × ${unitValue} ${unitLabel} / carton` : `${unitsPerCarton} units / carton`;
  }

  // 3. Determine unit price (INR for rice, USD for non-rice)
  let unitPrice = 0;
  if (isRice) {
    if (product.quantity && typeof product.quantity === 'object' && !Array.isArray(product.quantity)) {
      unitPrice = parseFloat(product.quantity[packSize] || 0);
    } else if (product.quantity && Array.isArray(product.quantity)) {
      const matchedItem = product.quantity.find(item => 
        (item.pack_size === packSize) || (item.size === packSize) || (item.quantity === packSize)
      );
      if (matchedItem) {
        unitPrice = parseFloat(matchedItem.price || matchedItem.price_inr || 0);
      }
    }
  } else {
    unitPrice = parseFloat(
      product["Ex-Mill_usd"] || 
      product.price_usd_per_carton || 
      product.fob_price_usd || 
      (typeof product.price === 'object' ? product.price?.value : product.price) || 
      0
    );
  }

  // 4. Determine packing price
  let packingPrice = 0;
  if (isRice && selectedPacking && packSize) {
    const extractQuantityKg = (qtyStr) => {
      if (!qtyStr) return 0;
      const match = qtyStr.match(/(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    };

    const getRicePackingPerKgInr = () => {
      // Try to get from product's packing_cost
      if (product.packing_cost) {
        let packingKey = selectedPacking.toLowerCase().trim();
        let packingKeyUnderscore = packingKey.replace(/\s+/g, '_');
        const qtyLower = packSize.toLowerCase().trim();
        const numericKg = extractQuantityKg(packSize).toString();

        const possiblePackKeys = [packingKey, packingKeyUnderscore];
        const possibleQtyKeys = [qtyLower, numericKg];

        for (const pKey of possiblePackKeys) {
          const packCostObj = product.packing_cost[pKey];
          if (packCostObj && typeof packCostObj === 'object') {
            for (const qKey of possibleQtyKeys) {
              const cost = packCostObj[qKey];
              if (cost !== undefined && cost !== null) {
                const costNum = parseFloat(cost);
                if (!isNaN(costNum)) {
                  return costNum;
                }
              }
            }
          }
        }
      }

      // Default fallbacks
      const DEFAULT_RICE_PACKING_COST_INR = {
        "pp bags": 2,
        "non-woven bags": 3,
        "jute bags": 5,
        "bopp bags": 2.5,
        "ldpe bags": 2,
        "hdpe bags": 2,
        "vacuum packed": 4,
        "paper bags": 3,
        "bulk packaging": 1,
        "custom packaging": 6,
        "non": 4,
        "non woven": 3,
      };
      const normalizedPacking = selectedPacking.toLowerCase().trim();
      let defaultInr = 0;
      for (const [key, cost] of Object.entries(DEFAULT_RICE_PACKING_COST_INR)) {
        if (normalizedPacking.includes(key) || key.includes(normalizedPacking)) {
          defaultInr = cost;
          break;
        }
      }
      if (defaultInr === 0 && selectedPacking) defaultInr = 2;
      return defaultInr;
    };

    const perKgInr = getRicePackingPerKgInr();
    const kg = extractQuantityKg(packSize);
    packingPrice = perKgInr * kg;
  }

  const totalPrice = unitPrice + packingPrice;

  return {
    productId: product.id || product._id,
    name: product.name,
    image: product.imageUrl || product.image,
    selectedPacking: selectedPacking,
    packingPrice: packingPrice,
    quantity: 1, // multiplier
    packSize: packSize,
    unitPrice: unitPrice,
    totalPrice: totalPrice,
    grade: product.grade || (product.grades?.[0]?.grade) || 'Standard',
    industry: categoryName || categoryId,
    brand: product.brandName || product.companyName || 'General',
    isRice: isRice,
  };
};
