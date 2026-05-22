// src/components/CheckoutModal.jsx
import React, { useState, useEffect, useRef } from "react";
import ThankYouPopup from "./ThankYouPopup";
import { submitQuote } from "../firebase";
import { Minus, Plus, X, Trash2 } from 'lucide-react';

const CURRENCY_CONFIG = {
  baseCurrency: "USD",
  rates: {
    INR: 90.5, USD: 1, AED: 3.67, AUD: 1.52, CAD: 1.36,
    EUR: 0.92,    // Matches cart page rate
    KWD: 0.31, MYR: 4.70, OMR: 0.38, QAR: 3.64, SAR: 3.75, SGD: 1.35,
    THB: 35.80, TRY: 32.50,
    ZAR: 18.70    // ← already correct for your cart page
  },
  symbols: {
    USD: "$", AED: "د.إ", AUD: "A$", CAD: "C$", EUR: "€", INR: "₹",
    KWD: "ك.د", MYR: "RM", OMR: "ر.ع.", QAR: "ر.ق", SAR: "ر.س", SGD: "S$",
    THB: "฿", TRY: "₺", ZAR: "R"
  }
};

const CheckoutModal = ({ 
  isOpen, 
  onClose, 
  cartItems, 
  profile, 
  onOrderSubmitted,
  onRemoveItem,
  currencyRates: propCurrencyRates,
  currencySymbols: propCurrencySymbols,
  selectedCurrency: propSelectedCurrency
}) => {
  // Inject global CSS to remove top spacing from cart page (only once)
  useEffect(() => {
    if (!document.getElementById("cart-spacing-fix")) {
      const style = document.createElement("style");
      style.id = "cart-spacing-fix";
      style.textContent = `
        .shopping-cart, .cart-page, .cart-container, .cart-wrapper,
        [class*="cart"]:first-child, main > div:first-child,
        #root > div:first-child > div:first-child {
          margin-top: 0 !important;
          padding-top: 0 !important;
        }
        .cart-header, .cart-title, .cart-banner {
          margin-top: 0 !important;
          padding-top: 0 !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const currencyRates = propCurrencyRates || CURRENCY_CONFIG.rates;
  const currencySymbols = propCurrencySymbols || CURRENCY_CONFIG.symbols;

  // Form state (all original)
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [brandingRequired, setBrandingRequired] = useState("No");
  const [transportType, setTransportType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  // Dynamically set default currency based on cart items or propSelectedCurrency
  useEffect(() => {
    if (isOpen) {
      if (propSelectedCurrency) {
        setSelectedCurrency(propSelectedCurrency);
      } else {
        setSelectedCurrency("USD"); // Default to USD for all products including rice
      }
    }
  }, [isOpen, propSelectedCurrency]);
  const [orderQuantities, setOrderQuantities] = useState({});
  const [pickupLocation, setPickupLocation] = useState({ city: "", state: "", country: "" });
  const [deliveryLocation, setDeliveryLocation] = useState({ city: "", state: "", country: "" });
  const [vehicleType, setVehicleType] = useState("");
  const [airportOfLoading, setAirportOfLoading] = useState({ country: "", airportName: "" });
  const [airportOfDestination, setAirportOfDestination] = useState({ country: "", airportName: "" });
  const [portOfLoading, setPortOfLoading] = useState({ country: "", state: "", portName: "" });
  const [portOfDestination, setPortOfDestination] = useState({ country: "", state: "", portName: "" });

  // Currency list with INR first (restored)
  const availableCurrencies = (() => {
    const all = Object.keys(currencyRates).map(code => ({ code, symbol: currencySymbols[code] || code }));
    const inr = all.find(c => c.code === "INR");
    const others = all.filter(c => c.code !== "INR");
    return [inr, ...others];
  })();

  const countryOptions = [
    { value: "+91", flag: "🇮🇳", name: "India", length: 10 },
    { value: "+1", flag: "🇺🇸", name: "USA", length: 10 },
    { value: "+44", flag: "🇬🇧", name: "UK", length: 10 },
    { value: "+971", flag: "🇦🇪", name: "UAE", length: 9 },
    { value: "+61", flag: "🇦🇺", name: "Australia", length: 9 },
    { value: "+966", flag: "🇸🇦", name: "Saudi Arabia", length: 9 },
    { value: "+968", flag: "🇴🇲", name: "Oman", length: 8 },
    { value: "+965", flag: "🇰🇼", name: "Kuwait", length: 8 },
    { value: "+974", flag: "🇶🇦", name: "Qatar", length: 8 },
    { value: "+60", flag: "🇲🇾", name: "Malaysia", length: 9 },
    { value: "+65", flag: "🇸🇬", name: "Singapore", length: 8 },
    { value: "+66", flag: "🇹🇭", name: "Thailand", length: 9 },
    { value: "+90", flag: "🇹🇷", name: "Turkey", length: 10 },
    { value: "+27", flag: "🇿🇦", name: "South Africa", length: 9 }
  ];

  const vehicleOptions = [
    { value: "truck", label: "Truck" },
    { value: "container_truck", label: "Container Truck" },
    { value: "mini_truck", label: "Mini Truck" }
  ];

  const convertFromUSD = (amountInUSD) => {
    if (typeof amountInUSD !== 'number' || isNaN(amountInUSD)) return 0;
    const rate = currencyRates[selectedCurrency];
    return rate ? amountInUSD * rate : amountInUSD;
  };

  const getItemUnitPriceUSD = (item) => {
    // The base price in the cart already represents the entire pack/carton configuration.
    // For rice, prices are stored in INR. We convert them to USD.
    const rawPackPrice = (item.unitPrice ?? item.price ?? item.productPrice ?? 0) + (item.packingPrice ?? 0);
    if (item.isRice) {
      return rawPackPrice / (currencyRates["INR"] || 90.5);
    }
    return rawPackPrice;
  };

  const getItemPriceDisplay = (item) => {
    const usdPrice = getItemUnitPriceUSD(item);
    const converted = convertFromUSD(usdPrice);
    const symbol = currencySymbols[selectedCurrency] || (selectedCurrency === "INR" ? "₹" : "$");
    const unitLabel = item.selectedQuantity || item.packSize || (item.unit || 'pack');
    return `${symbol}${converted.toFixed(2)} / ${unitLabel}`;
  };

  const getItemTotal = (item, orderQty = 1) => {
    const usdPricePerPack = getItemUnitPriceUSD(item);
    const totalUSD = usdPricePerPack * orderQty;
    return convertFromUSD(totalUSD);
  };

  const getSelectedQuantityDisplay = (item) => {
    if (item.isRice && item.packSize) return item.packSize;
    if (item.selectedQuantity) return item.selectedQuantity;
    if (item.quantity) return `${item.quantity} ${item.unit || 'units'}`;
    return '1 unit';
  };

  useEffect(() => {
    if (isOpen && cartItems.length) {
      const initial = {};
      cartItems.forEach((item, idx) => { initial[idx] = item.quantity || 1; });
      setOrderQuantities(initial);
    }
  }, [isOpen, cartItems]);

  useEffect(() => {
    if (isOpen) {
      let activeProfile = profile || {};
      
      // If profile from props lacks data, try localStorage fallback immediately
      if (!activeProfile.country && !activeProfile.address?.country) {
        try {
          const stored = localStorage.getItem('current_user') || localStorage.getItem('currentUser');
          if (stored) {
             const parsed = JSON.parse(stored);
             activeProfile = { ...parsed, ...activeProfile };
          }
        } catch (e) {}
      }

      setFullName(activeProfile.fullName || activeProfile.displayName || activeProfile.name || "");
      setEmail(activeProfile.email || "");
      setCountry(activeProfile.country || activeProfile.address?.country || "");
      setState(activeProfile.state || activeProfile.address?.state || "");
      setCity(activeProfile.city || activeProfile.address?.city || "");
      setPincode(activeProfile.pincode || activeProfile.address?.pincode || "");
      setPhoneNumber(activeProfile.phone ? activeProfile.phone.toString().replace(/\D/g, "").slice(-10) : "");
    }
  }, [isOpen, profile]);

  const getCartSubtotal = () => cartItems.reduce((sum, item, idx) => sum + getItemTotal(item, orderQuantities[idx] || item.quantity || 1), 0);
  const getTotalQuantity = () => cartItems.reduce((sum, item, idx) => {
    return sum + (orderQuantities[idx] || item.quantity || 1);
  }, 0);

  const getProductsSubtotal = () => {
    return cartItems.reduce((sum, item, idx) => {
      const rawPrice = (item.unitPrice ?? item.price ?? item.productPrice ?? 0);
      const usdPrice = item.isRice ? (rawPrice / (currencyRates["INR"] || 90.5)) : rawPrice;
      const orderQty = orderQuantities[idx] || item.quantity || 1;
      return sum + convertFromUSD(usdPrice * orderQty);
    }, 0);
  };

  const getTotalPackingCost = () => {
    return cartItems.reduce((sum, item, idx) => {
      const packingPrice = item.packingPrice ?? 0;
      const usdPackingPrice = item.isRice ? (packingPrice / (currencyRates["INR"] || 90.5)) : packingPrice;
      const orderQty = orderQuantities[idx] || item.quantity || 1;
      return sum + convertFromUSD(usdPackingPrice * orderQty);
    }, 0);
  };

  const calculateTransportCost = () => {
    if (!transportType) return 0;
    const totalQty = getTotalQuantity();
    const baseRatesUSD = { road: 5, air: 50, ocean: 15 };
    const rateUSD = baseRatesUSD[transportType] || 0;
    return convertFromUSD(rateUSD * totalQty);
  };

  const transportCost = calculateTransportCost();
  const brandingCostUSD = brandingRequired === "Yes" ? 35 * cartItems.length : 0;
  const brandingCost = convertFromUSD(brandingCostUSD);
  const subtotal = getCartSubtotal();
  const finalTotal = subtotal + transportCost + brandingCost;
  const symbol = currencySymbols[selectedCurrency] || (selectedCurrency === "INR" ? "₹" : "$");

  const validatePhone = (num, code) => {
    const opt = countryOptions.find(c => c.value === code);
    const len = opt?.length || 10;
    if (!num) setPhoneError("Phone required");
    else if (num.length !== len) setPhoneError(`Must be ${len} digits`);
    else if (!/^\d+$/.test(num)) setPhoneError("Only digits");
    else setPhoneError("");
  };

  const validateEmail = (mail) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!mail) setEmailError("Email required");
    else if (!re.test(mail)) setEmailError("Invalid email");
    else setEmailError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    if (!fullName || !email || !country || !state || !city || !pincode || !transportType || !brandingRequired) {
      alert("Please fill all required fields");
      return;
    }
    if (transportType === 'road' && (!pickupLocation.city || !pickupLocation.state || !pickupLocation.country || !deliveryLocation.city || !deliveryLocation.state || !deliveryLocation.country)) {
      alert("Please fill pickup and delivery locations for road transport");
      return;
    }
    if (transportType === 'air' && (!airportOfLoading.country || !airportOfLoading.airportName || !airportOfDestination.country || !airportOfDestination.airportName)) {
      alert("Please fill airport details");
      return;
    }
    if (transportType === 'ocean' && (!portOfLoading.country || !portOfLoading.state || !portOfLoading.portName || !portOfDestination.country || !portOfDestination.state || !portOfDestination.portName)) {
      alert("Please fill port details");
      return;
    }
    validatePhone(phoneNumber, countryCode);
    validateEmail(email);
    if (phoneError || emailError) {
      alert("Please fix phone/email errors");
      return;
    }

    setIsSubmitting(true);
    const fullPhone = `${countryCode}${phoneNumber}`;
    let transportDetails = {};
    if (transportType === 'road') transportDetails = { transportType, pickupLocation, deliveryLocation, vehicleType };
    else if (transportType === 'air') transportDetails = { transportType, airportOfLoading, airportOfDestination };
    else transportDetails = { transportType, portOfLoading, portOfDestination };

    const quoteData = {
      name: fullName, email, phone: fullPhone,
      address: { country, state, city, pincode },
      cartItems: cartItems.map((item, idx) => ({
        ...item,
        orderQuantity: orderQuantities[idx] || 1,
        unitPriceUSD: getItemUnitPriceUSD(item),
        totalPriceUSD: getItemTotal(item, orderQuantities[idx] || 1) / (currencyRates[selectedCurrency] || 1),
        totalPriceConverted: getItemTotal(item, orderQuantities[idx] || 1)
      })),
      itemCount: cartItems.length, totalQuantity: getTotalQuantity(),
      subtotal, transportCost, brandingCost, brandingRequired, transportDetails, additionalInfo,
      currency: selectedCurrency, timestamp: Date.now(), readableDate: new Date().toLocaleString(),
      userId: profile?.uid || "guest", source: "cart_checkout", status: "new"
    };

    try {
      const res = await submitQuote(quoteData);
      if (!res.success) {
        throw new Error(res.error || "Failed to submit quote");
      }
      const quoteId = res.quoteId;
      let transportMsg = "";
      if (transportType === 'road') transportMsg = `- Transport: Road\n- Pickup: ${pickupLocation.city}, ${pickupLocation.state}, ${pickupLocation.country}\n- Delivery: ${deliveryLocation.city}, ${deliveryLocation.state}, ${deliveryLocation.country}`;
      else if (transportType === 'air') transportMsg = `- Transport: Air Freight\n- Airport of Loading: ${airportOfLoading.airportName}, ${airportOfLoading.country}\n- Airport of Destination: ${airportOfDestination.airportName}, ${airportOfDestination.country}`;
      else if (transportType === 'ocean') transportMsg = `- Transport: Ocean Freight\n- Port of Loading: ${portOfLoading.portName}, ${portOfLoading.state}, ${portOfLoading.country}\n- Port of Destination: ${portOfDestination.portName}, ${portOfDestination.state}, ${portOfDestination.country}`;

      const itemLines = cartItems.map((item, idx) => {
        const qty = orderQuantities[idx] || 1;
        const packSize = item.selectedQuantity || item.quantity || 1;
        const totalPrice = getItemTotal(item, qty);
        return `${idx+1}. ${item.name} - ${packSize} ${item.isRice ? 'kg' : 'units'} x ${qty} = ${symbol}${totalPrice.toFixed(2)}`;
      }).join('\n');

      const message = `Hello! I want a quote for my cart (${cartItems.length} items):
- Name: ${fullName}
- Email: ${email}
- Phone: ${fullPhone}
- Address: ${city}, ${state}, ${country} - ${pincode}

Items:
${itemLines}

${transportMsg}
- Branding Required: ${brandingRequired}
- Est. Subtotal: ${symbol}${subtotal.toFixed(2)}
- Transport Cost: ${symbol}${transportCost.toFixed(2)}
${brandingRequired === "Yes" ? `- Branding Cost: ${symbol}${brandingCost.toFixed(2)}` : ''}
- Final Total: ${symbol}${finalTotal.toFixed(2)}
- Quote ID: ${quoteId}
${additionalInfo ? `- Additional Info: ${additionalInfo}` : ''}
Thank you!`;
      window.open(`https://wa.me/+919703744571?text=${encodeURIComponent(message)}`, "_blank");
      setShowThankYou(true);
      if (onOrderSubmitted) onOrderSubmitted(quoteId);
    } catch (err) {
      console.error(err);
      setSubmitError("Failed to submit quote. Please try again.");
      alert("Error submitting quote. Check console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleThankYouClose = () => {
    setShowThankYou(false);
    onClose();
  };

  const incQty = (idx) => setOrderQuantities(prev => ({ ...prev, [idx]: (prev[idx] || 1) + 1 }));
  const decQty = (idx) => setOrderQuantities(prev => ({ ...prev, [idx]: Math.max(1, (prev[idx] || 1) - 1) }));

  if (!isOpen) return null;

  return (
    <>
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
        zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'auto', padding: '10px'
      }}>
        <div style={{
          backgroundColor: '#0f172a', borderRadius: '28px', border: '1px solid rgba(0,245,200,0.4)',
          width: '100%', maxWidth: '1200px', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
          overflow: 'hidden', position: 'relative'
        }}>
          <button onClick={onClose} style={{
            position: 'absolute', top: '8px', right: '12px',
            background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
            width: '32px', height: '32px', cursor: 'pointer', color: '#f1f5f9', zIndex: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}><X size={18} /></button>

           {/* Header - Zero top padding */}
           <div style={{ padding: '0 24px', borderBottom: '1px solid rgba(0,245,200,0.2)' }}>
             <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#00F5C8', margin: '12px 0 4px' }}>
               {profile && (profile.uid || profile.email) ? 'Checkout' : 'Guest Checkout'} ({cartItems.length} Items)
             </h2>
             <p style={{ color: '#94a3b8', margin: '0 0 12px' }}>Review your cart and submit a quote request</p>
           </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '12px 24px' }}>
            <div style={{ display: 'flex', gap: '24px', flexDirection: window.innerWidth <= 768 ? 'column' : 'row' }}>
              {/* Left Column - Full form */}
              <div style={{ flex: 1.5, minWidth: 0 }}>
                <form onSubmit={handleSubmit}>
                  {/* Currency Selector - INR first */}
                  <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <select value={selectedCurrency} onChange={(e) => setSelectedCurrency(e.target.value)} style={{ background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155', borderRadius: '8px', padding: '4px 8px', fontSize: '0.85rem', width: '100px' }}>
                      {availableCurrencies.map(curr => <option key={curr.code} value={curr.code}>{curr.symbol} {curr.code}</option>)}
                    </select>
                  </div>

                  {/* Products Section - Full details (heritage, brand, origin, packing) */}
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#f1f5f9', marginBottom: '16px', borderBottom: '2px solid #00F5C8', display: 'inline-block', paddingBottom: '4px' }}>Your Items</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {cartItems.map((item, idx) => {
                        const orderQty = orderQuantities[idx] || 1;
                        const total = getItemTotal(item, orderQty);
                        const pricePerUnit = getItemPriceDisplay(item);
                        const selectedQtyDisplay = getSelectedQuantityDisplay(item);
                        return (
                          <div key={item.id || idx} style={{ background: '#1e293b', borderRadius: '20px', padding: '16px', border: '1px solid rgba(0,245,200,0.15)' }}>
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                              <div style={{ flexShrink: 0 }}>
                                <img src={item.image || 'https://via.placeholder.com/80'} alt={item.name} style={{ width: '70px', height: '70px', objectFit: 'contain', background: '#fff', borderRadius: '12px', padding: '6px' }} />
                              </div>
                              <div style={{ flex: 2, minWidth: '200px' }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#00F5C8', marginBottom: '2px' }}>{item.name}</div>
                                {item.heritage && <div style={{ color: '#a5b4fc', fontSize: '0.8rem', marginBottom: '6px', fontStyle: 'italic' }}>{item.heritage}</div>}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '8px', fontSize: '0.8rem', color: '#cbd5e1' }}>
                                  {item.brand && <span><span style={{ color: '#94a3b8' }}>Brand:</span> {item.brand}</span>}
                                  {item.origin && <span><span style={{ color: '#94a3b8' }}>Origin:</span> {item.origin}</span>}
                                </div>
                                {item.selectedPacking && (
                                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '4px' }}>
                                    <span style={{ color: '#94a3b8' }}>Packing Modal:</span> {item.selectedPacking}
                                  </div>
                                )}
                                <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '4px' }}>
                                  <span style={{ color: '#94a3b8' }}>Selected Quantity:</span> {selectedQtyDisplay}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#f1f5f9', marginBottom: '10px' }}>{pricePerUnit}</div>
                                <div style={{ background: 'rgba(0,245,200,0.1)', display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', color: '#00F5C8' }}>
                                  Product Total ({orderQty} × {selectedQtyDisplay}): {symbol}{total.toFixed(2)}
                                </div>
                              </div>
                            </div>
                            <div style={{ borderTop: '1px solid #334155', marginTop: '14px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Order Qty:</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#0f172a', padding: '2px 10px', borderRadius: '40px', border: '1px solid #334155' }}>
                                  <button
                                    type="button"
                                    onClick={() => decQty(idx)}
                                    disabled={orderQty <= 1}
                                    style={{
                                      background: 'transparent', border: 'none',
                                      color: orderQty <= 1 ? '#334155' : '#00F5C8',
                                      cursor: orderQty <= 1 ? 'not-allowed' : 'pointer',
                                      padding: '2px'
                                    }}
                                  ><Minus size={14} /></button>
                                  <span style={{ color: '#f1f5f9', fontWeight: '500', minWidth: '28px', textAlign: 'center' }}>{orderQty}</span>
                                  <button type="button" onClick={() => incQty(idx)} style={{ background: 'transparent', border: 'none', color: '#00F5C8', cursor: 'pointer', padding: '2px' }}><Plus size={14} /></button>
                                </div>
                                {onRemoveItem && (
                                  <button
                                    type="button"
                                    onClick={() => onRemoveItem(item.id || item.cartId || idx)}
                                    title="Remove item"
                                    style={{
                                      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                                      borderRadius: '8px', color: '#ef4444', cursor: 'pointer',
                                      padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px',
                                      fontSize: '0.75rem', fontWeight: '500',
                                      transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.25)'; e.currentTarget.style.borderColor = '#ef4444'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
                                  >
                                    <Trash2 size={13} /> Delete
                                  </button>
                                )}
                              </div>
                              {item.brand && <div style={{ color: '#cbd5e1', fontSize: '0.8rem' }}><span style={{ color: '#94a3b8' }}>Brand:</span> {item.brand}</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#f1f5f9', marginBottom: '10px' }}>Contact Information</h3>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      <input type="text" placeholder="Full Name *" value={fullName} onChange={(e) => setFullName(e.target.value)} required style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#f1f5f9' }} />
                      <input type="email" placeholder="Email *" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#f1f5f9' }} />
                      {emailError && <div style={{ color: '#ef4444', fontSize: '0.8rem' }}>{emailError}</div>}
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} style={{ width: '110px', flexShrink: 0, background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#f1f5f9' }}>
                          {countryOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.flag} {opt.value}</option>)}
                        </select>
                        <input type="tel" placeholder="Phone Number *" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))} style={{ flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#f1f5f9' }} />
                      </div>
                      {phoneError && <div style={{ color: '#ef4444', fontSize: '0.8rem' }}>{phoneError}</div>}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <input type="text" placeholder="Country *" value={country} onChange={(e) => setCountry(e.target.value)} required style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#f1f5f9' }} />
                        <input type="text" placeholder="State *" value={state} onChange={(e) => setState(e.target.value)} required style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#f1f5f9' }} />
                        <input type="text" placeholder="City *" value={city} onChange={(e) => setCity(e.target.value)} required style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#f1f5f9' }} />
                        <input type="text" placeholder="Pincode *" value={pincode} onChange={(e) => setPincode(e.target.value)} required style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#f1f5f9' }} />
                      </div>
                    </div>
                  </div>

                  {/* Transport Details - Full fields */}
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#f1f5f9', marginBottom: '10px' }}>Transport Details</h3>
                    <select value={transportType} onChange={(e) => setTransportType(e.target.value)} required style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', marginBottom: '10px' }}>
                      <option value="">Select Transport Type</option>
                      <option value="road">🚛 Road Transport</option>
                      <option value="air">✈️ Air Freight</option>
                      <option value="ocean">🚢 Ocean Freight</option>
                    </select>
                    {transportType === 'road' && (
                      <>
                        <div style={{ marginBottom: '10px' }}>
                          <label style={{ color: '#cbd5e1', marginBottom: '4px', display: 'block' }}>Pickup Location *</label>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <input placeholder="City" value={pickupLocation.city} onChange={(e) => setPickupLocation({...pickupLocation, city: e.target.value})} style={{ flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px', color: '#f1f5f9' }} />
                            <input placeholder="State" value={pickupLocation.state} onChange={(e) => setPickupLocation({...pickupLocation, state: e.target.value})} style={{ flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px', color: '#f1f5f9' }} />
                            <input placeholder="Country" value={pickupLocation.country} onChange={(e) => setPickupLocation({...pickupLocation, country: e.target.value})} style={{ flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px', color: '#f1f5f9' }} />
                          </div>
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                          <label style={{ color: '#cbd5e1', marginBottom: '4px', display: 'block' }}>Delivery Location *</label>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <input placeholder="City" value={deliveryLocation.city} onChange={(e) => setDeliveryLocation({...deliveryLocation, city: e.target.value})} style={{ flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px', color: '#f1f5f9' }} />
                            <input placeholder="State" value={deliveryLocation.state} onChange={(e) => setDeliveryLocation({...deliveryLocation, state: e.target.value})} style={{ flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px', color: '#f1f5f9' }} />
                            <input placeholder="Country" value={deliveryLocation.country} onChange={(e) => setDeliveryLocation({...deliveryLocation, country: e.target.value})} style={{ flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px', color: '#f1f5f9' }} />
                          </div>
                        </div>
                        <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }}>
                          <option value="">Vehicle Type (Optional)</option>
                          {vehicleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </>
                    )}
                    {transportType === 'air' && (
                      <>
                        <div style={{ marginBottom: '10px' }}>
                          <label style={{ color: '#cbd5e1', marginBottom: '4px', display: 'block' }}>Airport of Loading *</label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input placeholder="Country" value={airportOfLoading.country} onChange={(e) => setAirportOfLoading({...airportOfLoading, country: e.target.value})} style={{ flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px', color: '#f1f5f9' }} />
                            <input placeholder="Airport Name" value={airportOfLoading.airportName} onChange={(e) => setAirportOfLoading({...airportOfLoading, airportName: e.target.value})} style={{ flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px', color: '#f1f5f9' }} />
                          </div>
                        </div>
                        <div>
                          <label style={{ color: '#cbd5e1', marginBottom: '4px', display: 'block' }}>Airport of Destination *</label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input placeholder="Country" value={airportOfDestination.country} onChange={(e) => setAirportOfDestination({...airportOfDestination, country: e.target.value})} style={{ flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px', color: '#f1f5f9' }} />
                            <input placeholder="Airport Name" value={airportOfDestination.airportName} onChange={(e) => setAirportOfDestination({...airportOfDestination, airportName: e.target.value})} style={{ flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px', color: '#f1f5f9' }} />
                          </div>
                        </div>
                      </>
                    )}
                    {transportType === 'ocean' && (
                      <>
                        <div style={{ marginBottom: '10px' }}>
                          <label style={{ color: '#cbd5e1', marginBottom: '4px', display: 'block' }}>Port of Loading *</label>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <input placeholder="Country" value={portOfLoading.country} onChange={(e) => setPortOfLoading({...portOfLoading, country: e.target.value})} style={{ flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px', color: '#f1f5f9' }} />
                            <input placeholder="State" value={portOfLoading.state} onChange={(e) => setPortOfLoading({...portOfLoading, state: e.target.value})} style={{ flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px', color: '#f1f5f9' }} />
                            <input placeholder="Port Name" value={portOfLoading.portName} onChange={(e) => setPortOfLoading({...portOfLoading, portName: e.target.value})} style={{ flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px', color: '#f1f5f9' }} />
                          </div>
                        </div>
                        <div>
                          <label style={{ color: '#cbd5e1', marginBottom: '4px', display: 'block' }}>Port of Destination *</label>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <input placeholder="Country" value={portOfDestination.country} onChange={(e) => setPortOfDestination({...portOfDestination, country: e.target.value})} style={{ flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px', color: '#f1f5f9' }} />
                            <input placeholder="State" value={portOfDestination.state} onChange={(e) => setPortOfDestination({...portOfDestination, state: e.target.value})} style={{ flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px', color: '#f1f5f9' }} />
                            <input placeholder="Port Name" value={portOfDestination.portName} onChange={(e) => setPortOfDestination({...portOfDestination, portName: e.target.value})} style={{ flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px', color: '#f1f5f9' }} />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Branding & Additional */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ color: '#cbd5e1', marginBottom: '4px', display: 'block' }}>Brand Required? *</label>
                      <select value={brandingRequired} onChange={(e) => setBrandingRequired(e.target.value)} required style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }}>
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                    <textarea placeholder="Additional Information (optional)" value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)} rows="3" style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', resize: 'vertical' }} />
                  </div>

                  {/* Buttons */}
                  <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
                    <button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #00F5C8, #0ea5e9)', border: 'none', borderRadius: '40px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', color: '#0f172a' }}>
                      {isSubmitting ? 'Submitting...' : `Place Order (${symbol}${finalTotal.toFixed(2)})`}
                    </button>
                    <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', background: '#1e293b', border: '1px solid #475569', borderRadius: '40px', fontWeight: '700', color: '#f1f5f9', cursor: 'pointer' }}>Cancel</button>
                  </div>
                  {submitError && <div style={{ color: '#ef4444', marginTop: '12px', textAlign: 'center' }}>{submitError}</div>}
                </form>
              </div>

              {/* Right Column - Summary */}
              <div style={{ flex: 1, background: 'rgba(30,41,59,0.4)', borderRadius: '20px', padding: '20px', height: 'fit-content', position: 'sticky', top: '20px' }}>
                {cartItems.length === 1 ? (
                  // Custom layout for single product order now
                  (() => {
                    const item = cartItems[0];
                    const orderQty = orderQuantities[0] || item.quantity || 1;
                    
                    const rawPrice = item.unitPrice ?? item.price ?? item.productPrice ?? 0;
                    const packingPrice = item.packingPrice ?? 0;
                    
                    const usdPrice = item.isRice ? (rawPrice / (currencyRates["INR"] || 90.5)) : rawPrice;
                    const usdPacking = item.isRice ? (packingPrice / (currencyRates["INR"] || 90.5)) : packingPrice;
                    
                    const displayProductPrice = convertFromUSD(usdPrice * orderQty);
                    const displayPackingPrice = convertFromUSD(usdPacking * orderQty);
                    
                    const extractKg = (sizeStr) => {
                      if (!sizeStr) return 1;
                      const match = sizeStr.match(/(\d+(?:\.\d+)?)/);
                      return match ? parseFloat(match[1]) : 1;
                    };
                    
                    const displayPackingCostPerKg = item.isRice && item.packSize
                      ? convertFromUSD(usdPacking) / extractKg(item.packSize)
                      : 0;

                    return (
                      <div className="price-breakdown-section">
                        <h4 className="price-breakdown-title" style={{ fontSize: '1.2rem', fontWeight: '600', color: '#00F5C8', marginBottom: '16px', textAlign: 'center' }}>
                          Estimated Bill Breakdown ({selectedCurrency})
                        </h4>
                        <div className="estimate-note" style={{ padding: '10px 15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', borderLeft: '3px solid #00F5C8', marginBottom: '20px', fontSize: '0.85rem', color: '#cbd5e1', textAlign: 'center' }}>
                          This is an estimated bill. Final pricing may vary based on actual costs and market conditions.
                        </div>
                        
                        <div className="price-breakdown-grid" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div className="price-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <span className="price-label" style={{ color: '#94a3b8' }}>Packing:</span>
                            <span className="price-value" style={{ color: '#f1f5f9', fontWeight: '500' }}>{item.selectedPacking || "N/A"}</span>
                          </div>
                          
                          {item.isRice && displayPackingPrice > 0 && (
                            <>
                              <div className="price-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <span className="price-label" style={{ color: '#94a3b8' }}>Packing Cost per kg:</span>
                                <span className="price-value" style={{ color: '#f1f5f9', fontWeight: '500' }}>{symbol}{displayPackingCostPerKg.toFixed(2)}/kg</span>
                              </div>
                              <div className="price-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <span className="price-label" style={{ color: '#94a3b8' }}>Total Packing Cost:</span>
                                <span className="price-value" style={{ color: '#f1f5f9', fontWeight: '500' }}>{symbol}{displayPackingPrice.toFixed(2)}</span>
                              </div>
                            </>
                          )}
                          
                          <div className="price-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <span className="price-label" style={{ color: '#94a3b8' }}>Quantity:</span>
                            <span className="price-value" style={{ color: '#f1f5f9', fontWeight: '500' }}>{item.packSize || "N/A"}</span>
                          </div>
                          
                          <div className="price-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <span className="price-label" style={{ color: '#94a3b8' }}>Order Quantity:</span>
                            <span className="price-value" style={{ color: '#f1f5f9', fontWeight: '500' }}>{orderQty} unit{orderQty > 1 ? 's' : ''}</span>
                          </div>
                          
                          <div className="price-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <span className="price-label" style={{ color: '#94a3b8' }}>Quantity Price:</span>
                            <span className="price-value" style={{ color: '#f1f5f9', fontWeight: '500' }}>{symbol}{displayProductPrice.toFixed(2)}</span>
                          </div>
                          
                          {transportCost > 0 && (
                            <div className="price-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <span className="price-label" style={{ color: '#94a3b8' }}>Transport Cost:</span>
                              <span className="price-value" style={{ color: '#f1f5f9', fontWeight: '500' }}>{symbol}{transportCost.toFixed(2)}</span>
                            </div>
                          )}
                          
                          {brandingCost > 0 && (
                            <div className="price-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <span className="price-label" style={{ color: '#94a3b8' }}>Branding Cost:</span>
                              <span className="price-value" style={{ color: '#f1f5f9', fontWeight: '500' }}>{symbol}{brandingCost.toFixed(2)}</span>
                            </div>
                          )}
                          
                          <div className="price-item final-total" style={{ 
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                            padding: '12px 16px', marginTop: '16px', 
                            border: '2px solid #00F5C8', borderRadius: '12px', 
                            background: 'rgba(0, 245, 200, 0.05)' 
                          }}>
                            <span className="price-label" style={{ fontWeight: '700', color: '#00F5C8' }}>Total Price:</span>
                            <span className="price-value" style={{ fontWeight: '700', color: '#00F5C8', fontSize: '1.25rem' }}>{symbol}{finalTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#00F5C8', marginBottom: '16px', textAlign: 'center' }}>Cart Summary ({cartItems.length} Items) - {selectedCurrency}</h4>
                    <div style={{ padding: '10px 15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', borderLeft: '3px solid #00F5C8', marginBottom: '20px', fontSize: '0.85rem', color: '#cbd5e1', textAlign: 'center' }}>
                      This is an estimated bill. Final pricing may vary.
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: '#94a3b8' }}>Items in Cart:</span><span style={{ color: '#f1f5f9', fontWeight: '500' }}>{cartItems.length} products</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: '#94a3b8' }}>Total Quantity:</span><span style={{ color: '#f1f5f9', fontWeight: '500' }}>{getTotalQuantity()} units</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: '#94a3b8' }}>Products Subtotal:</span><span style={{ color: '#f1f5f9', fontWeight: '500' }}>{symbol}{getProductsSubtotal().toFixed(2)}</span>
                      </div>
                      {getTotalPackingCost() > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', marginTop: '4px' }}>
                          <span style={{ color: '#f59e0b' }}>Packing Cost:</span><span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{symbol}{getTotalPackingCost().toFixed(2)}</span>
                        </div>
                      )}
                      {getTotalPackingCost() > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', marginTop: '4px' }}>
                          <span style={{ color: '#94a3b8' }}>Subtotal (inc. Packing):</span><span style={{ color: '#f1f5f9', fontWeight: '500' }}>{symbol}{subtotal.toFixed(2)}</span>
                        </div>
                      )}
                      {transportType && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <span style={{ color: '#94a3b8' }}>Transport Cost:</span><span style={{ color: '#f1f5f9', fontWeight: '500' }}>{symbol}{transportCost.toFixed(2)}</span>
                        </div>
                      )}
                      {brandingRequired === "Yes" && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <span style={{ color: '#94a3b8' }}>Branding Cost:</span><span style={{ color: '#f1f5f9', fontWeight: '500' }}>{symbol}{brandingCost.toFixed(2)}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', marginTop: '12px', borderTop: '2px solid #00F5C8' }}>
                        <span style={{ fontWeight: '700', color: '#f1f5f9' }}>Final Total:</span>
                        <span style={{ fontWeight: '700', color: '#00F5C8', fontSize: '1.2rem' }}>{symbol}{finalTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ThankYouPopup isOpen={showThankYou} onClose={handleThankYouClose} />
    </>
  );
};

export default CheckoutModal;