import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Button, 
  CardActions, 
  Box 
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import WishlistButton from './WishlistButton';

const ProductCard = ({ product, onAddToCart }) => {
  return (
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
          image={product.image_url || '/api/placeholder/400/320'}
          alt={product.name}
        />
        {/* Wishlist button positioned at top-right corner */}
        <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
          <WishlistButton product={product} />
        </Box>
      </Box>
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h3" component="h3" sx={{ fontSize: '1.4rem' }}>
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {product.description}
        </Typography>
        <Typography variant="h5" color="primary.main" fontWeight="bold">
          ${product.price?.toFixed(2) || '0.00'}
        </Typography>
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'center', p: 2 }}>
        <Button 
          variant="contained" 
          startIcon={<ShoppingCartIcon />}
          fullWidth
          onClick={() => onAddToCart && onAddToCart(product)}
        >
          Add to Cart
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;