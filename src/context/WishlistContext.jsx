import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();

  // Fetch wishlist from the API when authenticated
  useEffect(() => {
    const fetchWishlist = async () => {
      if (isAuthenticated) {
        try {
          setLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/wishlist`, {
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
              edition: item.product_variants.edition
            }));
            
            setWishlistItems(transformedItems);
          }
        } catch (error) {
          console.error('Error fetching wishlist:', error);
          // If there's an error fetching from API, fallback to local storage
          const savedWishlist = localStorage.getItem('wishlist');
          if (savedWishlist) {
            setWishlistItems(JSON.parse(savedWishlist));
          }
        } finally {
          setLoading(false);
        }
      } else {
        // If not authenticated, use localStorage
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
          setWishlistItems(JSON.parse(savedWishlist));
        }
      }
    };

    fetchWishlist();
  }, [isAuthenticated, user]);

  // Save wishlist to localStorage for non-authenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, isAuthenticated]);

  // Add item to wishlist
  const addToWishlist = async (item) => {
    // Check if item already exists in wishlist
    if (wishlistItems.some((wishlistItem) => 
        (wishlistItem.variant_id === item.variant_id) || 
        (wishlistItem.id === item.id))) {
      return;
    }

    if (isAuthenticated) {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/wishlist`,
          { variant_id: item.variant_id || item.id },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (response.data.success) {
          // Add the returned wishlist item
          const newItem = {
            id: response.data.data.id,
            product_id: response.data.data.product_variants.products.id,
            variant_id: response.data.data.product_variants.id,
            name: response.data.data.product_variants.products.name,
            description: response.data.data.product_variants.products.description,
            price: Number(response.data.data.product_variants.price),
            image_url: response.data.data.product_variants.products.image_url,
            color: response.data.data.product_variants.color,
            size: response.data.data.product_variants.size,
            edition: response.data.data.product_variants.edition
          };
          
          setWishlistItems(prevItems => [...prevItems, newItem]);
        }
      } catch (error) {
        console.error('Error adding to wishlist:', error);
        // Fallback for error - add to local state only
        setWishlistItems(prevItems => [...prevItems, item]);
      }
    } else {
      // For non-authenticated users, just update the state
      setWishlistItems(prevItems => [...prevItems, item]);
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (itemId) => {
    // Find the item before removing it (for authenticated users)
    const itemToRemove = wishlistItems.find(item => item.id === itemId);
    
    // Update UI immediately
    setWishlistItems(prevItems => prevItems.filter(item => item.id !== itemId));

    if (isAuthenticated && itemToRemove) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/wishlist/${itemId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      } catch (error) {
        console.error('Error removing from wishlist:', error);
        // If there's an error, revert the UI change
        setWishlistItems(prevItems => {
          if (!prevItems.some(item => item.id === itemId)) {
            return [...prevItems, itemToRemove];
          }
          return prevItems;
        });
      }
    }
  };

  // Check if item is in wishlist
  const isInWishlist = (itemId) => {
    return wishlistItems.some(item => 
      item.id === itemId || 
      item.variant_id === itemId || 
      item.product_id === itemId
    );
  };

  // Clear all items from wishlist
  const clearWishlist = () => {
    // For authenticated users, this would require multiple API calls
    // In a real app, you might want a dedicated endpoint for this
    setWishlistItems([]);
    if (!isAuthenticated) {
      localStorage.removeItem('wishlist');
    }
  };

  const value = {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};