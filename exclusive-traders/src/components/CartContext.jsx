// src/components/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ref, set, onValue } from 'firebase/database';
import { db as mainDatabase } from '../firebase';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

// Helper to get or create a stable session ID (stored only in localStorage as a key, not the cart)
const getSessionId = () => {
  let sessionId = localStorage.getItem('cartSessionId');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('cartSessionId', sessionId);
  }
  return sessionId;
};

export const CartProvider = ({ children, user = null }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const cached = localStorage.getItem('cart_cache');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => !localStorage.getItem('cart_cache'));
  const [currentUser, setCurrentUser] = useState(user);

  // Update currentUser when prop changes
  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  // Determine the Firebase path: if user is logged in, use their UID; otherwise use session ID
  const getCartPath = () => {
    if (currentUser) return `cart/${currentUser.uid}`;
    return `cart/${getSessionId()}`;
  };

  useEffect(() => {
    // Only show loading if we don't have items to show yet
    if (cartItems.length === 0) {
      setLoading(true);
    }
    const cartRef = ref(mainDatabase, getCartPath());
    const unsubscribe = onValue(cartRef, (snapshot) => {
      const data = snapshot.val();
      const items = data?.items || [];
      setCartItems(items);
      localStorage.setItem('cart_cache', JSON.stringify(items));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]); // Re-run when user changes (login/logout)

  const saveCart = async (items) => {
    const cartRef = ref(mainDatabase, getCartPath());
    await set(cartRef, { items, updatedAt: Date.now() });
  };

  const addToCart = (item) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(
        i => i.productId === item.productId && i.selectedPacking === item.selectedPacking && i.grade === item.grade
      );
      let newItems;
      if (existingIndex !== -1) {
        const updated = [...prev];
        const existingItem = updated[existingIndex];
        const newQuantity = existingItem.quantity + item.quantity;
        const newTotalPrice = (existingItem.unitPrice + (existingItem.packingPrice || 0)) * newQuantity;
        updated[existingIndex] = { ...existingItem, quantity: newQuantity, totalPrice: newTotalPrice };
        newItems = updated;
      } else {
        newItems = [...prev, {
          ...item,
          id: Date.now(),
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          packingPrice: Number(item.packingPrice || 0),
          totalPrice: Number(item.totalPrice)
        }];
      }
      saveCart(newItems);
      return newItems;
    });
  };

  const removeFromCart = (id) => {
    setCartItems(prev => {
      const newItems = prev.filter(item => item.id !== id);
      saveCart(newItems);
      return newItems;
    });
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(prev => {
      const newItems = prev.map(item => {
        if (item.id === id) {
          const total = (item.unitPrice + (item.packingPrice || 0)) * newQuantity;
          return { ...item, quantity: newQuantity, totalPrice: total };
        }
        return item;
      });
      saveCart(newItems);
      return newItems;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    const cartRef = ref(mainDatabase, getCartPath());
    set(cartRef, null);
  };

  const getCartTotal = () => cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const getCartCount = () => cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      loading, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      getCartTotal, 
      getCartCount,
      user: currentUser  // expose user to components
    }}>
      {children}
    </CartContext.Provider>
  );
};
