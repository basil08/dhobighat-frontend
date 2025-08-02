'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import LoginForm from '@/components/LoginForm';
import SignupForm from '@/components/SignupForm';
import { Loader2 } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect if user is already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if user is authenticated (will redirect)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">DhobiGhat</h1>
          <p className="text-gray-600">Manage your laundry with ease</p>
        </div>

        {/* Auth Forms */}
        {isLogin ? (
          <LoginForm onSwitchToSignup={() => setIsLogin(false)} />
        ) : (
          <SignupForm onSwitchToLogin={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
} 