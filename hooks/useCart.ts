import { useState, useEffect, useCallback } from 'react';
import { ApiService } from '../services/api';
import { CartDto, CartItemDto } from '../types';

export const useCart = () => {
  const [cart, setCart] = useState<CartDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getCart();
      setCart(data);
    } catch (error) {
      console.error("Failed to fetch cart", error);
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = useCallback(async (productId: number, quantity: number) => {
    if (quantity <= 0) return;
    
    setLoading(true);
    setError(null);
    try {
      await ApiService.addToCart(productId, quantity);
      await refreshCart();
      return true;
    } catch (error) {
      console.error("Failed to add to cart", error);
      setError('Failed to add item to cart');
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshCart]);

  const updateItemQuantity = useCallback(async (itemId: number, quantity: number) => {
    if (quantity <= 0) return;
    
    setLoading(true);
    setError(null);
    try {
      await ApiService.updateCartItem(itemId, quantity);
      await refreshCart();
      return true;
    } catch (error) {
      console.error("Failed to update item", error);
      setError('Failed to update quantity');
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshCart]);

  const removeFromCart = useCallback(async (itemId: number) => {
    setLoading(true);
    setError(null);
    try {
      await ApiService.removeCartItem(itemId);
      await refreshCart();
      return true;
    } catch (error) {
      console.error("Failed to remove item", error);
      setError('Failed to remove item');
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshCart]);

  const clearCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Implement clear cart API call if available
      // For now, remove all items individually
      if (cart?.items.length) {
        await Promise.all(cart.items.map(item => removeFromCart(item.itemId)));
      }
      return true;
    } catch (error) {
      console.error("Failed to clear cart", error);
      setError('Failed to clear cart');
      return false;
    } finally {
      setLoading(false);
    }
  }, [cart?.items, removeFromCart]);

  const getTotalItems = useCallback(() => {
    return cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;
  }, [cart]);

  const isInCart = useCallback((productId: number) => {
    return cart?.items.some(item => item.productId === productId) || false;
  }, [cart]);

  const getItemQuantity = useCallback((productId: number) => {
    const item = cart?.items.find(item => item.productId === productId);
    return item?.quantity || 0;
  }, [cart]);

  return {
    cart,
    loading,
    error,
    refreshCart,
    addToCart,
    updateItemQuantity,
    removeFromCart,
    clearCart,
    getTotalItems,
    isInCart,
    getItemQuantity,
  };
};
