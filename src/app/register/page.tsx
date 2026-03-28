"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Layout from "@/components/layout/Layout";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight } from "lucide-react";
import styles from "@/styles/pages/Auth.module.css";
import { useAuth } from "@/context/AuthContext";

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNo: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { register, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) router.push("/dashboard");
  }, [isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const { confirmPassword: _c, ...userData } = formData;
      const response = await register({
        ...userData,
        contactNo: userData.contactNo ? Number(userData.contactNo) : undefined,
      });

      if (response.success) {
        router.push("/login?registered=true");
      } else {
        setError(response.message || "Registration failed. Please try again.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred during registration.");
    }
  };

  return (
    <Layout
      title="Sign Up - Sehat-Saathi"
      description="Create your Sehat-Saathi account to start your mental health journey."
    >
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <h1 className={styles.title}>Create Account</h1>
            <p className={styles.subtitle}>Start your mental health journey today</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.authForm}>
            {/* Name row */}
            <div className={styles.nameRow}>
              <div className={styles.inputGroup}>
                <label htmlFor="firstName" className={styles.label}>First Name</label>
                <div className={styles.inputContainer}>
                  <User size={20} className={styles.inputIcon} />
                  <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} className={styles.input} placeholder="First name" required />
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="lastName" className={styles.label}>Last Name</label>
                <div className={styles.inputContainer}>
                  <User size={20} className={styles.inputIcon} />
                  <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} className={styles.input} placeholder="Last name" required />
                </div>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>Email Address</label>
              <div className={styles.inputContainer}>
                <Mail size={20} className={styles.inputIcon} />
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={styles.input} placeholder="Enter your email" required />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="contactNo" className={styles.label}>
                Contact Number <span style={{ fontWeight: 400, color: "#9ca3af" }}>(optional)</span>
              </label>
              <div className={styles.inputContainer}>
                <Phone size={20} className={styles.inputIcon} />
                <input type="tel" id="contactNo" name="contactNo" value={formData.contactNo} onChange={handleChange} className={styles.input} placeholder="e.g. 98765 43210" pattern="[0-9]*" inputMode="numeric" />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <div className={styles.inputContainer}>
                <Lock size={20} className={styles.inputIcon} />
                <input type={showPassword ? "text" : "password"} id="password" name="password" value={formData.password} onChange={handleChange} className={styles.input} placeholder="Create a password" required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className={styles.passwordToggle}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
              <div className={styles.inputContainer}>
                <Lock size={20} className={styles.inputIcon} />
                <input type={showConfirmPassword ? "text" : "password"} id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={styles.input} placeholder="Confirm your password" required />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className={styles.passwordToggle}>
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <button type="submit" disabled={isLoading} className={styles.submitButton}>
              {isLoading ? <div className={styles.spinner} /> : <> Create Account <ArrowRight size={20} /> </>}
            </button>
          </form>

          {/* Profile completion hint */}
          <div style={{ marginTop: 16, padding: "12px 16px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, fontSize: 13, color: "#065f46" }}>
            After signup you can fill in your profile to get a more personalised experience — university, occupation, age group, and more.
          </div>

          <div className={styles.authFooter}>
            <p className={styles.footerText}>
              Already have an account?{" "}
              <Link href="/login" className={styles.footerLink}>Sign in here</Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage;
