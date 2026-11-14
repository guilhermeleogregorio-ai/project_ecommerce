import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('sd_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('sd_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [selectedSeller, setSelectedSeller] = useState(() => {
    try {
      const saved = localStorage.getItem('sd_seller');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [checkoutData, setCheckoutData] = useState(() => {
    try {
      const saved = localStorage.getItem('sd_checkout');
      return saved ? JSON.parse(saved) : {
        customer: {
          name: '',
          company_name: '',
          document: '',
          phone: '',
          email: '',
          address: '',
          number: '',
          neighborhood: '',
          city: '',
          state: '',
          zip_code: ''
        },
        marketing: {
          coupon_code: '',
          notes: '',
          accept_promotions: true
        },
        payment: {
          method: 'PIX',
          terms: 'A Vista'
        }
      };
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('sd_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('sd_coupon', JSON.stringify(appliedCoupon));
  }, [appliedCoupon]);

  useEffect(() => {
    localStorage.setItem('sd_seller', JSON.stringify(selectedSeller));
  }, [selectedSeller]);

  useEffect(() => {
    localStorage.setItem('sd_checkout', JSON.stringify(checkoutData));
  }, [checkoutData]);

  const addToCart = (product, qty = 1) => {
    const quantity = Math.max(product.min_quantity || 1, qty);
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === product.id);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        return next;
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        sku: product.sku,
        price: product.promo_price || product.price,
        original_price: product.price,
        unit: product.unit,
        min_quantity: product.min_quantity || 1,
        box_quantity: product.box_quantity || 1,
        image_url: product.image_url,
        quantity: quantity
      }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const shippingFee = subtotal >= 300 || subtotal === 0 ? 0 : 25;
  const total = Math.max(0, subtotal - discount + shippingFee);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        subtotal,
        discount,
        shippingFee,
        total,
        appliedCoupon,
        setAppliedCoupon,
        selectedSeller,
        setSelectedSeller,
        checkoutData,
        setCheckoutData
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
