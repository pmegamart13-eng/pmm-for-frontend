import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MobileLogin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // ⚡ Direct Home Page Redirect
    navigate("/");
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <h1 className="text-xl text-gray-600">Redirecting...</h1>
    </div>
  );
};

export default MobileLogin;
