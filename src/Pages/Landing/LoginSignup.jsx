import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Building2, MapPin, Award, DollarSign } from 'lucide-react';
import api from "../../utils/api"
import { Alert, AlertTitle, AlertDescription } from '../../components/ui/alert';
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
    role: '',
    // Organizer specific fields
    organizerDetails: {
      businessName: '',
      contactPerson: '',
      contactPhone: '',
      establishedYear: '',
      expertise: [],
      serviceAreas: [],
      pricing: {
        wedding: { min: '', max: '' },
        birthday: { min: '', max: '' },
        corporate: { min: '', max: '' },
        conference: { min: '', max: '' },
        party: { min: '', max: '' }
      }
    }
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  
  // City options for Nepal
  const cityOptions = [
    'Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Chitwan',
    'Biratnagar', 'Butwal', 'Nepalgunj', 'Dharan', 'Other'
  ];

  // Event type options
  const eventTypeOptions = [
    { value: 'wedding', label: 'Wedding' },
    { value: 'birthday', label: 'Birthday' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'conference', label: 'Conference' },
    { value: 'party', label: 'Party' },
    { value: 'anniversary', label: 'Anniversary' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'concert', label: 'Concert' },
    { value: 'festival', label: 'Festival' }
  ];

  // Year options for established year (last 50 years)
  const yearOptions = Array.from(
    { length: 50 }, 
    (_, i) => new Date().getFullYear() - i
  );

  const redirectAttempted = React.useRef(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    if (!redirectAttempted.current) {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      
      if (token && role) {
        redirectAttempted.current = true;
        redirectBasedOnRole(role);
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle nested organizer details
    if (name.startsWith('organizer.')) {
      const path = name.split('.');
      
      if (path.length === 2) {
        // Simple organizer field
        setFormData(prev => ({
          ...prev,
          organizerDetails: {
            ...prev.organizerDetails,
            [path[1]]: value
          }
        }));
      } else if (path.length === 4 && path[1] === 'pricing') {
        // Pricing field - organizer.pricing.wedding.min
        const eventType = path[2];
        const field = path[3];
        setFormData(prev => ({
          ...prev,
          organizerDetails: {
            ...prev.organizerDetails,
            pricing: {
              ...prev.organizerDetails.pricing,
              [eventType]: {
                ...prev.organizerDetails.pricing[eventType],
                [field]: value
              }
            }
          }
        }));
      }
    } else if (name === 'expertise') {
      // Handle expertise checkboxes
      setFormData(prev => ({
        ...prev,
        organizerDetails: {
          ...prev.organizerDetails,
          expertise: checked 
            ? [...prev.organizerDetails.expertise, value]
            : prev.organizerDetails.expertise.filter(item => item !== value)
        }
      }));
    } else if (name === 'serviceAreas') {
      // Handle service areas checkboxes
      setFormData(prev => ({
        ...prev,
        organizerDetails: {
          ...prev.organizerDetails,
          serviceAreas: checked
            ? [...prev.organizerDetails.serviceAreas, { city: value }]
            : prev.organizerDetails.serviceAreas.filter(item => item.city !== value)
        }
      }));
    } else {
      // Regular fields
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
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
        localStorage.removeItem('token');
        localStorage.removeItem('role');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Basic validation for all users
    if (!formData.fullname?.trim()) newErrors.fullname = 'Full name is required';
    if (!formData.email?.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm password is required';
    
    if (formData.password && formData.confirmPassword && 
        formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.contactNo?.trim()) newErrors.contactNo = 'Contact number is required';
    if (!formData.role) newErrors.role = 'Role is required';
    
    // Organizer validation if role is Organizer
    if (formData.role === 'Organizer') {
      if (!formData.organizerDetails.businessName?.trim()) {
        newErrors['organizer.businessName'] = 'Business name is required';
      }
      
      if (!formData.organizerDetails.contactPerson?.trim()) {
        newErrors['organizer.contactPerson'] = 'Contact person name is required';
      }
      
      if (!formData.organizerDetails.contactPhone?.trim()) {
        newErrors['organizer.contactPhone'] = 'Contact phone is required';
      }
      
      if (formData.organizerDetails.expertise.length === 0) {
        newErrors.expertise = 'Select at least one event type';
      }
      
      if (formData.organizerDetails.serviceAreas.length === 0) {
        newErrors.serviceAreas = 'Select at least one service area';
      }
    }
    
    return newErrors;
  };

  const handleLogin = async () => {
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
        localStorage.clear();
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.user.role);
        
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }

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
    // Validate all fields including organizer fields
    const formErrors = validateForm();
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      // Clean up pricing data (remove empty values)
      const cleanedPricing = {};
      Object.entries(formData.organizerDetails.pricing).forEach(([eventType, range]) => {
        if (range.min || range.max) {
          cleanedPricing[eventType] = {
            min: range.min ? Number(range.min) : 0,
            max: range.max ? Number(range.max) : 0
          };
        }
      });

      const signupData = {
        fullname: formData.fullname.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        contactNo: formData.contactNo.trim(),
        role: formData.role,
        ...(formData.role === 'Organizer' && {
          organizerDetails: {
            businessName: formData.organizerDetails.businessName.trim(),
            contactPerson: formData.organizerDetails.contactPerson.trim(),
            contactPhone: formData.organizerDetails.contactPhone.trim(),
            establishedYear: formData.organizerDetails.establishedYear || null,
            expertise: formData.organizerDetails.expertise,
            serviceAreas: formData.organizerDetails.serviceAreas,
            pricing: cleanedPricing
          }
        })
      };

      const response = await api.post("/users/signup", signupData);

      if (response.data?.user) {
        setError('');
        alert('Signup successful! Please login.');
        setIsLogin(true);
        setFormData({
          fullname: '',
          email: '',
          password: '',
          confirmPassword: '',
          contactNo: '',
          role: '',
          organizerDetails: {
            businessName: '',
            contactPerson: '',
            contactPhone: '',
            establishedYear: '',
            expertise: [],
            serviceAreas: [],
            pricing: {
              wedding: { min: '', max: '' },
              birthday: { min: '', max: '' },
              corporate: { min: '', max: '' },
              conference: { min: '', max: '' },
              party: { min: '', max: '' }
            }
          }
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

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      fullname: '',
      email: '',
      password: '',
      confirmPassword: '',
      contactNo: '',
      role: '',
      organizerDetails: {
        businessName: '',
        contactPerson: '',
        contactPhone: '',
        establishedYear: '',
        expertise: [],
        serviceAreas: [],
        pricing: {
          wedding: { min: '', max: '' },
          birthday: { min: '', max: '' },
          corporate: { min: '', max: '' },
          conference: { min: '', max: '' },
          party: { min: '', max: '' }
        }
      }
    });
    setErrors({});
    setError('');
    setShowErrorAlert(false);
  };

  // Render organizer fields - appears when role is Organizer
  const renderOrganizerFields = () => {
    if (formData.role !== 'Organizer') return null;

    return (
      <div className="space-y-4 mt-6 pt-6 border-t-2 border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Building2 className="w-5 h-5 mr-2 text-blue-600" />
          Business Information
        </h2>

        {/* Business Identity */}
        <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Business Name *
            </label>
            <input
              type="text"
              name="organizer.businessName"
              placeholder="Enter your business name"
              value={formData.organizerDetails.businessName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm ${
                errors['organizer.businessName'] ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors['organizer.businessName'] && (
              <p className="text-red-500 text-xs mt-1">{errors['organizer.businessName']}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Contact Person Name *
            </label>
            <input
              type="text"
              name="organizer.contactPerson"
              placeholder="Enter contact person name"
              value={formData.organizerDetails.contactPerson}
              onChange={handleInputChange}
              className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm ${
                errors['organizer.contactPerson'] ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors['organizer.contactPerson'] && (
              <p className="text-red-500 text-xs mt-1">{errors['organizer.contactPerson']}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Contact Phone *
            </label>
            <input
              type="tel"
              name="organizer.contactPhone"
              placeholder="Enter contact phone number"
              value={formData.organizerDetails.contactPhone}
              onChange={handleInputChange}
              className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm ${
                errors['organizer.contactPhone'] ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors['organizer.contactPhone'] && (
              <p className="text-red-500 text-xs mt-1">{errors['organizer.contactPhone']}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Established Year (Optional)
            </label>
            <select
              name="organizer.establishedYear"
              value={formData.organizerDetails.establishedYear}
              onChange={handleInputChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            >
              <option value="">Select year</option>
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Service Areas */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="block text-xs font-medium text-gray-600 mb-2 flex items-center">
            <MapPin className="w-4 h-4 mr-1 text-blue-600" />
            Service Areas * (Select cities you serve)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {cityOptions.map(city => (
              <label key={city} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  name="serviceAreas"
                  value={city}
                  checked={formData.organizerDetails.serviceAreas.some(area => area.city === city)}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>{city}</span>
              </label>
            ))}
          </div>
          {errors.serviceAreas && (
            <p className="text-red-500 text-xs mt-2">{errors.serviceAreas}</p>
          )}
        </div>

        {/* Event Types */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="block text-xs font-medium text-gray-600 mb-2 flex items-center">
            <Award className="w-4 h-4 mr-1 text-blue-600" />
            Event Types * (Select what you organize)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {eventTypeOptions.map(event => (
              <label key={event.value} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  name="expertise"
                  value={event.value}
                  checked={formData.organizerDetails.expertise.includes(event.value)}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>{event.label}</span>
              </label>
            ))}
          </div>
          {errors.expertise && (
            <p className="text-red-500 text-xs mt-2">{errors.expertise}</p>
          )}
        </div>

        {/* Optional Pricing */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="block text-xs font-medium text-gray-600 mb-2 flex items-center">
            <DollarSign className="w-4 h-4 mr-1 text-blue-600" />
            Pricing (Optional - helps with matching)
          </label>
          <p className="text-xs text-gray-500 mb-3">Fill only for event types you selected above</p>
          
          {formData.organizerDetails.expertise.map(eventType => {
            const eventLabel = eventTypeOptions.find(opt => opt.value === eventType)?.label || eventType;
            return (
              <div key={eventType} className="mb-3 p-2 bg-white rounded border border-gray-200">
                <p className="text-sm font-medium mb-2">{eventLabel}</p>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    name={`organizer.pricing.${eventType}.min`}
                    placeholder="Min (Rs)"
                    value={formData.organizerDetails.pricing[eventType]?.min || ''}
                    onChange={handleInputChange}
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    name={`organizer.pricing.${eventType}.max`}
                    placeholder="Max (Rs)"
                    value={formData.organizerDetails.pricing[eventType]?.max || ''}
                    onChange={handleInputChange}
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-gray-500 mt-2">* Required fields</p>
      </div>
    );
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
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-4 max-h-[90vh] overflow-y-auto">
          {/* Error Alert */}
          {showErrorAlert && error && (
            <Alert variant="destructive" className="mb-4 text-sm">
              <AlertTitle className="text-sm">Error</AlertTitle>
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {isLogin ? 'Welcome back!' : 'Create your account'}
              </h1>
              <p className="text-gray-600 mb-6 text-sm">
                {isLogin ? 'Sign in to your account' : 'Fill in your details to get started'}
              </p>

              {isLogin ? (
                /* LOGIN FORM */
                <div className="space-y-2">
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
                </div>
              ) : (
                /* SIGNUP FORM */
                <div className="space-y-2">
                  {/* Common fields for all users */}
                  <div>
                    <input
                      type="text"
                      name="fullname"
                      placeholder="Full Name *"
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

                  <div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email *"
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

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password *"
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

                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm Password *"
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

                  <div>
                    <input
                      type="tel"
                      name="contactNo"
                      placeholder="Contact Number *"
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

                  <div>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm ${
                        errors.role ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="" disabled>Select Role *</option>
                      <option value="User">User</option>
                      <option value="Organizer">Organizer</option>
                      <option value="Admin">Admin</option>
                    </select>
                    {errors.role && (
                      <p className="text-red-600 text-xs mt-1">{errors.role}</p>
                    )}
                  </div>

                  {/* Organizer fields - appears when Organizer is selected */}
                  {renderOrganizerFields()}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-4"
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
                <div className="text-center mt-3">
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
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;