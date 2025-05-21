import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Card,
  CardMedia,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  Snackbar,
  CircularProgress,
  Rating,
  Paper,
  ImageList,
  ImageListItem
} from '@mui/material';
import axios from 'axios';
import WishlistButton from '../components/WishlistButton';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [notification, setNotification] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/products/${id}`);
        if (response.data.success) {
          setProduct(response.data.data);
          // Set default variant if available
          if (response.data.data.product_variants?.length > 0) {
            setSelectedVariant(response.data.data.product_variants[0]);
          }
          // Set initial selected image
          setSelectedImage(response.data.data.image_url || 
            (response.data.data.product_variants?.[0]?.image_url) || 
            '/placeholder-image.jpg');
          setError(null);
        } else {
          setError(response.data.message || 'Failed to fetch product details');
        }
      } catch (err) {
        setError('Failed to fetch product details. Please try again later.');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleVariantChange = (event) => {
    const variantId = event.target.value;
    const variant = product.product_variants.find(v => v.id === variantId);
    setSelectedVariant(variant);
    // Update selected image to variant image if available
    if (variant?.image_url) {
      setSelectedImage(variant.image_url);
    }
    setQuantity(1); // Reset quantity when variant changes
  };

  const handleQuantityChange = (event) => {
    const value = parseInt(event.target.value);
    if (value > 0 && value <= (selectedVariant?.stock_qty || 1)) {
      setQuantity(value);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      setNotification({
        type: 'error',
        message: 'Please select a variant'
      });
      return;
    }

    try {
      // First, check if user is authenticated
      if (!localStorage.getItem('token')) {
        setNotification({
          type: 'warning',
          message: 'Please login to add items to your cart'
        });
        setTimeout(() => {
          navigate('/login');
        }, 1500);
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/cart`, 
        {
          variant_id: selectedVariant.id,
          quantity: quantity
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
          message: 'Product added to cart successfully!'
        });
      } else {
        setNotification({
          type: 'error',
          message: response.data.message || 'Failed to add product to cart'
        });
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      if (err.response?.status === 401) {
        setNotification({
          type: 'error',
          message: 'Please login to add items to your cart'
        });
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setNotification({
          type: 'error',
          message: err.response?.data?.message || 'Failed to add product to cart. Please try again.'
        });
      }
    }
  };

  const handleBuyNow = () => {
    if (!selectedVariant) {
      setNotification({
        type: 'error',
        message: 'Please select a variant'
      });
      return;
    }
    // Navigate to checkout with the selected product
    navigate('/checkout', { 
      state: { 
        product,
        variant: selectedVariant,
        quantity
      }
    });
  };

  // Get all available images (product + variants)
  const getAllImages = () => {
    const images = [];
    if (product?.image_url) {
      images.push({ url: product.image_url, type: 'product' });
    }
    product?.product_variants?.forEach(variant => {
      if (variant.image_url) {
        images.push({ url: variant.image_url, type: 'variant', variant });
      }
    });
    return images;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">Product not found</Alert>
      </Container>
    );
  }

  const images = getAllImages();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 2 }}>
            <CardMedia
              component="img"
              height="500"
              image={selectedImage}
              alt={product.name}
              sx={{ 
                objectFit: 'contain',
                backgroundColor: '#f5f5f5'
              }}
            />
          </Card>
          {images.length > 1 && (
            <ImageList sx={{ width: '100%', height: 100 }} cols={4} rowHeight={100}>
              {images.map((img, index) => (
                <ImageListItem 
                  key={index}
                  sx={{ 
                    cursor: 'pointer',
                    border: selectedImage === img.url ? '2px solid #1976d2' : '2px solid transparent',
                    borderRadius: 1
                  }}
                  onClick={() => setSelectedImage(img.url)}
                >
                  <img
                    src={img.url}
                    alt={`${product.name} ${img.type === 'variant' ? `- ${img.variant.color}` : ''}`}
                    loading="lazy"
                    style={{ objectFit: 'contain' }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          )}
        </Grid>

        {/* Product Details */}
        <Grid item xs={12} md={6}>
          <Box sx={{ position: 'relative' }}>
            <Box sx={{ position: 'relative', top: 0, right: 0 }}>
              <WishlistButton 
                product={product} 
                variant={selectedVariant}
              />
            </Box>

            <Typography variant="h4" component="h1" gutterBottom>
              {product.name}
            </Typography>

            <Typography variant="h5" color="primary" gutterBottom>
              ${Number(selectedVariant?.price || product.base_price).toFixed(2)}
            </Typography>

            <Typography variant="body1" paragraph>
              {product.description}
            </Typography>

            <Divider sx={{ my: 2 }} />

            {/* Variant Selection */}
            {product.product_variants?.length > 0 && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Variant</InputLabel>
                <Select
                  value={selectedVariant?.id || ''}
                  onChange={handleVariantChange}
                  label="Select Variant"
                >
                  {product.product_variants.map((variant) => (
                    <MenuItem 
                      key={variant.id} 
                      value={variant.id}
                      disabled={variant.stock_qty === 0}
                    >
                      {variant.size} - {variant.color} 
                      {variant.edition ? ` (${variant.edition})` : ''} 
                      - ${Number(variant.price).toFixed(2)}
                      {variant.stock_qty === 0 ? ' - Out of Stock' : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Quantity Selection */}
            <TextField
              type="number"
              label="Quantity"
              value={quantity}
              onChange={handleQuantityChange}
              inputProps={{ min: 1, max: selectedVariant?.stock_qty || 1 }}
              sx={{ mb: 2, width: '100px' }}
            />

            {/* Action Buttons */}
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.stock_qty === 0}
                sx={{ flex: 1 }}
              >
                Add to Cart
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={handleBuyNow}
                disabled={!selectedVariant || selectedVariant.stock_qty === 0}
                sx={{ flex: 1 }}
              >
                Buy Now
              </Button>
            </Box>

            {/* Stock Status */}
            {selectedVariant && (
              <Typography 
                variant="body2" 
                color={selectedVariant.stock_qty > 0 ? 'success.main' : 'error.main'}
                sx={{ mt: 2 }}
              >
                {selectedVariant.stock_qty > 0 
                  ? `${selectedVariant.stock_qty} units in stock`
                  : 'Out of stock'}
              </Typography>
            )}
          </Box>
        </Grid>

        {/* Reviews Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Customer Reviews
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {product.reviews?.length > 0 ? (
              product.reviews.map((review) => (
                <Box key={review.id} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating value={review.rating} readOnly />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      by {review.users?.name || 'Anonymous'}
                    </Typography>
                  </Box>
                  <Typography variant="body1">{review.comment}</Typography>
                  <Divider sx={{ mt: 2 }} />
                </Box>
              ))
            ) : (
              <Typography variant="body1" color="text.secondary">
                No reviews yet. Be the first to review this product!
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Notification */}
      <Snackbar
        open={notification !== null}
        autoHideDuration={3000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          severity={notification?.type || 'success'} 
          onClose={() => setNotification(null)}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductDetails; 