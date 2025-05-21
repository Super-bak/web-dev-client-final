import { Container, Grid, Typography, Link, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const FooterContainer = styled('footer')(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  padding: theme.spacing(6, 0),
  marginTop: 'auto',
}));

const FooterBottom = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.dark,
  color: 'white',
  padding: theme.spacing(2, 0),
  textAlign: 'center',
}));

const Footer = () => {
  return (
    <>
      <FooterContainer>
        <Container>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" gutterBottom>
                Neovael
              </Typography>
              <Typography variant="body2">
                Premium products, curated for you.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" gutterBottom>
                Links
              </Typography>
              <Link href="/" color="inherit" display="block">Home</Link>
              <Link href="/products" color="inherit" display="block">Products</Link>
              <Link href="/categories" color="inherit" display="block">Categories</Link>
              <Link href="/about" color="inherit" display="block">About</Link>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" gutterBottom>
                Support
              </Typography>
              <Link href="#" color="inherit" display="block">Contact Us</Link>
              <Link href="#" color="inherit" display="block">FAQs</Link>
              <Link href="#" color="inherit" display="block">Shipping</Link>
              <Link href="#" color="inherit" display="block">Returns</Link>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" gutterBottom>
                Connect
              </Typography>
              <Link href="#" color="inherit" display="block">Instagram</Link>
              <Link href="#" color="inherit" display="block">Twitter</Link>
              <Link href="#" color="inherit" display="block">Facebook</Link>
            </Grid>
          </Grid>
        </Container>
      </FooterContainer>
      <FooterBottom>
        <Container>
          <Typography variant="body2">
            © {new Date().getFullYear()} Neovael. All rights reserved.
          </Typography>
        </Container>
      </FooterBottom>
    </>
  );
};

export default Footer; 