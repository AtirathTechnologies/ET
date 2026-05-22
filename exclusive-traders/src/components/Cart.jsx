// src/components/Cart.jsx
import React, { useState, useEffect } from 'react';
import { useCart } from './CartContext';
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft, Home } from 'lucide-react';
import CheckoutModal from './CheckOutModal';
import { database, ref, get } from '../firebase';

const Cart = () => {
  const { cartItems, loading, removeFromCart, updateQuantity, getCartTotal, clearCart, user } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completeProfile, setCompleteProfile] = useState(null);

  // Fetch user profile from Firebase
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setCompleteProfile(null);
        return;
      }
      try {
        const usersRef = ref(database, 'users');
        const usersSnapshot = await get(usersRef);
        let userData = null;
        if (usersSnapshot.exists()) {
          const users = usersSnapshot.val();
          const foundUser = Object.values(users).find(
            u => (u.email && user.email && u.email.toLowerCase() === user.email.toLowerCase()) || u.uid === user.uid
          );
          if (foundUser) userData = foundUser;
        }
        if (!userData) {
          const vendorsRef = ref(database, 'vendors');
          const vendorsSnapshot = await get(vendorsRef);
          if (vendorsSnapshot.exists()) {
            const vendors = vendorsSnapshot.val();
            const foundVendor = Object.values(vendors).find(
              v => (v.email && user.email && v.email.toLowerCase() === user.email.toLowerCase()) || v.uid === user.uid
            );
            if (foundVendor) userData = foundVendor;
          }
        }
        
        // Fallback to localStorage if still no userData
        if (!userData) {
          try {
            const stored = localStorage.getItem('current_user') || localStorage.getItem('currentUser');
            if (stored) {
              const parsed = JSON.parse(stored);
              if (parsed.email && user.email && parsed.email.toLowerCase() === user.email.toLowerCase()) {
                userData = parsed;
              }
            }
          } catch (e) {}
        }
        setCompleteProfile({
          uid: user.uid,
          name: user.displayName || userData?.name || "",
          email: user.email || "",
          phone: userData?.phone || "",
          country: userData?.country || userData?.address?.country || "",
          state: userData?.state || userData?.address?.state || "",
          city: userData?.city || userData?.address?.city || "",
          pincode: userData?.pincode || userData?.address?.pincode || "",
          ...(userData || {})
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        setCompleteProfile(null);
      }
    };
    fetchUserProfile();
  }, [user]);

  const exchangeRate = 90.5;
  const productsTotal = cartItems.reduce((sum, item) => {
    const price = item.isRice ? item.unitPrice / exchangeRate : item.unitPrice;
    return sum + (price * item.quantity);
  }, 0);
  const totalPackingCost = cartItems.reduce((sum, item) => {
    const packPrice = item.packingPrice || 0;
    const price = item.isRice ? packPrice / exchangeRate : packPrice;
    return sum + (price * item.quantity);
  }, 0);
  const subtotal = productsTotal + totalPackingCost;
  const cartSymbol = '$';
  const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  // Direct navigation to Industries page (full page reload)
  const goToIndustries = () => {
    window.location.href = '/industries';
  };
  
  // If we are still loading and have NO items (not even cached ones), stay blank
  if (loading && !cartItems.length) return null;

  // Only show the "Empty Cart" message if we are done loading and there really are no items
  if (!loading && !cartItems.length) {
    return (
      <div className="cart-empty-container">
        <div className="cart-empty-nav">
          <button onClick={() => window.history.back()} className="nav-back-btn">
            <ArrowLeft size={16} /> Back
          </button>
          <button onClick={() => window.location.href = '/home'} className="nav-home-btn">
            <Home size={16} style={{ marginRight: '4px' }} /> Home
          </button>
        </div>

        <div className="cart-empty-card">
          <ShoppingCart size={80} strokeWidth={1.2} className="cart-empty-icon" />
          <h2 className="cart-empty-title">Your Cart is Empty</h2>
          <p className="cart-empty-subtitle">Looks like you haven't added any products yet.</p>
          <button onClick={goToIndustries} className="browse-products-btn">
            Browse Products
          </button>
        </div>

        <style jsx>{`
          .cart-empty-container {
            max-width: 1200px;
            margin: 80px auto 0px;
            padding: 0 24px;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          main {
            min-height: auto !important;
          }
          .cart-empty-nav {
            display: flex;
            justify-content: space-between;
            width: 100%;
            max-width: 800px;
            margin-bottom: 20px;
          }
          .nav-back-btn, .nav-home-btn {
            background: none;
            border: none;
            color: #94a3b8;
            font-size: 0.95rem;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 6px;
            cursor: pointer;
            transition: color 0.2s, transform 0.2s;
          }
          .nav-back-btn:hover, .nav-home-btn:hover {
            color: #00F5C8;
            transform: translateY(-1px);
            text-shadow: 0 0 8px rgba(0, 245, 200, 0.4);
          }
          .cart-empty-card {
            padding: 40px 20px 20px 20px;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            max-width: 800px;
            width: 100%;
          }
          .cart-empty-icon {
            color: #475569;
            margin-bottom: 24px;
            filter: drop-shadow(0 0 8px rgba(71, 85, 105, 0.2));
          }
          .cart-empty-title {
            font-size: 2.2rem;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 12px;
            font-family: 'Inter', sans-serif;
          }
          .cart-empty-subtitle {
            font-size: 1.05rem;
            color: #94a3b8;
            margin-bottom: 32px;
            font-family: 'Inter', sans-serif;
          }
          .browse-products-btn {
            background: #00F5C8;
            color: #0f172a;
            font-size: 1rem;
            font-weight: 700;
            padding: 14px 36px;
            border-radius: 30px;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 245, 200, 0.2);
            font-family: 'Inter', sans-serif;
          }
          .browse-products-btn:hover {
            background: #00d4aa;
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 245, 200, 0.4);
          }
          @media (max-width: 640px) {
            .cart-empty-card {
              padding: 40px 20px;
            }
            .cart-empty-title {
              font-size: 1.8rem;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <div className="cart-page">
        <h1>Shopping Cart</h1>

        <div className="cart-layout">
          {/* LEFT: Cart Items */}
          <div className="cart-items-section">
            <div className="cart-items">
              {cartItems.map(item => {
                const itemTotal = item.totalPrice;
                const unitPrice = item.unitPrice;
                const hasValidPrice = itemTotal > 0;

                return (
                  <div key={item.id} className="cart-item">
                    <img
                      src={item.image || 'https://via.placeholder.com/80?text=Product'}
                      alt={item.name}
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=No+Image'; }}
                    />
                    <div className="item-details">
                      <h3>{item.name}</h3>
                      <p className="item-meta">
                        {item.selectedPacking} {item.selectedGrade ? `| Grade: ${item.selectedGrade}` : ''}
                        {item.packingPrice > 0 && ` | Packing Fee: $${(item.isRice ? item.packingPrice / exchangeRate : item.packingPrice).toFixed(2)}`}
                      </p>
                      <div className="quantity-control">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <Minus size={16} />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="item-price-row">
                        <span className="unit-price-label">Unit price:</span>
                        <span className="unit-price-value">
                          {hasValidPrice ? `$${(item.isRice ? unitPrice / exchangeRate : unitPrice).toFixed(2)}` : 'Contact for Price'}
                        </span>
                      </div>
                    </div>
                    <div className="item-total-remove">
                      <div className="item-total">
                        {hasValidPrice ? `$${(item.isRice ? itemTotal / exchangeRate : itemTotal).toFixed(2)}` : 'Contact for Price'}
                      </div>
                      <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cart-action-buttons">
              <button className="clear-cart" onClick={clearCart}>Clear Cart</button>
              <button onClick={goToIndustries} className="continue-shopping">Continue Shopping</button>
            </div>
          </div>

          <div className="order-summary">
            <h2>Order Summary</h2>
            
            <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '20px', paddingRight: '10px' }} className="summary-items-scroll">
              {cartItems.map((item, idx) => {
                const symbol = '$';
                const displayUnitPrice = item.isRice ? item.unitPrice / exchangeRate : item.unitPrice;
                const displayPackingPrice = item.isRice ? (item.packingPrice || 0) / exchangeRate : (item.packingPrice || 0);
                
                if (item.isRice) {
                  return (
                    <div key={item.id || idx} style={{ marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'flex-start' }}>
                        <div style={{ flex: '1', minWidth: '80px' }}>
                          <div style={{ fontWeight: 'bold', color: '#f1f5f9', fontSize: '1.05rem', lineHeight: '1.2' }}>{item.name}</div>
                          <div style={{ color: '#00F5C8', fontWeight: 'bold', marginTop: '6px' }}>{symbol}{(displayUnitPrice * item.quantity).toFixed(2)}</div>
                        </div>
                        <div style={{ flex: '1.5', color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', padding: '0 8px' }}>
                          {item.quantity} × {item.packSize} @ {symbol}{displayUnitPrice.toFixed(2)} / pack
                        </div>
                        <div style={{ flex: '1', color: '#64748b', fontSize: '0.85rem', textAlign: 'right' }}>
                          Packing:<br/> <span style={{ color: '#94a3b8' }}>{item.selectedPacking}</span>
                        </div>
                      </div>
                      {item.packingPrice > 0 && (
                        <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '10px 15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                          <span style={{ color: '#f59e0b', fontSize: '0.9rem' }}>Packing Cost:</span>
                          <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{symbol}{(displayPackingPrice * item.quantity).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  );
                } else {
                  return (
                    <div key={item.id || idx} className="summary-line items-count" style={{ marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px' }}>
                      <span>{item.name} ({item.quantity} {item.unit || 'units'})</span>
                      <span>{symbol}{(item.unitPrice * item.quantity).toFixed(2)}</span>
                    </div>
                  );
                }
              })}
            </div>

            <div style={{ borderTop: '1px solid #334155', paddingTop: '20px' }}>
              <div className="summary-line">
                <span>Products Total</span>
                <span>{cartSymbol}{productsTotal.toFixed(2)}</span>
              </div>
              {totalPackingCost > 0 && (
                <div className="summary-line" style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '10px 15px', borderRadius: '8px', color: '#f59e0b', margin: '12px 0' }}>
                  <span>Packing Cost</span>
                  <span>+ {cartSymbol}{totalPackingCost.toFixed(2)}</span>
                </div>
              )}
              <div className="summary-line subtotal" style={{ marginTop: '16px' }}>
                <span>Subtotal</span>
                <span>{cartSymbol}{subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-line shipping">
                <span>Shipping</span>
                <span style={{ color: '#00F5C8', fontSize: '0.85rem' }}>Calculated at checkout</span>
              </div>
              <div className="summary-line total">
                <span>Total</span>
                <span>{cartSymbol}{subtotal.toFixed(2)}</span>
              </div>
            </div>
            <button className="checkout-btn" onClick={() => setIsCheckoutOpen(true)}>
              {user ? 'Proceed to Checkout' : 'Guest Checkout'}
            </button>
            {!user && (
              <p className="guest-checkout-text">
                Or <span style={{ color: '#00F5C8', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => window.location.href='/signin'}>Sign In</span> to save your order history
              </p>
            )}
          </div>
        </div>

        <style jsx>{`
          .cart-page {
            max-width: 1400px;
            margin: 80px auto 40px;
            padding: 20px;
            background: #0f172a;
            border-radius: 16px;
            color: white;
          }
          h1 {
            color: #00F5C8;
            margin-bottom: 20px;
            font-size: 1.8rem;
          }
          .cart-layout {
            display: flex;
            gap: 30px;
            flex-wrap: wrap;
          }
          .cart-items-section {
            flex: 2;
            min-width: 280px;
          }
          .order-summary {
            flex: 1;
            min-width: 260px;
            background: #1e293b;
            border-radius: 16px;
            padding: 24px;
            height: fit-content;
            position: sticky;
            top: 100px;
            border: 1px solid rgba(0, 245, 200, 0.2);
          }
          .order-summary h2 {
            font-size: 1.4rem;
            margin-bottom: 24px;
            color: #00F5C8;
            border-bottom: 1px solid #334155;
            padding-bottom: 8px;
          }
          .summary-line {
            display: flex;
            justify-content: space-between;
            margin-bottom: 16px;
            color: #cbd5e1;
            font-size: 1rem;
          }
          .summary-line.items-count {
            font-weight: 500;
          }
          .summary-line.subtotal {
            margin-top: 8px;
          }
          .summary-line.shipping {
            margin-bottom: 16px;
            border-bottom: 1px solid #334155;
            padding-bottom: 16px;
          }
          .summary-line.total {
            font-size: 1.3rem;
            font-weight: bold;
            color: #00F5C8;
            margin-top: 8px;
            margin-bottom: 24px;
          }
          .checkout-btn {
            width: 100%;
            background: #00F5C8;
            color: #0f172a;
            border: none;
            padding: 12px;
            border-radius: 40px;
            font-weight: bold;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.2s;
            margin-bottom: 12px;
          }
          .checkout-btn:hover {
            background: #0ea5e9;
            transform: translateY(-2px);
          }
          .guest-checkout-text {
            text-align: center;
            color: #94a3b8;
            font-size: 0.85rem;
            margin-top: 12px;
          }
          .cart-items {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }
          .cart-item {
            display: flex;
            gap: 16px;
            background: #1e293b;
            padding: 16px;
            border-radius: 12px;
            align-items: center;
            flex-wrap: wrap;
          }
          .cart-item img {
            width: 80px;
            height: 80px;
            object-fit: contain;
            background: white;
            border-radius: 8px;
            padding: 4px;
          }
          .item-details {
            flex: 2;
          }
          .item-details h3 {
            margin: 0 0 6px 0;
            color: #00F5C8;
            font-size: 1.1rem;
          }
          .item-meta {
            font-size: 0.85rem;
            color: #94a3b8;
            margin-bottom: 8px;
          }
          .quantity-control {
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 8px 0;
          }
          .quantity-control button {
            background: #334155;
            border: none;
            padding: 4px 10px;
            border-radius: 6px;
            cursor: pointer;
            color: white;
          }
          .item-price-row {
            display: flex;
            gap: 12px;
            font-size: 0.9rem;
            color: #cbd5e1;
          }
          .unit-price-value {
            font-weight: 500;
          }
          .item-total-remove {
            text-align: right;
            min-width: 100px;
          }
          .item-total {
            font-weight: bold;
            color: #00F5C8;
            font-size: 1.1rem;
            margin-bottom: 8px;
          }
          .remove-btn {
            background: none;
            border: none;
            color: #ef4444;
            cursor: pointer;
            padding: 6px;
            border-radius: 6px;
            transition: 0.2s;
          }
          .remove-btn:hover {
            background: rgba(239, 68, 68, 0.1);
          }
          .cart-action-buttons {
            display: flex;
            gap: 12px;
            margin-top: 24px;
            justify-content: flex-start;
            flex-wrap: wrap;
          }
          .clear-cart {
            background: #ef4444;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 30px;
            cursor: pointer;
            font-weight: 600;
          }
          .continue-shopping {
            background: transparent;
            border: 1px solid #00F5C8;
            color: #00F5C8;
            padding: 10px 20px;
            border-radius: 30px;
            text-decoration: none;
            font-weight: 600;
            transition: 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            cursor: pointer;
          }
          .continue-shopping:hover {
            background: rgba(0, 245, 200, 0.1);
            transform: translateY(-2px);
          }

          @media (max-width: 768px) {
            .cart-layout {
              flex-direction: column;
            }
            .order-summary {
              position: static;
              margin-top: 20px;
            }
            .cart-item {
              flex-direction: column;
              text-align: center;
            }
            .item-total-remove {
              text-align: center;
            }
            .quantity-control {
              justify-content: center;
            }
            .cart-action-buttons {
              justify-content: center;
            }
          }
        `}</style>
      </div>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        profile={completeProfile}
        onRemoveItem={removeFromCart}
        currencyRates={{ USD: 1, INR: 83.5, AED: 3.67, GBP: 0.79, EUR: 0.92, SAR: 3.75, OMR: 0.38, KWD: 0.31, QAR: 3.64, MYR: 4.70, SGD: 1.35, AUD: 1.52, CAD: 1.36, THB: 35.80, TRY: 32.50, ZAR: 18.90 }}
        currencySymbols={{ USD: "$", INR: "₹", AED: "د.إ", GBP: "£", EUR: "€", SAR: "ر.س", OMR: "ر.ع.", KWD: "ك.د", QAR: "ر.ق", MYR: "RM", SGD: "S$", AUD: "A$", CAD: "C$", THB: "฿", TRY: "₺", ZAR: "R" }}
        selectedCurrency="USD"
      />
    </>
  );
};

export default Cart;