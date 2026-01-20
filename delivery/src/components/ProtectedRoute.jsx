import { Navigate } from "react-router-dom";
import { getAuthData } from "../services/api";

const ProtectedRoute = ({ children }) => {
  const authData = getAuthData();
  
  if (!authData || !authData.token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
