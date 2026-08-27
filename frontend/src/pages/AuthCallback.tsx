import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setToken(token);
      navigate('/');
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, setToken]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p>Authenticating...</p>
    </div>
  );
}
