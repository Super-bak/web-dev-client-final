import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  CardActions, 
  Button, 
  Container,
  IconButton,
  Divider,
  Alert,
  CircularProgress 
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist, loading } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  const handleRemoveFromWishlist = (item) => {
    removeFromWishlist(item.id);
    setNotification({
      type: 'success',
      message: `${item.name} removed from wishlist`
    });
    
    // Clear notification after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleAddToCart = async (item) => {
    if (!isAuthenticated) {
      setNotification({
        type: 'warning',
        message: 'Please login to add items to your cart'
      });
      setTimeout(() => {
        setNotification(null);
        navigate('/login');
      }, 2000);
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/cart/add`,
        { 
          product_variant_id: item.variant_id,
          quantity: 1
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setNotification({
          type: 'success',
          message: `${item.name} added to cart`
        });
      } else {
        setNotification({
          type: 'error',
          message: response.data.message || 'Failed to add to cart'
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setNotification({
        type: 'error',
        message: 'Error adding to cart. Please try again.'
      });
    }
    
    // Clear notification after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleViewProduct = (item) => {
    navigate(`/products/${item.product_id}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" className="fade-in" sx={{ py: 4, minHeight: '80vh' }}>
      <Box mb={4} textAlign="center">
        <Typography 
          variant="h1" 
          component="h1"
          sx={{ 
            fontFamily: "'Grenze Gotisch', serif", 
            color: 'primary.main',
            mb: 1
          }}
        >
          My Wishlist
        </Typography>
        <Divider sx={{ width: '60%', mx: 'auto', mb: 2 }} />
        <Typography variant="subtitle1" color="text.secondary">
          Keep track of items you love and want to purchase later
        </Typography>
      </Box>

      {notification && (
        <Alert 
          severity={notification.type} 
          sx={{ mb: 3 }}
          onClose={() => setNotification(null)}
        >
          {notification.message}
        </Alert>
      )}

      {wishlistItems.length === 0 ? (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            textAlign: 'center'
          }}
        >
          <FavoriteIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h3" color="text.secondary" gutterBottom>
            Your wishlist is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Add items to your wishlist while shopping to save them for later
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/products')}
            sx={{ mt: 2 }}
          >
            Browse Products
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {wishlistItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={item.image_url || '/placeholder-image.jpg'} 
                  alt={item.name}
                  onClick={() => handleViewProduct(item)}
                  sx={{ cursor: 'pointer', objectFit: 'contain' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography 
                    gutterBottom 
                    variant="h3" 
                    component="h3" 
                    sx={{ 
                      fontSize: '1.4rem',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleViewProduct(item)}
                  >
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {item.description && item.description.length > 100
                      ? `${item.description.substring(0, 100)}...`
                      : item.description}
                  </Typography>
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
                    {item.edition && (
                      <Typography variant="body2" color="text.secondary">
                        Edition: {item.edition}
                      </Typography>
                    )}
                  </Box>
                  <Typography variant="h5" color="primary.main" fontWeight="bold">
                    ${item.price?.toFixed(2) || '0.00'}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<ShoppingCartIcon />}
                    onClick={() => handleAddToCart(item)}
                    size="small"
                  >
                    Add to Cart
                  </Button>
                  <IconButton 
                    color="error" 
                    onClick={() => handleRemoveFromWishlist(item)}
                    aria-label="remove from wishlist"
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Wishlist;