import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import api from "../utils/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogAction } from '../components/ui/dialog';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { useNavigate } from 'react-router-dom';

const LoginSignup = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
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
  
  // Add a ref to track if redirect has been attempted
  const redirectAttempted = React.useRef(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Only check and redirect once
    if (!redirectAttempted.current) {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      
      if (token && role) {
        redirectAttempted.current = true;
        redirectBasedOnRole(role);
      }
    }
  }, []); // Empty dependency array - runs only once on mount

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear specific field error
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
    setShowErrorAlert(false);
  };

  const redirectBasedOnRole = (role) => {
    switch (role) {
      case 'Admin':
        navigate('/admindb', { replace: true });
        break;
      case 'Organizer':
        navigate('/orgdb', { replace: true });
        break;
      case 'User':
        navigate('/userdb', { replace: true });
        break;
      default:
        setError('Invalid user role');
        setShowErrorAlert(true);
        // Clear invalid role from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('role');
    }
  };

  const handleLogin = async () => {
    // Clear previous errors
    setErrors({});
    setError('');
    setShowErrorAlert(false);
    
    const newErrors = {};
    
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      const loginData = {
        email: formData.email.trim(),
        password: formData.password
      };

      const response = await api.post("/users/login", loginData);

      if (response.data?.token && response.data?.user) {
        // Clear any existing data first
        localStorage.clear();
        
        // Set new data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.user.role);
        
        // Optional: store user data
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        setError('');
        setShowErrorAlert(false);
        
        // Use replace to prevent going back to login page
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
    // Clear previous errors
    setErrors({});
    setError('');
    setShowErrorAlert(false);
    
    const newErrors = {};
    
    if (!formData.fullname?.trim()) newErrors.fullname = 'Full name is required';
    if (!formData.email?.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm password is required';
    
    if (formData.password && formData.confirmPassword && 
        formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.contactNo?.trim()) newErrors.contactNo = 'Contact number is required';
    if (!formData.role) newErrors.role = 'Role is required';

    // Password strength validation (optional)
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    
    try {
      const signupData = {
        fullname: formData.fullname.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        contactNo: formData.contactNo.trim(),
        role: formData.role
      };

      const response = await api.post("/users/signup", signupData);

      if (response.data?.user) {
        setError('');
        
        // Show success message
        alert(response.data.message || 'Signup successful! Please login.');
        
        // Switch to login mode and clear form
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
    e.preventDefault();
    if (isLogin) {
      await handleLogin();
    } else {
      await handleSignup();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit(e);
    }
  };

  const toggleMode = () => {
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
    setError('');
    setShowErrorAlert(false);
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

      {/* Form Card */}
      <div className="relative z-10 flex items-center justify-center w-full pt-24 p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm p-4">
          {/* Error Alert */}
          {showErrorAlert && error && (
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
                      className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm ${
                        errors.fullname ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.fullname && (
                      <p className="text-red-500 text-xs mt-1">{errors.fullname}</p>
                    )}
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm pr-10 ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
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
                      className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm pr-10 ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
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
                      className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm ${
                        errors.contactNo ? 'border-red-500' : 'border-gray-300'
                      }`}
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
                      className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm ${
                        errors.role ? 'border-red-500' : 'border-gray-300'
                      }`}
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
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isLogin ? 'Logging in...' : 'Creating account...'}
                    </span>
                  ) : (
                    isLogin ? 'Log in' : 'Sign up'
                  )}
                </button>

                {/* Forgot Password - Login Only */}
                {isLogin && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => alert('Password reset functionality coming soon!')}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Toggle between Login and Signup */}
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="text-gray-700 hover:underline text-xs"
                  >
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span className="font-semibold text-blue-600">
                      {isLogin ? 'Sign up' : 'Log in'}
                    </span>
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