import { useState, useEffect, useRef } from 'react';
import { 
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  TextField
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import WishlistWidget from '../components/WishlistWidget';
import WishlistButton from '../components/WishlistButton';
import useScrollDirection from '../hooks/useScrollDirection';
import axios from 'axios';

const Home = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { scrollDir, scrollY } = useScrollDirection(5);
  const featuredSectionRef = useRef(null);
  const [translateY, setTranslateY] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        console.log('API URL:', `${import.meta.env.VITE_API_BASE_URL}/api/products/featured`);
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/products/featured`);
        setFeaturedProducts(response.data.data || []);
        setError(null);
      } catch (err) {
        setError('Failed to fetch featured products. Please try again later.');
        console.error('Error fetching featured products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  useEffect(() => {
    // When component mounts, reset translation
    setTranslateY(0);
  }, []);

  useEffect(() => {
    if (featuredSectionRef.current) {
      const sectionTop = featuredSectionRef.current.getBoundingClientRect().top + window.pageYOffset;
      const sectionHeight = featuredSectionRef.current.offsetHeight;
      
      // Only apply effect when we're near or within the featured section
      if (scrollY >= sectionTop - window.innerHeight && scrollY <= sectionTop + sectionHeight) {
        // Make translation based on scroll direction
        if (scrollDir === 'down') {
          setTranslateY(prev => Math.min(prev + 15, 30)); // Move up (positive value)
        } else if (scrollDir === 'up') {
          setTranslateY(prev => Math.max(prev - 15, 0)); // Move down (back to 0)
        }
      }
    }
  }, [scrollDir, scrollY]);

  return (
    <Box className="fade-in">
      {/* Hero Section */}
      <Box 
        sx={{ 
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(/images/homeimg.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          py: 10,
          mb: 4
        }}
      >
        <Container maxWidth="lg">
          <Box maxWidth="md" sx={{ py: 15 }}>
            <Typography 
              variant="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 700,
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                mb: 3
              }}
            >
              Discover Modern Style
            </Typography>
            <Typography 
              variant="h5" 
              paragraph
              sx={{ mb: 4, maxWidth: '600px' }}
            >
              Experience our curated collection of premium products designed for the modern lifestyle.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button 
                variant="contained" 
                size="large" 
                component={RouterLink} 
                to="/products"
                sx={{ 
                  fontSize: '1.1rem',
                  px: 4,
                  py: 1.5
                }}
              >
                Shop Now
              </Button>
              <Button 
                variant="outlined" 
                size="large" 
                component={RouterLink} 
                to="/categories"
                sx={{ 
                  fontSize: '1.1rem',
                  px: 4,
                  py: 1.5,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderColor: 'white',
                  }
                }}
              >
                Explore Categories
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Wishlist Widget - This will only appear if there are items in wishlist */}
      <Container maxWidth="lg">
        {isMounted && <WishlistWidget />}
      </Container>

      {/* Featured Products */}
      <Container 
        maxWidth="lg" 
        ref={featuredSectionRef}
        sx={{ 
          py: 4,
          transform: `translateY(${translateY}px)`,
          transition: 'transform 0.3s ease-in-out',
          opacity: translateY > 0 ? 1 : 0.8,
        }}
      >
        <Box textAlign="center" mb={4}>
          <Typography variant="h2" component="h2" gutterBottom>
            Featured Products
          </Typography>
          <Divider sx={{ width: '10%', mx: 'auto', mb: 2 }} />
          <Typography variant="subtitle1" color="text.secondary" paragraph>
            Handpicked selection of our finest items
          </Typography>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : featuredProducts && featuredProducts.length > 0 ? (
          <Grid container spacing={3}>
            {featuredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative'
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={product.image_url || '/api/placeholder/public/images/homeimg.jpeg'}
                      alt={product.name}
                    />

                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2">
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {product.description}
                    </Typography>
                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                      ${Number(product.base_price).toFixed(2)}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="medium" 
                      variant="contained" 
                      fullWidth
                      component={RouterLink}
                      to={`/products/${product.id}`}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Alert severity="info">No featured products available</Alert>
        )}

        <Box textAlign="center" mt={4}>
          <Button 
            variant="outlined" 
            color="primary" 
            size="large"
            component={RouterLink}
            to="/products"
          >
            View All Products
          </Button>
        </Box>
      </Container>

      {/* Call to action */}
      <Box 
        sx={{ 
          backgroundColor: 'primary.main',
          color: 'white',
          py: 8,
          mt: 6
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h2" gutterBottom>
            Join Our Newsletter
          </Typography>
          <Typography variant="subtitle1" paragraph>
            Stay updated with our latest products and exclusive offers
          </Typography>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            sx={{ 
              maxWidth: '600px', 
              mx: 'auto',
              mt: 4
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Enter your email"
              sx={{
                backgroundColor: 'white',
                borderRadius: '4px',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'transparent',
                  },
                  '&:hover fieldset': {
                    borderColor: 'transparent',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'transparent',
                  },
                },
              }}
            />
            <Button 
              variant="contained" 
              size="large"
              sx={{ 
                px: 4,
                py: 1.5,
                backgroundColor: 'white',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                }
              }}
            >
              Subscribe
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;