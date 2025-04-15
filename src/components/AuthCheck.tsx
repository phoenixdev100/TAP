
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface AuthCheckProps {
  children: React.ReactNode;
}

const AuthCheck: React.FC<AuthCheckProps> = ({ children }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      navigate("/home");
    }
  }, [navigate]);

  return <>{children}</>;
};

export default AuthCheck;
