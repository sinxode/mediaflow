import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import Button from '../../components/Button/Button';
import Card from '../../components/Card/Card';
import styles from './Login.module.scss';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect destination after login
  const from = location.state?.from?.pathname || '/dashboard';

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await login(email, password);
      setSuccess(true);
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000); // 1s success message delay before redirecting
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={styles.loginCardWrapper}
      >
        <Card padding={true} className={styles.loginCard}>
          {/* Logo Section */}
          <div className={styles.logoHeader}>
            <div className={styles.logoBadge}>
              <img src="/logo.png" alt="MediaFlow Logo" className={styles.logoImg} />
            </div>
            <h1 className={styles.title}>Welcome to MediaFlow</h1>
            <p className={styles.subtitle}>Enter credentials to access your workspace.</p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.errorAlert}
              >
                <ShieldAlert className={styles.alertIcon} />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.successAlert}
              >
                <CheckCircle2 className={styles.alertIcon} />
                <span>Session Authorized. Routing to dashboard...</span>
              </motion.div>
            )}

            {/* Email Field */}
            <div className={styles.fieldBlock}>
              <label className={styles.label}>Email Address</label>
              <div className={styles.inputWrapper}>
                <Mail className={styles.inputIcon} />
                <input
                  type="email"
                  placeholder="name@mediaflow.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                  required
                  disabled={loading || success}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className={styles.fieldBlock}>
              <label className={styles.label}>Password</label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.input}
                  required
                  disabled={loading || success}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.passwordToggle}
                  aria-label="Toggle password visibility"
                  disabled={loading || success}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {/* Remember Me Toggle */}
            <div className={styles.formMeta}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className={styles.checkbox}
                  disabled={loading || success}
                />
                <span>Remember session</span>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={loading || success}
              className={styles.submitBtn}
            >
              {loading ? (
                <div className={styles.spinnerRow}>
                  <div className={styles.btnSpinner} />
                  <span>Verifying Session...</span>
                </div>
              ) : (
                'Sign In to Platform'
              )}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
