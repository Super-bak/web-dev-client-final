import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Box, 
  CircularProgress, 
  Alert 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';

const CategoryCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: '0.75rem',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-0.5rem)',
    boxShadow: '0 0.5rem 1.5rem rgba(0, 0, 0, 0.1)',
  },
}));

const CategoryContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  backgroundColor: theme.palette.primary.dark,
  color: theme.palette.background.default,
}));

const CategoryTitle = styled(Typography)(({ theme }) => ({
  fontFamily: "'Grenze Gotisch', serif",
  fontSize: '2rem',
  fontWeight: 700,
  marginBottom: theme.spacing(1),
}));

const CategoryDescription = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  opacity: 0.9,
}));



const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/categories`);
        
        if (response.data.success) {
          setCategories(response.data.data || []);
          setError(null);
        } else {
          setError(response.data.message || 'Failed to fetch categories');
          setCategories([]);
        }
      } catch (err) {
        setError('Failed to fetch categories. Please try again later.');
        setCategories([]);
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId) => {
    navigate(`/products?category=${categoryId}`);
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

  return (
    <Container sx={{ py: 8 }}>
      <Typography variant="h2" align="center" gutterBottom>
        Shop by Category
      </Typography>
      <Typography variant="h6" align="center" color="text.secondary" paragraph>
        Browse our wide range of products by category
      </Typography>

      <Grid container spacing={4} sx={{ mt: 4 }} justifyContent="center">
        {categories.map((category) => (
          <Grid item key={category.id} xs={12} sm={6} md={4}>
            <CategoryCard onClick={() => handleCategoryClick(category.id)}>
              <CategoryContent>
                <Typography variant="h4" sx={{ fontFamily: "'Grenze Gotisch', serif", fontWeight: 700, mb: 1 }}>
                  {category.name}
                </Typography>
                {category.discount && (
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {category.discount}% off
                  </Typography>
                )}
                {category._count && (
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {category._count.products} products
                  </Typography>
                )}
              </CategoryContent>
            </CategoryCard>
          </Grid>
        ))}
      </Grid>
      
      {categories.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No categories found
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Categories; 