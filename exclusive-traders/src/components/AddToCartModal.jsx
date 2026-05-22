// src/components/AddToCartModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Package } from 'lucide-react';
import { ref, get } from "firebase/database";
import { db as mainDatabase } from "../firebase";

// Default packing costs for rice (INR per kg) – used only when product has no packing_cost
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

const AddToCartModal = ({ isOpen, onClose, product, productId, onAddToCart, industry }) => {
  const [fullProduct, setFullProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [quantity, setQuantity] = useState('');
  const [packing, setPacking] = useState('');
  const [packingOptions, setPackingOptions] = useState([]);
  const [quantityOptions, setQuantityOptions] = useState([]);
  const [packingPrice, setPackingPrice] = useState(0);    // INR for rice, USD for non-rice
  const [productPrice, setProductPrice] = useState(0);    // INR for rice, USD for non-rice
  const [totalPrice, setTotalPrice] = useState(0);
  const [isRice, setIsRice] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Determine if category is rice
  useEffect(() => {
    const rice = industry?.toLowerCase() === 'rice' || fullProduct?.categoryId === 'rice';
    setIsRice(rice);
  }, [industry, fullProduct]);

  // Fetch full product from Firebase if necessary
  useEffect(() => {
    const fetchProduct = async () => {
      if (!isOpen) return;
      if (product && (product.quantity || product.pack_type || product.packaging)) {
        setFullProduct(product);
        return;
      }
      const id = product?.id || productId;
      if (!id) {
        console.warn("AddToCartModal: No product ID provided");
        setFullProduct(product);
        return;
      }
      setIsLoading(true);
      try {
        const productRef = ref(mainDatabase, `products/${id}`);
        const snapshot = await get(productRef);
        if (snapshot.exists()) {
          setFullProduct({ id, ...snapshot.val() });
        } else {
          setFullProduct(product);
        }
      } catch (err) {
        console.error("Failed to fetch product for cart:", err);
        setFullProduct(product);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [isOpen, product, productId]);

  // Build packing options
  useEffect(() => {
    if (!fullProduct) return;

    let packTypes = [];
    if (Array.isArray(fullProduct.pack_type)) {
      packTypes = fullProduct.pack_type;
    } else if (typeof fullProduct.pack_type === 'string') {
      packTypes = [fullProduct.pack_type];
    } else if (fullProduct.pack_type) {
      packTypes = [String(fullProduct.pack_type)];
    } else {
      packTypes = ['Standard Pack'];
    }

    const opts = packTypes.map(type => ({
      value: type,
      label: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    }));
    setPackingOptions(opts);
    if (opts.length > 0 && !packing) {
      setPacking(opts[0].value);
    }
  }, [fullProduct]);

  // ==================== QUANTITY OPTIONS ====================
  const getRiceQuantityOptions = () => {
    if (!fullProduct) return [];
    const quantityData = fullProduct.quantity;
    if (!quantityData) return [];

    if (typeof quantityData === 'object' && !Array.isArray(quantityData)) {
      const keys = Object.keys(quantityData).sort((a, b) => {
        const numA = parseFloat(a);
        const numB = parseFloat(b);
        return numA - numB;
      });
      return keys.map(key => ({ value: key, label: key }));
    }

    if (Array.isArray(quantityData)) {
      const validItems = quantityData.filter(item => item.pack_size || item.size || item.quantity);
      const items = validItems.map(item => {
        const size = item.pack_size || item.size || item.quantity;
        return { value: size, label: size };
      });
      items.sort((a, b) => {
        const numA = parseFloat(a.value);
        const numB = parseFloat(b.value);
        return numA - numB;
      });
      return items;
    }
    return [];
  };

  const getRicePriceInr = () => {
    if (!fullProduct || !quantity) return 0;
    const quantityData = fullProduct.quantity;
    if (!quantityData) return 0;

    if (typeof quantityData === 'object' && !Array.isArray(quantityData)) {
      const price = quantityData[quantity];
      return price ? parseFloat(price) : 0;
    }
    if (Array.isArray(quantityData)) {
      const matchedItem = quantityData.find(item => 
        (item.pack_size === quantity) || (item.size === quantity) || (item.quantity === quantity)
      );
      if (matchedItem) {
        return parseFloat(matchedItem.price || matchedItem.price_inr || 0);
      }
    }
    return 0;
  };

  // Build quantity dropdown
  useEffect(() => {
    if (!fullProduct) return;

    if (isRice) {
      const opts = getRiceQuantityOptions();
      if (opts.length > 0) {
        setQuantityOptions(opts);
        if (!quantity || !opts.find(opt => opt.value === quantity)) {
          setQuantity(opts[0].value);
        }
      } else {
        const fallback = ["5kg", "10kg", "25kg", "50kg"].map(v => ({ value: v, label: v }));
        setQuantityOptions(fallback);
        if (!quantity) setQuantity(fallback[0].value);
      }
    } else {
      // Non‑rice: single option showing packaging specification
      const unitsPerCarton = fullProduct.packaging?.units_per_carton || 1;
      const weightMl = fullProduct.packaging?.unit_weight_ml;
      const weightG = fullProduct.packaging?.unit_weight_g;
      const unitLabel = weightMl ? 'ml' : (weightG ? 'g' : 'units');
      const unitValue = weightMl || weightG || '';
      
      let label = `${unitsPerCarton} × ${unitValue} ${unitLabel} / carton`;
      if (!unitValue) label = `${unitsPerCarton} units / carton`;
      
      const opts = [{ value: "1", label }];
      setQuantityOptions(opts);
      if (!quantity) setQuantity("1");
    }
  }, [isRice, fullProduct]);

  // Helper: extract numeric kg from quantity string (e.g., "5kg" -> 5)
  const extractQuantityKg = (qtyStr) => {
    if (!qtyStr) return 0;
    const match = qtyStr.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  // ==================== IMPROVED PACKING COST RETRIEVAL ====================
  const getRicePackingPerKgInr = () => {
    if (!isRice || !packing || !quantity) return 0;

    // 1. Try to get from product's packing_cost
    if (fullProduct?.packing_cost) {
      // Normalize packing name: to lowercase, replace spaces with underscores
      let packingKey = packing.toLowerCase().trim();
      // Also create a version with underscores instead of spaces (common in DB)
      let packingKeyUnderscore = packingKey.replace(/\s+/g, '_');
      
      // Quantity variations: original string (e.g., "5kg"), and numeric kg (e.g., "5")
      const qtyLower = quantity.toLowerCase().trim();
      const numericKg = extractQuantityKg(quantity).toString();

      const possiblePackKeys = [packingKey, packingKeyUnderscore];
      const possibleQtyKeys = [qtyLower, numericKg];

      for (const pKey of possiblePackKeys) {
        const packCostObj = fullProduct.packing_cost[pKey];
        if (packCostObj && typeof packCostObj === 'object') {
          for (const qKey of possibleQtyKeys) {
            const cost = packCostObj[qKey];
            if (cost !== undefined && cost !== null) {
              const costNum = parseFloat(cost);
              if (!isNaN(costNum)) {
                return costNum; // INR per kg
              }
            }
          }
        }
      }
    }

    // 2. Fallback to default packing costs (INR per kg)
    const normalizedPacking = packing.toLowerCase().trim();
    let defaultInr = 0;
    for (const [key, cost] of Object.entries(DEFAULT_RICE_PACKING_COST_INR)) {
      if (normalizedPacking.includes(key) || key.includes(normalizedPacking)) {
        defaultInr = cost;
        break;
      }
    }
    if (defaultInr === 0 && packing) defaultInr = 2; // fallback fallback
    return defaultInr;
  };

  // Calculate product price and packing cost
  useEffect(() => {
    if (!fullProduct || !packing || !quantity) return;

    let basePrice = 0;
    let packCost = 0;

    if (isRice) {
      // Rice: all values in INR
      basePrice = getRicePriceInr();
      const perKgInr = getRicePackingPerKgInr();
      const kg = extractQuantityKg(quantity);
      packCost = perKgInr * kg;
    } else {
      // Non‑rice: USD
      const pricePerCarton = parseFloat(
        fullProduct["Ex-Mill_usd"] || 
        fullProduct.price_usd_per_carton || 
        fullProduct.fob_price_usd || 
        (typeof fullProduct.price === 'object' ? fullProduct.price?.value : fullProduct.price) || 
        0
      );
      const cartonCount = parseFloat(quantity);
      if (!isNaN(cartonCount)) {
        basePrice = pricePerCarton * cartonCount;
      }
      packCost = 0;
    }

    setProductPrice(basePrice);
    setPackingPrice(packCost);
    setTotalPrice(basePrice + packCost);
  }, [isRice, fullProduct, packing, quantity]);

  const handleAddToCart = () => {
    if (!packing) {
      alert('Please select packing');
      return;
    }
    if (!quantity) {
      alert('Please select quantity');
      return;
    }

    let numericQuantity = 0;
    let selectedPackSize = null;

    if (isRice) {
      const match = quantity.match(/^(\d+(?:\.\d+)?)/);
      if (match) numericQuantity = parseFloat(match[1]);
      selectedPackSize = quantity;
    } else {
      numericQuantity = parseFloat(quantity);
      if (isNaN(numericQuantity)) numericQuantity = 1;
      selectedPackSize = null;
    }

    if (numericQuantity <= 0) {
      alert('Please select a valid quantity');
      return;
    }

    const selectedPackingObj = packingOptions.find(p => p.value === packing);
    const packingDisplay = selectedPackingObj ? selectedPackingObj.label : packing;

    const cartItem = {
      productId: fullProduct.id || fullProduct._id,
      name: fullProduct.name,
      image: fullProduct.imageUrl || fullProduct.image,
      selectedPacking: packingDisplay,
      packingPrice: packingPrice,
      quantity: 1,
      packSize: selectedPackSize,
      unitPrice: productPrice,
      totalPrice: totalPrice,
      grade: fullProduct.grade || (fullProduct.grades?.[0]?.grade) || 'Standard',
      industry: industry,
      brand: fullProduct.brandName || fullProduct.companyName,
      isRice: isRice,
    };
    onAddToCart(cartItem);
    onClose();
  };

  if (!isOpen) return null;
  if (isLoading) {
    return (
      <div className="cart-modal-overlay">
        <div className="cart-modal-container" style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
          <div>Loading product details...</div>
        </div>
      </div>
    );
  }
  if (!fullProduct) return null;

  const getProductImage = () => {
    if (imageError) return null;
    return fullProduct.imageUrl || fullProduct.image || null;
  };

  const companyName = fullProduct.companyName || '';
  const brandName = fullProduct.brandName || '';
  const productOrigin = fullProduct.origin || 'Thailand';
  const productImage = getProductImage();

  const selectedQuantityLabel = () => {
    const opt = quantityOptions.find(opt => opt.value === quantity);
    return opt ? opt.label : quantity;
  };

  const riceKg = isRice ? extractQuantityKg(quantity) : 0;
  const ricePackingPerKgInr = isRice ? getRicePackingPerKgInr() : 0;
  
  // Convert INR to USD for display
  const exchangeRate = 90.5;
  const displayProductPrice = isRice ? productPrice / exchangeRate : productPrice;
  const displayPackingPrice = isRice ? packingPrice / exchangeRate : packingPrice;
  const displayTotalPrice = isRice ? totalPrice / exchangeRate : totalPrice;
  const displayRicePackingPerKg = isRice ? ricePackingPerKgInr / exchangeRate : 0;
  const currencySymbol = '$';

  return (
    <div className="cart-modal-overlay">
      <div className="cart-modal-container">
        <button className="cart-modal-close" onClick={onClose}>
          <X size={22} />
        </button>

        <div className="cart-modal-header">
          <div className="product-info-row">
            {productImage && (
              <div className="product-image-wrapper">
                <img
                  src={productImage}
                  alt={fullProduct.name}
                  className="product-image"
                  onError={() => setImageError(true)}
                />
              </div>
            )}
            <div className="product-details">
              <h2 className="product-name">{fullProduct.name}</h2>
              <div className="product-meta">
                {companyName && (
                  <div className="meta-item">
                    <span className="meta-label">Company:</span>
                    <span className="meta-value">{companyName}</span>
                  </div>
                )}
                {brandName && brandName !== companyName && (
                  <div className="meta-item">
                    <span className="meta-label">Brand:</span>
                    <span className="meta-value">{brandName}</span>
                  </div>
                )}
                <div className="meta-item">
                  <span className="meta-label">Origin:</span>
                  <span className="meta-value">{productOrigin}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="cart-modal-body">
          {/* Packing Dropdown */}
          <div className="form-field">
            <label className="field-label">
              <Package size={16} />
              <span>Select Packing *</span>
            </label>
            <select
              value={packing}
              onChange={(e) => setPacking(e.target.value)}
              className="field-select"
            >
              {packingOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity Dropdown */}
          <div className="form-field">
            <label className="field-label">Select Quantity *</label>
            <select value={quantity} onChange={(e) => setQuantity(e.target.value)} className="field-select">
              {quantityOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div className="field-hint">
              {isRice ? 'Pack size in kilograms (kg)' : 'Single carton configuration'}
            </div>
          </div>

          {/* Selected Options Summary */}
          <div className="selected-summary">
            <h4>Selected Options</h4>
            {brandName && brandName !== companyName && (
              <div className="summary-row">
                <span className="summary-label">Brand:</span>
                <span className="summary-value">{brandName}</span>
              </div>
            )}
            <div className="summary-row">
              <span className="summary-label">Packing:</span>
              <span className="summary-value">{packingOptions.find(p => p.value === packing)?.label || packing}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Quantity:</span>
              <span className="summary-value">{selectedQuantityLabel()}</span>
            </div>

            {isRice ? (
              <>
                <div className="summary-row">
                  <span className="summary-label">Product Price ({quantity}):</span>
                  <span className="summary-value">{currencySymbol}{displayProductPrice.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Packing Cost:</span>
                  <span className="summary-value">
                    {currencySymbol}{displayRicePackingPerKg.toFixed(2)}/kg × {riceKg}kg = {currencySymbol}{displayPackingPrice.toFixed(2)}
                  </span>
                </div>
                <div className="summary-row total-row">
                  <span className="summary-label total-label">Total:</span>
                  <span className="summary-value total-value">{currencySymbol}{displayTotalPrice.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <div className="summary-row total-row">
                <span className="summary-label total-label">Total Amount:</span>
                <span className="summary-value total-value">{currencySymbol}{displayTotalPrice.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="cart-modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-add" onClick={handleAddToCart}>Add to Cart</button>
        </div>
      </div>

      <style>{`
        /* styles remain exactly as before, unchanged */
        .cart-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1200;
          animation: fadeIn 0.25s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .cart-modal-container {
          background: linear-gradient(145deg, #1e293b, #0f172a);
          border-radius: 28px;
          border: 1px solid rgba(0, 245, 200, 0.4);
          width: 90%;
          max-width: 560px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(0, 245, 200, 0.1);
          animation: slideUp 0.35s cubic-bezier(0.2, 0.9, 0.4, 1.1);
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .cart-modal-close {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.08);
          border: none;
          border-radius: 50%;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #cbd5e1;
          transition: all 0.2s;
          z-index: 10;
          backdrop-filter: blur(4px);
        }
        .cart-modal-close:hover {
          background: #ef4444;
          color: white;
          transform: rotate(90deg);
          box-shadow: 0 0 12px rgba(239, 68, 68, 0.5);
        }
        .cart-modal-header {
          padding: 28px 28px 20px;
          border-bottom: 1px solid rgba(0, 245, 200, 0.2);
          background: radial-gradient(circle at 50% 0%, rgba(0, 245, 200, 0.05), transparent);
        }
        .product-info-row {
          display: flex;
          gap: 20px;
          align-items: center;
          flex-wrap: wrap;
        }
        .product-image-wrapper {
          width: 100px;
          height: 100px;
          flex-shrink: 0;
          background: #ffffff;
          border-radius: 20px;
          padding: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 245, 200, 0.2);
        }
        .product-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        .product-details {
          flex: 1;
          min-width: 180px;
        }
        .product-name {
          font-size: 1.4rem;
          font-weight: 700;
          margin: 0 0 12px;
          color: #f1f5f9;
          letter-spacing: -0.3px;
          line-height: 1.3;
        }
        .product-meta {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .meta-item {
          display: flex;
          gap: 8px;
          font-size: 0.85rem;
        }
        .meta-label {
          color: #94a3b8;
          font-weight: 500;
          min-width: 60px;
        }
        .meta-value {
          color: #00F5C8;
          font-weight: 600;
          text-shadow: 0 0 3px rgba(0, 245, 200, 0.3);
        }
        .cart-modal-body {
          padding: 24px 28px;
        }
        .form-field {
          margin-bottom: 28px;
        }
        .field-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #cbd5e1;
          margin-bottom: 10px;
        }
        .field-select {
          width: 100%;
          padding: 12px 16px;
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 16px;
          color: #f1f5f9;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .field-select:hover,
        .field-select:focus {
          border-color: #00F5C8;
          outline: none;
          box-shadow: 0 0 0 3px rgba(0, 245, 200, 0.2);
          background: #0f172a;
        }
        .field-hint {
          font-size: 0.7rem;
          color: #64748b;
          margin-top: 8px;
        }
        .selected-summary {
          background: rgba(0, 245, 200, 0.06);
          border-radius: 20px;
          padding: 20px;
          margin-bottom: 0;
          border: 1px solid rgba(0, 245, 200, 0.2);
          backdrop-filter: blur(4px);
        }
        .selected-summary h4 {
          font-size: 0.9rem;
          font-weight: 700;
          margin: 0 0 14px 0;
          color: #00F5C8;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          font-size: 0.9rem;
          border-bottom: 1px dashed rgba(255, 255, 255, 0.05);
        }
        .summary-row:last-child {
          border-bottom: none;
        }
        .summary-label {
          color: #94a3b8;
          font-weight: 500;
        }
        .summary-value {
          color: #f1f5f9;
          font-weight: 500;
        }
        .total-row {
          margin-top: 8px;
          padding-top: 12px;
          border-top: 2px solid rgba(0, 245, 200, 0.4);
          border-bottom: none;
        }
        .total-label {
          font-weight: 700;
          color: #00F5C8;
        }
        .total-value {
          font-weight: 800;
          color: #00F5C8;
          font-size: 1.1rem;
        }
        .cart-modal-footer {
          display: flex;
          gap: 16px;
          padding: 20px 28px 28px;
          border-top: 1px solid rgba(0, 245, 200, 0.2);
          background: rgba(0, 0, 0, 0.2);
        }
        .btn-cancel,
        .btn-add {
          flex: 1;
          padding: 14px;
          border-radius: 40px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.25s ease;
          text-align: center;
        }
        .btn-cancel {
          background: rgba(30, 41, 59, 0.9);
          border: 1px solid #475569;
          color: #f1f5f9;
        }
        .btn-cancel:hover {
          background: #334155;
          transform: translateY(-2px);
          border-color: #64748b;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        .btn-add {
          background: linear-gradient(135deg, #00F5C8, #0ea5e9);
          border: none;
          color: #0f172a;
          box-shadow: 0 4px 14px rgba(0, 245, 200, 0.35);
          position: relative;
          overflow: hidden;
        }
        .btn-add::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s;
        }
        .btn-add:hover::before {
          left: 100%;
        }
        .btn-add:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 245, 200, 0.5);
        }
        @media (max-width: 550px) {
          .product-info-row {
            flex-direction: column;
            text-align: center;
          }
          .product-image-wrapper {
            margin: 0 auto;
          }
          .meta-item {
            justify-content: center;
          }
          .cart-modal-header {
            padding: 20px;
          }
          .cart-modal-body {
            padding: 20px;
          }
          .cart-modal-footer {
            padding: 16px 20px 24px;
            flex-direction: column;
            gap: 12px;
          }
          .summary-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
          }
          .product-name {
            font-size: 1.2rem;
          }
          .total-value {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AddToCartModal;