'use client';
import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Grid, 
  Typography, 
  Paper,
  CircularProgress
} from '@mui/material';
import axios from 'axios';

interface UserDetailsProps {
  open: boolean;
  onClose: () => void;
  userId: string | null;
}

const UserDetailsDialog = ({ open, onClose, userId }: UserDetailsProps) => {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const fetchUserDetails = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3001/users/${userId}`);
      if (response.data.success) {
        setUserData(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && userId) {
      fetchUserDetails();
    }
  }, [open, userId]);

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogContent>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>User Details</DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>Basic Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Email</Typography>
                  <Typography>{userData?.email}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Profiles</Typography>
                  <Typography>{userData?.profile_count || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary">User Type</Typography>
                  <Typography>{userData?.user_type}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Status</Typography>
                  <Typography>{userData?.status}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Join Date</Typography>
                  <Typography>{userData?.created_at?.split('T')[0]}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Curriculum</Typography>
                  <Typography>{userData?.curriculum}</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserDetailsDialog;