import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ApiService } from '../services/api';
import { CartDto } from '../types';

interface CartContextType {
  cart: CartDto | null;
  refreshCart: () => Promise<void>;
  loading: boolean;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateItemQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartDto | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    try {
      const data = await ApiService.getCart();
      setCart(data);
    } catch (error) {
      console.error("Failed to fetch cart", error);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId: number, quantity: number) => {
    setLoading(true);
    try {
      await ApiService.addToCart(productId, quantity);
      await refreshCart();
    } finally {
      setLoading(false);
    }
  };

  const updateItemQuantity = async (itemId: number, quantity: number) => {
    // Optimistic update could be implemented here, but simplistic for now
    try {
      await ApiService.updateCartItem(itemId, quantity);
      await refreshCart();
    } catch (error) {
      console.error("Failed to update item", error);
    }
  };

  const removeFromCart = async (itemId: number) => {
    try {
      await ApiService.removeCartItem(itemId);
      await refreshCart();
    } catch (error) {
      console.error("Failed to remove item", error);
    }
  };

  return (
    <CartContext.Provider value={{ cart, refreshCart, loading, addToCart, updateItemQuantity, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};