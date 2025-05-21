import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Button,
  MenuItem,
  Badge,
  useMediaQuery,
  useTheme,
  Avatar,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useWishlist } from '../context/WishlistContext';
import Slide from '@mui/material/Slide';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CartDrawer from './CartDrawer';


function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

HideOnScroll.propTypes = {
  children: PropTypes.element.isRequired,
};

const Navbar = () => {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Get wishlist items count from context
  const { wishlistItems } = useWishlist();

  // Get cart items count from cart context
  const { itemCount: cartItemsCount } = useCart();

  const pages = [
    { title: 'Home', path: '/' },
    { title: 'Products', path: '/products' },
    { title: 'Categories', path: '/categories' },
    { title: 'About', path: '/about' },
  ];

  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const navigate = useNavigate();

  const handleLogout = async  () => {
    await logout();
    navigate('/');
  };

  return (
    <HideOnScroll>  
      <AppBar position="sticky" sx={{ backgroundColor: 'primary.main' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Logo for desktop */}
            <Typography
              variant="h3"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontFamily: "'Grenze Gotisch', serif",
                fontWeight: 700,
                letterSpacing: '.2rem',
                color: 'white',
                textDecoration: 'none',
              }}
            >
              NEOVAEL
            </Typography>

            {/* Mobile menu */}
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: 'block', md: 'none' },
                }}
              >
                {pages.map((page) => (
                  <MenuItem 
                    key={page.title} 
                    onClick={handleCloseNavMenu} 
                    component={RouterLink} 
                    to={page.path}
                  >
                    <Typography textAlign="center">{page.title}</Typography>
                  </MenuItem>
                ))}
                <MenuItem 
                  onClick={handleCloseNavMenu} 
                  component={RouterLink} 
                  to="/wishlist"
                >
                  <Typography textAlign="center">Wishlist</Typography>
                </MenuItem>
              </Menu>
            </Box>

            {/* Logo for mobile */}
            <Typography
              variant="h3"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                mr: 2,
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                fontFamily: "'Grenze Gotisch', serif",
                fontWeight: 700,
                letterSpacing: '.2rem',
                color: 'white',
                textDecoration: 'none',
              }}
            >
              NEOVAEL
            </Typography>

            {/* Desktop navigation */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {pages.map((page) => (
                <Button
                  key={page.title}
                  component={RouterLink}
                  to={page.path}
                  onClick={handleCloseNavMenu}
                  sx={{ 
                    my: 2, 
                    color: 'white', 
                    display: 'block',
                    mx: 1,
                    textTransform: 'none',
                    fontSize: '1rem',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }
                  }}
                >
                  {page.title}
                </Button>
              ))}
            </Box>

            {/* Right side icons */}
            <Box sx={{ display: 'flex' }}>
              {/* Wishlist Icon */}
              <IconButton 
                component={RouterLink} 
                to="/wishlist" 
                color="inherit"
                sx={{ mx: 1 }}
              >
                <Badge badgeContent={wishlistItems.length} color="error">
                  <FavoriteIcon />
                </Badge>
              </IconButton>

              {/* Cart Icon */}
              <CartDrawer />


              {/* User Menu Icon */}
              <Box sx={{ flexGrow: 0 }}>
                {isAuthenticated ? (
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt={user?.name} src={user?.avatar} />
                  </IconButton>
                ) : (
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/login"
                    sx={{ textTransform: 'none' }}
                  >
                    Login
                  </Button>
                )}
              </Box>
            </Box>

            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem component={RouterLink} to="/profile" onClick={handleCloseUserMenu}>
                Profile
              </MenuItem>
              <MenuItem component={RouterLink} to="/orders" onClick={handleCloseUserMenu}>
                Orders
              </MenuItem>
              
              {isAdmin() && (
                <MenuItem component={RouterLink} to="/admin/products" onClick={handleCloseUserMenu}>
                  Admin Products
                </MenuItem>
              )}
            
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Toolbar>
        </Container>
      </AppBar>
    </HideOnScroll>
  );
};

export default Navbar;