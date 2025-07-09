'use client';
import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CircularProgress, Typography } from '@mui/material';
import axios, { AxiosError } from 'axios';
import dayjs from 'dayjs';

interface UserDetailsProps {
  open: boolean;
  onClose: () => void;
  userId: string | null;
}

interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  user_type: string;
  age: string | null;
  status: string;
  curriculum: string;
  profile_count: string;
}

// A reusable component for displaying a piece of user data
const DetailItem = ({ label, value }: { label: string, value: string | null | undefined }) => (
    <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold">{value || 'N/A'}</p>
    </div>
);

const UserDetailsDialog = ({ open, onClose, userId }: UserDetailsProps) => {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId) return;
      
      setLoading(true);
      setError(null);
      setUserData(null);

      try {
        // Corrected: Use the environment variable and the correct API route
        const url = `${API_BASE_URL}/users/${userId}`;
        const response = await axios.get(url);

        if (response.data.success) {
          setUserData(response.data.user);
        } else {
          throw new Error(response.data.error || 'Failed to fetch user details.');
        }
      } catch (err) {
        const axiosError = err as AxiosError;
        console.error('Error fetching user details:', axiosError);
        setError(`Failed to load details. Status: ${axiosError.response?.status || 'Network Error'}`);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchUserDetails();
    }
  }, [open, userId, API_BASE_URL]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {loading && (
            <div className="flex justify-center items-center h-48">
              <CircularProgress />
            </div>
          )}
          {error && (
            <div className="flex justify-center items-center h-48">
              <Typography color="error">{error}</Typography>
            </div>
          )}
          {userData && (
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <DetailItem label="Email" value={userData.email} />
              <DetailItem label="User Type" value={userData.user_type} />
              <DetailItem label="Status" value={userData.status} />
              <DetailItem label="Profile Count" value={userData.profile_count} />
              <DetailItem label="Curriculum" value={userData.curriculum} />
              <DetailItem label="Age" value={userData.age} />
              <DetailItem label="Join Date" value={dayjs(userData.created_at).format('DD MMM YYYY')} />
              <DetailItem label="Last Login" value={dayjs(userData.updated_at).format('DD MMM YYYY')} />
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsDialog;
