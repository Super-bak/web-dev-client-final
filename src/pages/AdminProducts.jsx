import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AdminProducts = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_ids: [],
    main_image: null,
    additional_images: [],
    variants: [{ sku: '', size: '', color: '', stock_qty: 1, price: '' }]
  });
  const [mainImagePreview, setMainImagePreview] = useState('');
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Check admin access and get token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to access this page');
      navigate('/login');
      return;
    }

    if (!isAdmin()) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
    }
  }, [isAdmin, navigate]);

  // Fetch products and categories on page load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please log in to access this page');
          navigate('/login');
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`
        };

        const [productsRes, categoriesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/admin/products`, { headers }),
          axios.get(`${API_BASE_URL}/api/categories`, { headers })
        ]);
        
        setProducts(productsRes.data.data);
        setCategories(categoriesRes.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response?.status === 403) {
          toast.error('Access denied. Admin privileges required.');
          navigate('/');
        } else if (error.response?.status === 401) {
          toast.error('Please log in to access this page');
          navigate('/login');
        } else {
          toast.error('Failed to load data');
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (isAdmin()) {
      fetchData();
    }
  }, [navigate, isAdmin]);

  // Add console log for categories state
  useEffect(() => {
    console.log('Current categories state:', categories);
  }, [categories]);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle category selection
  const handleCategoryChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => parseInt(option.value));
    setFormData({ ...formData, category_ids: selectedOptions });
  };

  // Handle main image upload
  const handleMainImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should not exceed 5MB');
      return;
    }
    
    try {
      // Create a preview URL
      setMainImagePreview(URL.createObjectURL(file));
      
      // Store the file for later upload
      setFormData({ ...formData, main_image: file });
    } catch (error) {
      toast.error('Failed to process image');
    }
  };

  // Handle additional images upload
  const handleAdditionalImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error('Some images exceed the 5MB limit and will be skipped');
    }
    
    const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024);
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    
    try {
      setFormData(prev => ({
        ...prev,
        additional_images: [...prev.additional_images, ...validFiles]
      }));
      
      setAdditionalImagePreviews(prev => [...prev, ...newPreviews]);
    } catch (error) {
      toast.error('Failed to process one or more images');
    }
  };

  // Handle removing an additional image
  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      additional_images: prev.additional_images.filter((_, i) => i !== index)
    }));
    
    setAdditionalImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Handle variant changes
  const handleVariantChange = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };

  // Add new variant
  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { sku: '', size: '', color: '', stock_qty: 1, price: '' }]
    });
  };

  // Remove variant
  const removeVariant = (index) => {
    if (formData.variants.length === 1) {
      toast.error('Product must have at least one variant');
      return;
    }
    
    const newVariants = formData.variants.filter((_, i) => i !== index);
    setFormData({ ...formData, variants: newVariants });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to create a product');
      navigate('/login');
      return;
    }
    
    if (!formData.main_image) {
      toast.error('Please upload a main product image');
      return;
    }
    
    if (formData.category_ids.length === 0) {
      toast.error('Please select at least one category');
      return;
    }
    
    const invalidVariants = formData.variants.filter(
      v => !v.sku || !v.size || !v.color || !v.stock_qty || !v.price
    );
    
    if (invalidVariants.length > 0) {
      toast.error('Please fill all fields for each variant');
      return;
    }
    
    try {
      setLoading(true);
      
      const headers = {
        Authorization: `Bearer ${token}`
      };

      // Create FormData object for multipart/form-data
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('base_price', formData.price);
      formDataToSend.append('category_ids', JSON.stringify(formData.category_ids));
      formDataToSend.append('variants', JSON.stringify(formData.variants.map(v => ({
        ...v,
        stock_qty: parseInt(v.stock_qty),
        price: parseFloat(v.price)
      }))));
      formDataToSend.append('main_image', formData.main_image);
      
      // Append additional images
      formData.additional_images.forEach((file, index) => {
        formDataToSend.append(`additional_images`, file);
      });

      await axios.post(`${API_BASE_URL}/api/admin/products`, formDataToSend, { 
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Product created successfully');
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        category_ids: [],
        main_image: null,
        additional_images: [],
        variants: [{ sku: '', size: '', color: '', stock_qty: 1, price: '' }]
      });
      
      setMainImagePreview('');
      setAdditionalImagePreviews([]);
      
      // Refresh products list
      const response = await axios.get(`${API_BASE_URL}/api/admin/products`, { headers });
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error creating product:', error);
      if (error.response?.status === 403) {
        toast.error('Access denied. Admin privileges required.');
        navigate('/');
      } else if (error.response?.status === 401) {
        toast.error('Please log in to access this page');
        navigate('/login');
      } else {
        toast.error('Failed to create product');
      }
    } finally {
      setLoading(false);
    }
  };

  // Update delete handler
  const handleDeleteClick = (productId) => {
    setProductToDelete(productId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = {
        Authorization: `Bearer ${token}`
      };

      await axios.delete(`${API_BASE_URL}/api/admin/products/${productToDelete}`, { headers });
      
      toast.success('Product deleted successfully');
      
      // Refresh products list
      const response = await axios.get(`${API_BASE_URL}/api/admin/products`, { headers });
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 4 }}>
        Admin Products Management
      </Typography>
      
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3 }}>
          Create New Product
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic product information */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Base Price ($)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                inputProps={{ step: "0.01", min: "0" }}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Categories</InputLabel>
                <Select
                  multiple
                  value={formData.category_ids}
                  onChange={(e) => {
                    console.log('Selected categories:', e.target.value);
                    const selectedOptions = e.target.value;
                    setFormData({ ...formData, category_ids: selectedOptions });
                  }}
                  renderValue={(selected) => {
                    console.log('Rendering selected categories:', selected);
                    return selected
                      .map(id => categories.find(cat => cat.id === id)?.name)
                      .filter(Boolean)
                      .join(', ');
                  }}
                  required
                  sx={{ 
                    minHeight: '100px',
                    '& .MuiSelect-select': {
                      width: '100%',
                      whiteSpace: 'normal',
                      wordWrap: 'break-word'
                    }
                  }}
                >
                  {categories.map(category => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Image uploads */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Main Product Image
              </Typography>
              <input
                type="file"
                onChange={handleMainImageChange}
                accept="image/*"
                style={{ marginBottom: '1rem' }}
              />
              {mainImagePreview && (
                <Card sx={{ maxWidth: 200 }}>
                  <CardMedia
                    component="img"
                    image={mainImagePreview}
                    alt="Main product preview"
                    sx={{ height: 200, objectFit: 'contain' }}
                  />
                </Card>
              )}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Additional Images
              </Typography>
              <input
                type="file"
                onChange={handleAdditionalImagesChange}
                accept="image/*"
                multiple
                style={{ marginBottom: '1rem' }}
              />
              <Grid container spacing={1}>
                {additionalImagePreviews.map((preview, index) => (
                  <Grid item key={index}>
                    <Card sx={{ position: 'relative', maxWidth: 100 }}>
                      <CardMedia
                        component="img"
                        image={preview}
                        alt={`Additional preview ${index + 1}`}
                        sx={{ height: 100, objectFit: 'cover' }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveImage(index)}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          bgcolor: 'error.main',
                          color: 'white',
                          '&:hover': { bgcolor: 'error.dark' }
                        }}
                      >
                        <FaTrash size={12} />
                      </IconButton>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
            
            {/* Product variants */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Product Variants</Typography>
                <Button
                  startIcon={<FaPlus />}
                  onClick={addVariant}
                  variant="contained"
                  size="small"
                >
                  Add Variant
                </Button>
              </Box>
              
              {formData.variants.map((variant, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle1">Variant #{index + 1}</Typography>
                    <IconButton
                      onClick={() => removeVariant(index)}
                      color="error"
                      size="small"
                    >
                      <FaTrash />
                    </IconButton>
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={2.4}>
                      <TextField
                        fullWidth
                        label="SKU"
                        value={variant.sku}
                        onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                      <TextField
                        fullWidth
                        label="Size"
                        value={variant.size}
                        onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                      <TextField
                        fullWidth
                        label="Color"
                        value={variant.color}
                        onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                      <TextField
                        fullWidth
                        label="Stock"
                        type="number"
                        value={variant.stock_qty}
                        onChange={(e) => handleVariantChange(index, 'stock_qty', e.target.value)}
                        inputProps={{ min: "0" }}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                      <TextField
                        fullWidth
                        label="Price ($)"
                        type="number"
                        value={variant.price}
                        onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                        inputProps={{ step: "0.01", min: "0" }}
                        required
                      />
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Product'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3 }}>
          Existing Products ({products.length})
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Categories</TableCell>
                <TableCell>Variants</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map(product => (
                <TableRow key={product.id} hover>
                  <TableCell>{product.id}</TableCell>
                  <TableCell>
                    {product.image_url ? (
                      <CardMedia
                        component="img"
                        image={product.image_url}
                        alt={product.name}
                        sx={{ width: 50, height: 50, objectFit: 'cover' }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          bgcolor: 'grey.200',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        No img
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>
                    {product.base_price ? `$${Number(product.base_price).toFixed(2)}` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {Array.isArray(product.categories) 
                      ? product.categories.map(cat => cat.name).join(', ')
                      : product.category_id 
                        ? categories.find(cat => cat.id === product.category_id)?.name || 'Unknown'
                        : 'No categories'}
                  </TableCell>
                  <TableCell>
                    {Array.isArray(product.product_variants) 
                      ? product.product_variants.length 
                      : 0}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleDeleteClick(product.id)}
                      color="error"
                      size="small"
                    >
                      <FaTrash />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No products found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this product?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminProducts; 