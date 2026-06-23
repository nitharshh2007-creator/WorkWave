import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // This is a basic check. For production, you might want to decode 
  // the JWT to check for expiry or even verify it with a backend endpoint.
  const token = localStorage.getItem('token');

  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;