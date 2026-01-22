import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import api from "../utils/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogAction } from '../components/ui/dialog';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { useNavigate } from 'react-router-dom'; // Added import

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true); // true for login, false for signup
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactNo: '',
    role: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) {
      redirectBasedOnRole(role);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
    setShowErrorAlert(false);
  };

  const redirectBasedOnRole = (role) => {
    switch (role) {
      case 'Admin':
        navigate('/admindb'); // Fixed: using navigate instead of window.location.href
        break;
      case 'Organizer':
        navigate('/orgdb'); // Fixed: using navigate instead of window.location.href
        break;
      case 'User':
        navigate('/userdb'); // Fixed: using navigate instead of window.location.href
        break;
      default:
        setError('Invalid user role');
        setShowErrorAlert(true);
    }
  };

  const handleLogin = async () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    
    setLoading(true);
    
    try {
      const loginData = {
        email: formData.email,
        password: formData.password
      };

      const response = await api.post("/users/login", loginData);

      if (response.data?.token && response.data?.user) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.user.role);

        setError('');
        setShowErrorAlert(false);
        redirectBasedOnRole(response.data.user.role);
      } else {
        setError('Invalid response from server');
        setShowErrorAlert(true);
      }
    } catch (error) {
      console.error("Login Error:", error.response?.data || error.message);
      let errorMessage = 'Invalid email or password';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      setShowErrorAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    const newErrors = {};
    if (!formData.fullname) newErrors.fullname = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm password is required';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.contactNo) newErrors.contactNo = 'Contact number is required';
    if (!formData.role) newErrors.role = 'Role is required';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    
    try {
      const signupData = {
        fullname: formData.fullname,
        email: formData.email,
        password: formData.password,
        contactNo: formData.contactNo,
        role: formData.role
      };

      const response = await api.post("/users/signup", signupData);

      if (response.data?.user) {
        setError('');
        alert(response.data.message || 'Signup successful! Please login.');
        setIsLogin(true);
        setFormData({
          fullname: '',
          email: '',
          password: '',
          confirmPassword: '',
          contactNo: '',
          role: ''
        });
      } else {
        setError('Signup failed: Invalid response data');
        setShowErrorAlert(true);
      }
    } catch (error) {
      console.error("Signup Error:", error.response?.data || error.message);
      let errorMessage = 'An error occurred during signup';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      setShowErrorAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    if (isLogin) {
      await handleLogin();
    } else {
      await handleSignup();
    }
  };

  const handleKeyPress = (e) => {
    // If Enter key is pressed and not in a textarea
    if (e.key === 'Enter' && e.target.type !== 'textarea') {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`Social login with ${provider}`);
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Background Image Section */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1920&h=1080&fit=crop"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 to-blue-900/30"></div>
      </div>

      {/* Form Card - Smaller and Centered with top margin */}
      <div className="relative z-10 flex items-center justify-center w-full pt-24 p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm p-4">
          {/* Error Alert - Smaller */}
          {showErrorAlert && (
            <Alert variant="destructive" className="mb-4 text-sm">
              <AlertTitle className="text-sm">Error</AlertTitle>
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} onKeyDown={handleKeyPress}>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {isLogin ? 'Welcome back!' : 'Create your account'}
              </h1>
              <p className="text-gray-600 mb-6 text-sm">
                {isLogin ? 'Sign in to your account' : 'Fill in your details to get started'}
              </p>

              <div className="space-y-2">
                {/* Signup Only Fields */}
                {!isLogin && (
                  <div>
                    <input
                      type="text"
                      name="fullname"
                      placeholder="Full Name"
                      value={formData.fullname}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                    />
                    {errors.fullname && (
                      <p className="text-red-500 text-xs mt-1">{errors.fullname}</p>
                    )}
                  </div>
                )}

                {/* Email Field - Always Visible */}
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Password Field - Always Visible */}
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password - Signup Only */}
                {!isLogin && (
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                )}

                {/* Contact Number - Signup Only */}
                {!isLogin && (
                  <div>
                    <input
                      type="tel"
                      name="contactNo"
                      placeholder="Contact Number"
                      value={formData.contactNo}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                    />
                    {errors.contactNo && (
                      <p className="text-red-500 text-xs mt-1">{errors.contactNo}</p>
                    )}
                  </div>
                )}

                {/* Role Selection - Signup Only */}
                {!isLogin && (
                  <div>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px- py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                    >
                      <option value="" disabled>Select Role</option>
                      <option value="User">User</option>
                      <option value="Organizer">Organizer</option>
                      <option value="Admin">Admin</option>
                    </select>
                    {errors.role && (
                      <p className="text-red-600 text-xs mt-1">{errors.role}</p>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold transition-colors text-sm disabled:opacity-50"
                >
                  {loading ? (isLogin ? 'Logging in...' : 'Creating account...') : (isLogin ? 'Log in' : 'Sign up')}
                </button>

                {/* Forgot Password - Login Only */}
                {isLogin && (
                  <div className="text-center">
                    <a href="#" className="text-blue-600 hover:underline text-xs">
                      Forgot password?
                    </a>
                  </div>
                )}

                {/* Social Login - Login Only */}
                {isLogin && (
                  <>
                    <div className="text-center">
                      <p className="text-gray-500 text-xs mb-4">Or sign in with</p>
                    </div>

                    {/* Social Login Buttons - Smaller */}
                    <div className="flex justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleSocialLogin('apple')}
                        className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSocialLogin('google')}
                        className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSocialLogin('facebook')}
                        className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </button>
                    </div>

                    <div className="text-center mt-4">
                      <p className="text-xs text-gray-600 leading-tight">
                        By clicking Continue or the Apple, Google, or Facebook icons, you agree to Eventbrite's{' '}
                        <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and{' '}
                        <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
                      </p>
                    </div>
                  </>
                )}

                {/* Toggle between Login and Signup */}
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setFormData({
                        fullname: '',
                        email: '',
                        password: '',
                        confirmPassword: '',
                        contactNo: '',
                        role: ''
                      });
                      setErrors({});
                      setShowErrorAlert(false);
                    }}
                    className="text-gray-700 hover:underline text-xs"
                  >
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span className="font-semibold">{isLogin ? 'Sign up' : 'Log in'}</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;