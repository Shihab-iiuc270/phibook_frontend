// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router';
import useAuthContext from '../hooks/useAuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuthContext();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
