import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Button,
  Box,
  Divider,
  TextField,
  CircularProgress,
  Alert
} from '@mui/material';
import { Close as CloseIcon, Delete as DeleteIcon, Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: '24rem',
    backgroundColor: theme.palette.background.paper,
    boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.1)',
    padding: theme.spacing(2),
    overflowY: 'auto',
  },
}));

const CartHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  paddingBottom: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.primary.light}`,
  '& h2': {
    fontFamily: "'Grenze Gotisch', serif",
    fontSize: '1.5rem',
    fontWeight: 700,
    color: theme.palette.text.primary,
  },
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.background.default,
  width: '2rem',
  height: '2rem',
  '&:hover': {
    backgroundColor: theme.palette.primary.light,
  },
}));

const CartItems = styled(List)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const CartItem = styled(ListItem)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.primary.light}`,
}));

const CartItemImage = styled('img')(({ theme }) => ({
  width: '5rem',
  height: '5rem',
  objectFit: 'cover',
  marginRight: theme.spacing(2),
  borderRadius: '0.3rem',
}));

const CartItemDetails = styled(Box)(({ theme }) => ({
  flex: 1,
}));

const CartItemTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(0.5),
}));

const CartItemPrice = styled(Typography)(({ theme }) => ({
  fontSize: '0.95rem',
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(1),
}));

const QuantityControl = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
}));

const QuantityButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.background.default,
  width: '1.8rem',
  height: '1.8rem',
  '&:hover': {
    backgroundColor: theme.palette.primary.light,
    transform: 'scale(1.05)',
  },
}));

const QuantityInput = styled(TextField)(({ theme }) => ({
  width: '3rem',
  margin: theme.spacing(0, 1),
  '& .MuiInputBase-input': {
    textAlign: 'center',
    padding: '0.3rem',
    backgroundColor: theme.palette.background.default,
    border: `1px solid ${theme.palette.primary.light}`,
    borderRadius: '0.3rem',
  },
}));

const RemoveButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.background.default,
  padding: '0.3rem 0.6rem',
  fontSize: '0.85rem',
  borderRadius: '0.3rem',
  '&:hover': {
    backgroundColor: theme.palette.primary.light,
  },
}));

const CartTotal = styled(Box)(({ theme }) => ({
  fontSize: '1.2rem',
  fontWeight: 700,
  color: theme.palette.text.primary,
  textAlign: 'right',
  marginBottom: theme.spacing(2),
}));

const CheckoutButton = styled(Button)(({ theme }) => ({
  width: '100%',
  padding: '0.8rem',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.background.default,
  borderRadius: '1rem',
  fontSize: '0.95rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  '&:hover': {
    backgroundColor: theme.palette.primary.light,
    transform: 'scale(1.05)',
  },
  '&.Mui-disabled': {
    backgroundColor: theme.palette.action.disabledBackground,
  },
}));

const Cart = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { 
    cartItems, 
    cartTotal, 
    loading,
    updateCartItemQuantity, 
    removeFromCart, 
    clearCart,
    refreshCart
  } = useCart();
  const [error, setError] = useState(null);
  const [prevIsOpen, setPrevIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen && !prevIsOpen && refreshCart) {
      refreshCart();
    }
    setPrevIsOpen(isOpen);
  }, [isOpen, refreshCart, prevIsOpen]);

  const handleClose = () => {
    if (onClose) onClose();
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const success = await removeFromCart(itemId);
      if (!success) {
        setError('Failed to remove item from cart');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error('Error removing item:', err);
      setError('Error removing item from cart');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      const success = await updateCartItemQuantity(itemId, newQuantity);
      if (!success) {
        setError('Failed to update quantity');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
      setError('Error updating quantity');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleCheckout = () => {
    handleClose();
    navigate('/checkout');
  };

  if (loading) {
    return (
      <CartDrawer anchor="right" open={isOpen} onClose={handleClose}>
        <CartHeader>
          <Typography variant="h6">Your Cart</Typography>
          <CloseButton onClick={handleClose}>
            <CloseIcon />
          </CloseButton>
        </CartHeader>
        <Box display="flex" justifyContent="center" alignItems="center" height="80%">
          <CircularProgress />
        </Box>
      </CartDrawer>
    );
  }

  return (
    <CartDrawer anchor="right" open={isOpen} onClose={handleClose}>
      <CartHeader>
        <Typography variant="h6">Your Cart</Typography>
        <CloseButton onClick={handleClose}>
          <CloseIcon />
        </CloseButton>
      </CartHeader>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {cartItems.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="body1" color="text.secondary" paragraph>
            Your cart is empty
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => {
              handleClose();
              navigate('/products');
            }}
          >
            Continue Shopping
          </Button>
        </Box>
      ) : (
        <>
          <CartItems>
            {cartItems.map((item) => (
              <CartItem key={item.id}>
                <CartItemImage src={item.image_url || '/placeholder-image.jpg'} alt={item.name} />
                <CartItemDetails>
                  <CartItemTitle>{item.name}</CartItemTitle>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                    {item.color && (
                      <Typography variant="body2" color="text.secondary">
                        Color: {item.color}
                      </Typography>
                    )}
                    {item.size && (
                      <Typography variant="body2" color="text.secondary">
                        Size: {item.size}
                      </Typography>
                    )}
                  </Box>
                  <CartItemPrice>${item.price.toFixed(2)}</CartItemPrice>
                  <QuantityControl>
                    <QuantityButton
                      size="small"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <RemoveIcon />
                    </QuantityButton>
                    <QuantityInput
                      value={item.quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          handleQuantityChange(item.id, val);
                        }
                      }}
                      inputProps={{ min: 1, max: item.stock_qty }}
                    />
                    <QuantityButton
                      size="small"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock_qty}
                    >
                      <AddIcon />
                    </QuantityButton>
                  </QuantityControl>
                </CartItemDetails>
                <RemoveButton onClick={() => handleRemoveItem(item.id)}>
                  Remove
                </RemoveButton>
              </CartItem>
            ))}
          </CartItems>

          <CartTotal>
            Total: ${cartTotal.toFixed(2)}
          </CartTotal>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <CheckoutButton
              variant="contained"
              onClick={handleCheckout}
              disabled={!isAuthenticated}
            >
              {isAuthenticated ? 'Checkout' : 'Login to Checkout'}
            </CheckoutButton>
            
            {!isAuthenticated && (
              <Button 
                variant="outlined" 
                onClick={() => {
                  handleClose();
                  navigate('/login');
                }}
              >
                Login
              </Button>
            )}
            
            <Button 
              variant="text" 
              color="error" 
              onClick={clearCart}
            >
              Clear Cart
            </Button>
          </Box>
        </>
      )}
    </CartDrawer>
  );
};

export default Cart; 