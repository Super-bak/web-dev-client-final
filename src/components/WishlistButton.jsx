import { IconButton, Tooltip, Alert, Snackbar } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const WishlistButton = ({ product, variant = null, size = 'medium' }) => {
  const { addToWishlist, removeFromWishlist, isInWishlist, wishlistItems } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  const productId = product?.id;
  const variantId = variant?.id || product?.variant_id;
  const inWishlist = isInWishlist(variantId || productId);
  const existingItem = wishlistItems.find(item =>
    item.variant_id === variantId ||
    item.product_id === productId ||
    item.id === productId
  );

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setNotification({
        type: 'warning',
        message: 'Please login to add items to your wishlist.'
      });
      setTimeout(() => {
        setNotification(null);
        navigate('/login');
      }, 1500);
      return;
    }

    if (isAdding) return;

    setIsAdding(true);

    try {
      if (inWishlist && existingItem) {
        await removeFromWishlist(existingItem.id);
      } else {
        const wishlistItem = {
          ...product,
          variant_id: variantId,
          product_id: productId
        };
        if (variant) {
          wishlistItem.color = variant.color;
          wishlistItem.size = variant.size;
          wishlistItem.edition = variant.edition;
          wishlistItem.price = variant.price;
        }
        await addToWishlist(wishlistItem);
      }
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <>
      <Tooltip title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}>
        <IconButton
          color={inWishlist ? "error" : "default"}
          onClick={handleToggleWishlist}
          aria-label={inWishlist ? "remove from wishlist" : "add to wishlist"}
          size={size}
          disabled={isAdding}
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
            },
            transition: 'all 0.2s ease'
          }}
        >
          {inWishlist ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </IconButton>
      </Tooltip>
      <Snackbar
        open={!!notification}
        autoHideDuration={1500}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        {notification && (
          <Alert
            severity={notification.type}
            sx={{ width: '100%' }}
            onClose={() => setNotification(null)}
          >
            {notification.message}
          </Alert>
        )}
      </Snackbar>
    </>
  );
};

export default WishlistButton;