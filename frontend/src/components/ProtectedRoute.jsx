import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const hasStoredToken = Boolean(localStorage.getItem('docflow_token'));

  if (!isAuthenticated && !hasStoredToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
