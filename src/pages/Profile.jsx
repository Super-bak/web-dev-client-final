import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import api from '../api/config';
import { authService } from '../api/authService';

// Function to generate initials from name
const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Function to generate a color based on name
const stringToColor = (string) => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view your profile');
          return;
        }

        // Fetch profile data
        const profileResponse = await api.get('/profile');

        if (profileResponse.data.success) {
          setProfile(profileResponse.data.data);
          setFullName(profileResponse.data.data.name || '');
        } else {
          setError(profileResponse.data.message || 'Failed to fetch profile');
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        if (err.response?.status === 401) {
          setError('Your session has expired. Please log in again.');
          authService.logout();
        } else {
          setError('Failed to load profile. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchProfileData();
    } else {
      setError('Please log in to view your profile');
    }
  }, [isAuthenticated]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to update your profile');
        return;
      }

      const response = await api.put('/profile', { name: fullName });

      if (response.data.success) {
        setProfile(response.data.data);
        setEditing(false);
        setNotification({
          type: 'success',
          message: 'Profile updated successfully!'
        });
      } else {
        setNotification({
          type: 'error',
          message: response.data.message || 'Failed to update profile'
        });
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        authService.logout();
      } else {
        setNotification({
          type: 'error',
          message: 'Failed to update profile. Please try again.'
        });
      }
    } finally {
      setLoading(false);
    }
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
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const displayName = profile?.name || user?.name || 'User';
  const avatarColor = stringToColor(displayName);
  const initials = getInitials(displayName);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 2, boxShadow: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar 
            sx={{ 
              width: 100, 
              height: 100, 
              bgcolor: avatarColor,
              boxShadow: 2,
              mr: 4,
              fontSize: '2.5rem'
            }}
          >
            {initials}
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {editing ? (
                <TextField
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  size="small"
                  sx={{ mb: 1 }}
                />
              ) : (
                displayName
              )}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {profile?.email || user?.email}
            </Typography>
            <Box sx={{ mt: 2 }}>
              {editing ? (
                <Button 
                  variant="contained" 
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  size="small"
                >
                  Save
                </Button>
              ) : (
                <Button 
                  variant="outlined" 
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                  size="small"
                >
                  Edit Profile
                </Button>
              )}
            </Box>
          </Box>
        </Box>
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

export default Profile; 