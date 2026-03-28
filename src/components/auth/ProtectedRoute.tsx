"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  allowedRoles?: string[]; // e.g., ['admin', 'counsellor']
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false, allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        router.push('/login');
      }
      // If admin-only route and user is not admin, redirect to dashboard
      else if (adminOnly && user?.role !== 'admin') {
        router.push('/dashboard');
      }
      // If allowedRoles is provided, enforce membership
      else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, router, adminOnly, allowedRoles, user]);

  // Show nothing while loading or redirecting
  if (
    isLoading ||
    !isAuthenticated ||
    (adminOnly && user?.role !== 'admin') ||
    (allowedRoles && user && !allowedRoles.includes(user.role))
  ) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;