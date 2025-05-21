import { useState, useCallback } from 'react';
import Cart from './Cart';
import { Badge, IconButton } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useCart } from '../context/CartContext';

const CartDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { itemCount } = useCart();

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      <IconButton 
        color="inherit" aria-label="cart" onClick={handleOpen}
        sx={{ 
          position: 'relative',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            transform: 'scale(1.1)',
          },
          transition: 'all 0.2s ease',
        }}
      >
        <Badge badgeContent={itemCount} color="error">
          <ShoppingCartIcon />
        </Badge>
      </IconButton>
      <Cart isOpen={isOpen} onClose={handleClose} />
    </>
  );
};

export default CartDrawer; 