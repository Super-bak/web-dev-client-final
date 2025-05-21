import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Rating,
  Chip
} from '@mui/material';
import axios from 'axios';

const Products = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Parse query params
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const categoryParam = queryParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [location.search]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/categories`);
        if (response.data.success) {
          setCategories(response.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let url = `${import.meta.env.VITE_API_BASE_URL}/api/products`;
        
        const params = new URLSearchParams();
        if (selectedCategory !== 'all') {
          params.append('category', selectedCategory);
        }
        if (searchQuery) {
          params.append('search', searchQuery);
        }
        
        // Sort parameter
        let sortParam;
        switch (sortBy) {
          case 'price-low':
            sortParam = 'price-asc';
            break;
          case 'price-high':
            sortParam = 'price-desc';
            break;
          case 'newest':
            sortParam = 'newest';
            break;
          default:
            sortParam = 'newest';
        }
        params.append('sort', sortParam);
        
        // Append params to URL if there are any
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        
        const response = await axios.get(url);
        if (response.data.success) {
          setProducts(response.data.data || []);
          setError(null);
        } else {
          setError(response.data.message || 'Failed to fetch products');
          setProducts([]);
        }
      } catch (err) {
        setError('Failed to fetch products. Please try again later.');
        setProducts([]);
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchProducts, 300); // Debounce API calls
    return () => clearTimeout(timeoutId);
  }, [selectedCategory, sortBy, searchQuery]);

  const handleCategoryChange = (event) => {
    const categoryId = event.target.value;
    setSelectedCategory(categoryId);
    
    // Update URL without reloading the page
    const searchParams = new URLSearchParams(location.search);
    if (categoryId === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', categoryId);
    }
    
    navigate({
      pathname: location.pathname,
      search: searchParams.toString()
    });
  };

  // Find the current category name for display
  const currentCategoryName = selectedCategory === 'all' 
    ? 'All Categories' 
    : categories.find(cat => cat.id === parseInt(selectedCategory))?.name || '';

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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Category title if selected */}
      {selectedCategory !== 'all' && currentCategoryName && (
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {currentCategoryName}
          </Typography>
          <Chip 
            label="Clear Filter" 
            onClick={() => handleCategoryChange({ target: { value: 'all' } })}
            color="primary"
            variant="outlined"
            sx={{ mt: 1 }}
          />
        </Box>
      )}

      {/* Filters */}
      <Box sx={{ mb: 4, mt: 5, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory}
            onChange={handleCategoryChange}
            label="Category"
          >
            <MenuItem value="all">All Categories</MenuItem>
            {categories.map(category => (
              <MenuItem key={category.id} value={category.id.toString()}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ minWidth: 200 }}
        />

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            label="Sort By"
          >
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="price-low">Price: Low to High</MenuItem>
            <MenuItem value="price-high">Price: High to Low</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Products Grid */}
      <Grid container spacing={4}>
        {products.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                  cursor: 'pointer'
                }
              }}
              onClick={() => navigate(`/products/${product.id}`)}
            >
              <CardMedia
                component="img"
                height="200"
                image={
                  product.image_url || 
                  (product.product_variants?.[0]?.image_url) || 
                  '/placeholder-image.jpg'
                }
                alt={product.name}
                sx={{ 
                  objectFit: 'contain', 
                  p: 2,
                  backgroundColor: '#f5f5f5'
                }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2">
                  {product.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating 
                    value={product.reviews?.reduce((acc, review) => acc + review.rating, 0) / (product.reviews?.length || 1)} 
                    readOnly 
                    precision={0.5}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    ({product.reviews?.length || 0})
                  </Typography>
                </Box>
                <Typography variant="h6" color="primary">
                  ${Number(product.base_price).toFixed(2)}
                </Typography>
                {product.product_variants?.length > 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {product.product_variants.length} variants available
                  </Typography>
                )}
                <Button 
                  variant="contained" 
                  fullWidth 
                  sx={{ mt: 2 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/products/${product.id}`);
                  }}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {products.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No products found matching your criteria
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Products;