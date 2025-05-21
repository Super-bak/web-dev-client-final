import { Container, Typography, Grid, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const AboutSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(8, 0),
  backgroundColor: theme.palette.background.default,
}));

const AboutTitle = styled(Typography)(({ theme }) => ({
  fontFamily: "'Grenze Gotisch', serif",
  fontSize: '2.5rem',
  fontWeight: 700,
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  color: theme.palette.primary.main,
}));

const AboutContent = styled(Box)(({ theme }) => ({
  maxWidth: '800px',
  margin: '0 auto',
  textAlign: 'center',
}));

const AboutText = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  lineHeight: 1.8,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(4),
}));

const FeatureGrid = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(6),
}));

const FeatureItem = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  backgroundColor: theme.palette.background.paper,
  borderRadius: '1rem',
  boxShadow: '0 0.5rem 1.5rem rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-0.5rem)',
  },
}));

const FeatureTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  color: theme.palette.primary.main,
}));

const About = () => {
  return (
    <AboutSection>
      <Container>
        <AboutTitle>About Neovael</AboutTitle>
        <AboutContent>
          <AboutText>
            Welcome to Neovael, your premier destination for premium products and exceptional shopping experiences. 
            We are dedicated to curating the finest selection of products that combine quality, style, and innovation.
          </AboutText>
          <AboutText>
            Our mission is to provide our customers with a seamless shopping experience, offering carefully selected 
            products that enhance their lifestyle and bring joy to their everyday lives.
          </AboutText>
        </AboutContent>

        <FeatureGrid container spacing={4}>
          <Grid item xs={12} md={4}>
            <FeatureItem>
              <FeatureTitle>Quality Products</FeatureTitle>
              <Typography>
                We carefully select each product to ensure the highest quality and customer satisfaction.
              </Typography>
            </FeatureItem>
          </Grid>
          <Grid item xs={12} md={4}>
            <FeatureItem>
              <FeatureTitle>Fast Shipping</FeatureTitle>
              <Typography>
                Enjoy quick and reliable delivery services to get your products as soon as possible.
              </Typography>
            </FeatureItem>
          </Grid>
          <Grid item xs={12} md={4}>
            <FeatureItem>
              <FeatureTitle>24/7 Support</FeatureTitle>
              <Typography>
                Our dedicated support team is always ready to assist you with any questions or concerns.
              </Typography>
            </FeatureItem>
          </Grid>
        </FeatureGrid>
      </Container>
    </AboutSection>
  );
};

export default About; 