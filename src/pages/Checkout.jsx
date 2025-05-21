import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Box,
  Stepper,
  Step,
  StepLabel,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Snackbar
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const steps = ['Shipping Information', 'Payment Method', 'Review Order'];

const Checkout = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  
  const [activeStep, setActiveStep] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('');
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    country: '',
    postal_code: ''
  });
  const [newPayment, setNewPayment] = useState({
    card_number: '',
    expiry_date: '',
    card_holder_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);

  // Redirect if not authenticated or cart is empty
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (cartItems.length === 0 && !orderCompleted) {
      navigate('/products');
    }
  }, [isAuthenticated, cartItems.length, navigate, orderCompleted]);

  // Fetch user's addresses and payment methods
  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated) {
        try {
          setLoading(true);
          const response = await axios.get(`${API_BASE_URL}/api/profile`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });

          if (response.data.success) {
            setAddresses(response.data.data.addresses || []);
            setPaymentMethods(response.data.data.payment_methods || []);
            
            // Set default selections if available
            const defaultAddress = response.data.data.addresses?.find(addr => addr.is_default);
            const defaultPayment = response.data.data.payment_methods?.find(method => method.is_default);
            
            if (defaultAddress) setSelectedAddress(defaultAddress.id.toString());
            if (defaultPayment) setSelectedPayment(defaultPayment.id.toString());
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          setError('Failed to load your information. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [isAuthenticated]);

  const handleNext = () => {
    // Validate current step
    if (activeStep === 0 && !validateShippingStep()) return;
    if (activeStep === 1 && !validatePaymentStep()) return;
    
    if (activeStep === steps.length - 1) {
      handlePlaceOrder();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const validateShippingStep = () => {
    if (selectedAddress === 'new') {
      if (!newAddress.street || !newAddress.city || !newAddress.state || 
          !newAddress.country || !newAddress.postal_code) {
        setError('Please fill in all address fields');
        return false;
      }
    } else if (!selectedAddress) {
      setError('Please select a shipping address');
      return false;
    }
    setError(null);
    return true;
  };

  const validatePaymentStep = () => {
    if (selectedPayment === 'new') {
      if (!newPayment.card_number || !newPayment.expiry_date || !newPayment.card_holder_name) {
        setError('Please fill in all payment fields');
        return false;
      }
      
      // Only validate that there's some input, but don't enforce specific format
      if (newPayment.card_number.trim() === '') {
        setError('Please enter a card number');
        return false;
      }
      
      // Simple validation for expiry date (MM/YY)
      if (!/^\d{2}\/\d{2}$/.test(newPayment.expiry_date)) {
        setError('Please enter a valid expiry date (MM/YY)');
        return false;
      }
    } else if (!selectedPayment) {
      setError('Please select a payment method');
      return false;
    }
    setError(null);
    return true;
  };

  const handleAddressChange = (event) => {
    setSelectedAddress(event.target.value);
  };

  const handlePaymentChange = (event) => {
    setSelectedPayment(event.target.value);
  };

  const handleNewAddressChange = (event) => {
    setNewAddress({
      ...newAddress,
      [event.target.name]: event.target.value
    });
  };

  const handleNewPaymentChange = (event) => {
    setNewPayment({
      ...newPayment,
      [event.target.name]: event.target.value
    });
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      
      // Handle new address if needed
      let addressId = selectedAddress;
      if (selectedAddress === 'new') {
        const addressResponse = await axios.post(
          `${API_BASE_URL}/api/profile/addresses`,
          { ...newAddress, is_default: false },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        if (addressResponse.data.success) {
          addressId = addressResponse.data.data.id;
        } else {
          throw new Error('Failed to create new address');
        }
      }
      
      // Handle new payment method if needed
      let paymentId = selectedPayment;
      if (selectedPayment === 'new') {
        const paymentResponse = await axios.post(
          `${API_BASE_URL}/api/profile/payment-methods`,
          { ...newPayment, is_default: false },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        if (paymentResponse.data.success) {
          paymentId = paymentResponse.data.data.id;
        } else {
          throw new Error('Failed to create new payment method');
        }
      }
      
      // Get payment method details
      let paymentMethod;
      if (selectedPayment === 'new') {
        paymentMethod = 'Credit Card';
      } else {
        const selectedPaymentMethod = paymentMethods.find(p => p.id.toString() === selectedPayment);
        paymentMethod = selectedPaymentMethod ? 'Credit Card' : 'PayPal';
      }
      
      // Create order
      const orderResponse = await axios.post(
        `${API_BASE_URL}/api/orders`,
        {
          address_id: parseInt(addressId),
          payment_method: paymentMethod,
          items: cartItems.map(item => ({
            variant_id: item.variant_id,
            quantity: item.quantity
          }))
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (orderResponse.data.success) {
        setOrderCompleted(true);
        setOrderNumber(orderResponse.data.data.id);
        clearCart();
        setNotification({
          type: 'success',
          message: 'Order placed successfully!'
        });
      } else {
        throw new Error('Failed to place order');
      }
    } catch (err) {
      console.error('Error placing order:', err);
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Shipping Address
            </Typography>
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                aria-label="shipping-address"
                name="shipping-address"
                value={selectedAddress}
                onChange={handleAddressChange}
              >
                {addresses.map((address) => (
                  <Paper key={address.id} sx={{ mb: 2, p: 2 }}>
                    <FormControlLabel
                      value={address.id.toString()}
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="body1">
                            {address.street}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {address.city}, {address.state} {address.postal_code}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {address.country}
                          </Typography>
                        </Box>
                      }
                      sx={{ width: '100%', m: 0 }}
                    />
                  </Paper>
                ))}
                <Paper sx={{ mb: 2, p: 2 }}>
                  <FormControlLabel
                    value="new"
                    control={<Radio />}
                    label="Use a new address"
                    sx={{ width: '100%', m: 0 }}
                  />
                  {selectedAddress === 'new' && (
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      <Grid item xs={12}>
                        <TextField
                          required
                          name="street"
                          label="Street Address"
                          fullWidth
                          value={newAddress.street}
                          onChange={handleNewAddressChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          required
                          name="city"
                          label="City"
                          fullWidth
                          value={newAddress.city}
                          onChange={handleNewAddressChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          required
                          name="state"
                          label="State/Province"
                          fullWidth
                          value={newAddress.state}
                          onChange={handleNewAddressChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          required
                          name="country"
                          label="Country"
                          fullWidth
                          value={newAddress.country}
                          onChange={handleNewAddressChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          required
                          name="postal_code"
                          label="Postal Code"
                          fullWidth
                          value={newAddress.postal_code}
                          onChange={handleNewAddressChange}
                        />
                      </Grid>
                    </Grid>
                  )}
                </Paper>
              </RadioGroup>
            </FormControl>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Payment Method
            </Typography>
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                aria-label="payment-method"
                name="payment-method"
                value={selectedPayment}
                onChange={handlePaymentChange}
              >
                {paymentMethods.map((payment) => (
                  <Paper key={payment.id} sx={{ mb: 2, p: 2 }}>
                    <FormControlLabel
                      value={payment.id.toString()}
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="body1">
                            •••• •••• •••• {payment.card_number.slice(-4)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {payment.card_holder_name} | Expires: {payment.expiry_date}
                          </Typography>
                        </Box>
                      }
                      sx={{ width: '100%', m: 0 }}
                    />
                  </Paper>
                ))}
                <Paper sx={{ mb: 2, p: 2 }}>
                  <FormControlLabel
                    value="new"
                    control={<Radio />}
                    label="Use a new payment method"
                    sx={{ width: '100%', m: 0 }}
                  />
                  {selectedPayment === 'new' && (
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      <Grid item xs={12}>
                        <TextField
                          required
                          name="card_number"
                          label="Card Number"
                          fullWidth
                          value={newPayment.card_number}
                          onChange={handleNewPaymentChange}
                          placeholder="1234 5678 9012 3456"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          required
                          name="expiry_date"
                          label="Expiry Date"
                          fullWidth
                          value={newPayment.expiry_date}
                          onChange={handleNewPaymentChange}
                          placeholder="MM/YY"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          required
                          name="card_holder_name"
                          label="Cardholder Name"
                          fullWidth
                          value={newPayment.card_holder_name}
                          onChange={handleNewPaymentChange}
                        />
                      </Grid>
                    </Grid>
                  )}
                </Paper>
              </RadioGroup>
            </FormControl>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <List sx={{ width: '100%' }}>
              {cartItems.map((item) => (
                <ListItem key={item.id} alignItems="flex-start" sx={{ py: 2 }}>
                  <ListItemAvatar sx={{ mr: 2 }}>
                    <Avatar 
                      alt={item.name} 
                      src={item.image_url} 
                      variant="square"
                      sx={{ width: 60, height: 60, borderRadius: 1 }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={item.name}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {item.size && `Size: ${item.size}`} {item.color && `| Color: ${item.color}`}
                        </Typography>
                        <Typography component="span" variant="body2" display="block">
                          Qty: {item.quantity} x ${Number(item.price).toFixed(2)}
                        </Typography>
                      </>
                    }
                  />
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    ${(item.quantity * item.price).toFixed(2)}
                  </Typography>
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body1">Subtotal</Typography>
              <Typography variant="body1">${Number(cartTotal).toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body1">Shipping</Typography>
              <Typography variant="body1">Free</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body1">Tax</Typography>
              <Typography variant="body1">${(cartTotal * 0.1).toFixed(2)}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6">${(cartTotal + cartTotal * 0.1).toFixed(2)}</Typography>
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (orderCompleted) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" color="primary" gutterBottom>
            Thank You For Your Order!
          </Typography>
          <Typography variant="h6" gutterBottom>
            Order #{orderNumber}
          </Typography>
          <Typography variant="body1" paragraph>
            We have received your order and are processing it now.
            You will receive an email confirmation shortly.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/profile')}
            sx={{ mt: 3 }}
          >
            View My Orders
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Checkout
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            {getStepContent(activeStep)}
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2">
                  Items ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
                </Typography>
                <Typography variant="body2">
                  ${cartTotal.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2">Shipping</Typography>
                <Typography variant="body2">Free</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2">Tax (10%)</Typography>
                <Typography variant="body2">
                  ${(cartTotal * 0.1).toFixed(2)}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6">
                  ${(cartTotal + cartTotal * 0.1).toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                {activeStep > 0 && (
                  <Button onClick={handleBack}>
                    Back
                  </Button>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  disabled={loading}
                  sx={{ ml: 'auto' }}
                >
                  {activeStep === steps.length - 1 ? 'Place Order' : 'Next'}
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
      
      <Snackbar
        open={notification !== null}
        autoHideDuration={6000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setNotification(null)} 
          severity={notification?.type} 
          sx={{ width: '100%' }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Checkout; 