import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [refreshTimeout, setRefreshTimeout] = useState(null);
  const { isAuthenticated, user } = useAuth();

  // Function to fetch cart data
  const fetchCart = useCallback(async () => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/cart`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data.success) {
          // Transform the API response to match our expected format
          const transformedItems = response.data.data.map(item => ({
            id: item.id,
            product_id: item.product_variants.products.id,
            variant_id: item.product_variants.id,
            name: item.product_variants.products.name,
            description: item.product_variants.products.description,
            price: Number(item.product_variants.price),
            image_url: item.product_variants.products.image_url,
            color: item.product_variants.color,
            size: item.product_variants.size,
            edition: item.product_variants.edition,
            quantity: item.quantity,
            stock_qty: item.product_variants.stock_qty
          }));
          
          setCartItems(transformedItems);
          setCartTotal(response.data.total || 0);
          const count = transformedItems.reduce((sum, item) => sum + item.quantity, 0);
          setItemCount(count);
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
        // If there's an error fetching from API, use local storage as fallback
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          setCartItems(parsedCart.items || []);
          setCartTotal(parsedCart.total || 0);
          
          const count = parsedCart.items ? 
            parsedCart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
          setItemCount(count);
        }
      } finally {
        setLoading(false);
      }
    } else {
      // If not authenticated, use localStorage
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart.items || []);
        setCartTotal(parsedCart.total || 0);
        
        const count = parsedCart.items ? 
          parsedCart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
        setItemCount(count);
      }
    }
  }, [isAuthenticated, user]);

  // Fetch cart on auth change
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Public method to refresh cart data
  const refreshCart = useCallback(() => {
    // Prevent multiple refreshes in quick succession
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
    }
    
    // Only allow refresh every 500ms
    const timeoutId = setTimeout(() => {
      fetchCart();
      setRefreshTimeout(null);
    }, 500);
    
    setRefreshTimeout(timeoutId);
    
    // Clear timeout on unmount
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [fetchCart, refreshTimeout]);

  // Save cart to localStorage for non-authenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      // Calculate total
      const newTotal = cartItems.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0);
      
      setCartTotal(newTotal);
      
      // Calculate item count
      const newCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      setItemCount(newCount);
      
      localStorage.setItem('cart', JSON.stringify({
        items: cartItems,
        total: newTotal
      }));
    }
  }, [cartItems, isAuthenticated]);

  // Add item to cart
  const addToCart = async (item, quantity = 1) => {
    if (!item || !item.variant_id) {
      console.error('Cannot add item to cart: missing variant_id');
      return;
    }

    if (isAuthenticated) {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/cart`,
          { 
            variant_id: item.variant_id,
            quantity
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (response.data.success) {
          // Refresh cart from API to ensure consistency
          const cartResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/cart`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (cartResponse.data.success) {
            const transformedItems = cartResponse.data.data.map(item => ({
              id: item.id,
              product_id: item.product_variants.products.id,
              variant_id: item.product_variants.id,
              name: item.product_variants.products.name,
              description: item.product_variants.products.description,
              price: Number(item.product_variants.price),
              image_url: item.product_variants.products.image_url,
              color: item.product_variants.color,
              size: item.product_variants.size,
              edition: item.product_variants.edition,
              quantity: item.quantity,
              stock_qty: item.product_variants.stock_qty
            }));
            
            setCartItems(transformedItems);
            setCartTotal(cartResponse.data.total || 0);
            const count = transformedItems.reduce((sum, item) => sum + item.quantity, 0);
            setItemCount(count);
          }
        }
        
        return response.data.success;
      } catch (error) {
        console.error('Error adding to cart:', error);
        return false;
      }
    } else {
      // For non-authenticated users, handle cart in localStorage
      const existingItem = cartItems.find(cartItem => 
        cartItem.variant_id === item.variant_id);
      
      if (existingItem) {
        // Update quantity if item exists
        setCartItems(prevItems => 
          prevItems.map(cartItem => 
            cartItem.variant_id === item.variant_id
              ? { ...cartItem, quantity: cartItem.quantity + quantity }
              : cartItem
          )
        );
      } else {
        // Add new item
        setCartItems(prevItems => [
          ...prevItems, 
          { 
            ...item,
            quantity
          }
        ]);
      }
      
      return true;
    }
  };

  // Update item quantity
  const updateCartItemQuantity = async (itemId, quantity) => {
    if (quantity < 1) return false;
    
    if (isAuthenticated) {
      try {
        const response = await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/api/cart/${itemId}`,
          { quantity },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (response.data.success) {
          // Refresh the entire cart to ensure consistency
          const cartResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/cart`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (cartResponse.data.success) {
            const transformedItems = cartResponse.data.data.map(item => ({
              id: item.id,
              product_id: item.product_variants.products.id,
              variant_id: item.product_variants.id,
              name: item.product_variants.products.name,
              description: item.product_variants.products.description,
              price: Number(item.product_variants.price),
              image_url: item.product_variants.products.image_url,
              color: item.product_variants.color,
              size: item.product_variants.size,
              edition: item.product_variants.edition,
              quantity: item.quantity,
              stock_qty: item.product_variants.stock_qty
            }));
            
            setCartItems(transformedItems);
            setCartTotal(cartResponse.data.total || 0);
            const count = transformedItems.reduce((sum, item) => sum + item.quantity, 0);
            setItemCount(count);
          }
        }
        
        return response.data.success;
      } catch (error) {
        console.error('Error updating cart:', error);
        return false;
      }
    } else {
      // For non-authenticated users
      setCartItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId ? { ...item, quantity } : item
        )
      );
      return true;
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    if (isAuthenticated) {
      try {
        const response = await axios.delete(
          `${import.meta.env.VITE_API_BASE_URL}/api/cart/${itemId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (response.data.success) {
          setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
          
          // Update total
          const newTotal = cartItems
            .filter(item => item.id !== itemId)
            .reduce((sum, item) => sum + (item.price * item.quantity), 0);
          
          setCartTotal(newTotal);
          const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
          setItemCount(count);
        }
        
        return response.data.success;
      } catch (error) {
        console.error('Error removing from cart:', error);
        return false;
      }
    } else {
      // For non-authenticated users
      setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
      return true;
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        // Ideally, you would have an API endpoint for this
        // For now, remove items one by one
        const promises = cartItems.map(item => 
            axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/cart/${item.id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          })
        );
        
        await Promise.all(promises);
        setCartItems([]);
        setCartTotal(0);
        setItemCount(0);
        return true;
      } catch (error) {
        console.error('Error clearing cart:', error);
        return false;
      }
    } else {
      // For non-authenticated users
      setCartItems([]);
      setCartTotal(0);
      setItemCount(0);
      localStorage.removeItem('cart');
      return true;
    }
  };

  const value = {
    cartItems,
    cartTotal,
    loading,
    itemCount,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    refreshCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext; 