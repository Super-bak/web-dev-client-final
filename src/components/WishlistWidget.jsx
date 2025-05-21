import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Grid,
  CardMedia,
  Divider 
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import WishlistButton from './WishlistButton';

const WishlistWidget = () => {
  const { wishlistItems } = useWishlist();
  
  // Show only first 3 wishlist items
  const displayItems = wishlistItems.slice(0, 3);
  
  if (wishlistItems.length === 0) {
    return null; // Don't show the widget if wishlist is empty
  }
  
  return (
    <Card sx={{ my: 4, overflow: 'visible' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h2" component="h2">
            Your Wishlist
          </Typography>
          <Button 
            component={RouterLink} 
            to="/wishlist" 
            color="primary"
            variant="text"
          >
            View All
          </Button>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={2}>
          {displayItems.map((item) => (
            <Grid item xs={12} sm={4} key={item.id}>
              <Card 
                sx={{ 
                  position: 'relative',
                  height: '100%',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                  }
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={item.image_url || '/api/placeholder/400/320'}
                    alt={item.name}
                  />
                  <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <WishlistButton product={item} size="small" />
                  </Box>
                </Box>
                <CardContent>
                  <Typography gutterBottom variant="h6" component="h3" noWrap>
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    ${item.price?.toFixed(2) || '0.00'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default WishlistWidget;