import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const navigate = useNavigate();

  // Since authentication is disabled, redirect to main page
  useEffect(() => {
    navigate('/');
  }, [navigate]);

  return null;
};

export default Auth;