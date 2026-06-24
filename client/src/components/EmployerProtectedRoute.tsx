import React, { useMemo } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const EmployerProtectedRoute: React.FC = () => {
  const token = localStorage.getItem('token');
  const user = useMemo(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }, []);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'employer') {
    // Redirect to a general dashboard or an unauthorized page
    // For now, redirecting to login.
    return <Navigate to="/login" replace />;
  }

  // Optional: Add a loading spinner while checking auth
  // For this implementation, the check is synchronous.
  // if (isLoading) {
  //   return <LoadingSpinner />;
  // }

  return <Outlet />;
};

export default EmployerProtectedRoute;
