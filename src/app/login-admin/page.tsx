"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import styles from '@/styles/pages/Auth.module.css';
import { useAuth } from '@/context/AuthContext';

const AdminLoginPage: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { loginAdmin, isLoading, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      router.push('/admin');
    }
  }, [isAuthenticated, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { email, password } = formData;
      const response = await loginAdmin(email, password);
      if (!response.success) {
        setError(response.message || 'Login failed. Please try again.');
      } else {
        router.push('/admin');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login. Please try again.');
    }
  };

  return (
    <Layout title="Admin Login - Sehat Sathi" description="Admin sign-in">
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <h1 className={styles.title}>Admin Sign In</h1>
            <p className={styles.subtitle}>Administrative access</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.authForm}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>Email Address</label>
              <div className={styles.inputContainer}>
                <Mail size={20} className={styles.inputIcon} />
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={styles.input} placeholder="Enter your email" required />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <div className={styles.inputContainer}>
                <Lock size={20} className={styles.inputIcon} />
                <input type={showPassword ? 'text' : 'password'} id="password" name="password" value={formData.password} onChange={handleChange} className={styles.input} placeholder="Enter your password" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className={styles.passwordToggle}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <button type="submit" disabled={isLoading} className={styles.submitButton}>
              {isLoading ? <div className={styles.spinner} /> : (<><span>Sign In</span><ArrowRight size={20} /></>)}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AdminLoginPage;
