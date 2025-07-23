'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CircularProgress } from '@mui/material';

/**
 * This is the root page of the application.
 * Its sole purpose is to check the user's login status from sessionStorage
 * and redirect them to the appropriate page (/login or /dashboard).
 */
export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';

    // Redirect based on login status
    if (isLoggedIn) {
      router.replace('/dashboard'); 
    } else {
      router.replace('/login'); 
    }
  }, [router]);

  // Render a loading state while the redirect is happening
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <CircularProgress />
      <p className="ml-4 text-muted-foreground">Loading...</p>
    </div>
  );
}
