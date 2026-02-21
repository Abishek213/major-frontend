import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import api from "../../utils/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogAction,
} from "../../components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "../../components/ui/alert";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const LoginSignup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
    contactNo: "",
    role: "",
    // Organizer specific fields
    organizerDetails: {
      organizationName: "",
      organizationEmail: "",
      organizationPhone: "",
      organizationAddress: "",
      organizationWebsite: "",
      taxId: "",
      description: "",
    },
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      if (token && role) {
        redirectAttempted.current = true;
        redirectBasedOnRole(role);
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Handle nested organizer details
    if (name.startsWith("organizer.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        organizerDetails: {
          ...prev.organizerDetails,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear specific field error
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
    setShowErrorAlert(false);
  };

  const redirectBasedOnRole = (role) => {
    switch (role) {
      case "Admin":
        navigate("/admindb", { replace: true });
        break;
      case "Organizer":
        navigate("/orgdb", { replace: true });
        break;
      case "User":
        navigate("/userdb", { replace: true });
        break;
      default:
        setError("Invalid user role");
        setShowErrorAlert(true);
        // Clear invalid role from localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("role");
    }
  };

  const handleLogin = async () => {
    // Clear previous errors
    setErrors({});
    setError("");
    setShowErrorAlert(false);

    const newErrors = {};

    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const loginData = {
        email: formData.email.trim(),
        password: formData.password,
      };

      const response = await api.post("/users/login", loginData);

      if (response.data?.token && response.data?.user) {
        const { token, user: userData } = response.data;
        const role = userData.role;

        await login(token, role, userData);

        setError("");
        setShowErrorAlert(false);

        redirectBasedOnRole(role);
      } else {
        setError("Invalid response from server");
        setShowErrorAlert(true);
      }
    } catch (error) {
      console.error("Login Error:", error.response?.data || error.message);

      let errorMessage = "Invalid email or password";
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

  const validateOrganizerDetails = () => {
    const organizerErrors = {};

    if (formData.role === "Organizer") {
      if (!formData.organizerDetails.organizationName?.trim()) {
        organizerErrors["organizer.organizationName"] =
          "Organization name is required";
      }
      if (!formData.organizerDetails.organizationEmail?.trim()) {
        organizerErrors["organizer.organizationEmail"] =
          "Organization email is required";
      }
      if (!formData.organizerDetails.organizationPhone?.trim()) {
        organizerErrors["organizer.organizationPhone"] =
          "Organization phone is required";
      }
      if (!formData.organizerDetails.organizationAddress?.trim()) {
        organizerErrors["organizer.organizationAddress"] =
          "Organization address is required";
      }
      if (!formData.organizerDetails.taxId?.trim()) {
        organizerErrors["organizer.taxId"] =
          "Tax ID/Business registration is required";
      }
    }

    return organizerErrors;
  };

  const handleSignup = async () => {
    // Clear previous errors
    setErrors({});
    setError("");
    setShowErrorAlert(false);

    const newErrors = {};

    // Basic validation
    if (!formData.fullname?.trim())
      newErrors.fullname = "Full name is required";
    if (!formData.email?.trim()) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Confirm password is required";

    if (
      formData.password &&
      formData.confirmPassword &&
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.contactNo?.trim())
      newErrors.contactNo = "Contact number is required";
    if (!formData.role) newErrors.role = "Role is required";

    // Password strength validation
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Add organizer validation if role is Organizer
    if (formData.role === "Organizer") {
      const organizerErrors = validateOrganizerDetails();
      Object.assign(newErrors, organizerErrors);
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
        role: formData.role,
        // Include organizerDetails only if role is Organizer
        ...(formData.role === "Organizer" && {
          organizerDetails: formData.organizerDetails,
        }),
      };

      const response = await api.post("/users/signup", signupData);

      if (response.data?.user) {
        setError("");

        // Show success message
        alert(response.data.message || "Signup successful! Please login.");

        // Switch to login mode and clear form
        setIsLogin(true);
        setFormData({
          fullname: "",
          email: "",
          password: "",
          confirmPassword: "",
          contactNo: "",
          role: "",
          organizerDetails: {
            organizationName: "",
            organizationEmail: "",
            organizationPhone: "",
            organizationAddress: "",
            organizationWebsite: "",
            taxId: "",
            description: "",
          },
        });
      } else {
        setError("Signup failed: Invalid response data");
        setShowErrorAlert(true);
      }
    } catch (error) {
      console.error("Signup Error:", error.response?.data || error.message);

      let errorMessage = "An error occurred during signup";
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
    if (e.key === "Enter" && !loading) {
      handleSubmit(e);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      fullname: "",
      email: "",
      password: "",
      confirmPassword: "",
      contactNo: "",
      role: "",
      organizerDetails: {
        organizationName: "",
        organizationEmail: "",
        organizationPhone: "",
        organizationAddress: "",
        organizationWebsite: "",
        taxId: "",
        description: "",
      },
    });
    setErrors({});
    setError("");
    setShowErrorAlert(false);
  };

  // Render organizer fields
  const renderOrganizerFields = () => {
    if (formData.role !== "Organizer") return null;

    return (
      <div className="space-y-2 mt-4 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Organization Details
        </h3>

        <div>
          <textarea
            name="organizer.organizationAddress"
            placeholder="Organization Address *"
            value={formData.organizerDetails.organizationAddress}
            onChange={handleInputChange}
            rows="2"
            className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm resize-none ${
              errors["organizer.organizationAddress"]
                ? "border-red-500"
                : "border-gray-300"
            }`}
          />
          {errors["organizer.organizationAddress"] && (
            <p className="text-red-500 text-xs mt-1">
              {errors["organizer.organizationAddress"]}
            </p>
          )}
        </div>

        <div>
          <input
            type="text"
            name="organizer.organizationWebsite"
            placeholder="Organization Website (optional)"
            value={formData.organizerDetails.organizationWebsite}
            onChange={handleInputChange}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
          />
        </div>

        <div>
          <input
            type="text"
            name="organizer.taxId"
            placeholder="Tax ID / Business Registration *"
            value={formData.organizerDetails.taxId}
            onChange={handleInputChange}
            className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm ${
              errors["organizer.taxId"] ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors["organizer.taxId"] && (
            <p className="text-red-500 text-xs mt-1">
              {errors["organizer.taxId"]}
            </p>
          )}
        </div>

        <div>
          <textarea
            name="organizer.description"
            placeholder="Organization Description (optional)"
            value={formData.organizerDetails.description}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm resize-none"
          />
        </div>

        <p className="text-xs text-gray-500 mt-2">
          * Required fields for organizer registration
        </p>
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

      {/* Form Card - Made scrollable for organizer fields */}
      <div className="relative z-10 flex items-center justify-center w-full pt-24 p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-4 max-h-[90vh] overflow-y-auto">
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
                {isLogin ? "Welcome back!" : "Create your account"}
              </h1>
              <p className="text-gray-600 mb-6 text-sm">
                {isLogin
                  ? "Sign in to your account"
                  : "Fill in your details to get started"}
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
                        errors.fullname ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.fullname && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.fullname}
                      </p>
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
                      errors.email ? "border-red-500" : "border-gray-300"
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
                      errors.password ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.password}
                    </p>
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
                        errors.confirmPassword
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.confirmPassword}
                      </p>
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
                        errors.contactNo ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.contactNo && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.contactNo}
                      </p>
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
                        errors.role ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="" disabled>
                        Select Role
                      </option>
                      <option value="User">User</option>
                      <option value="Organizer">Organizer</option>
                      <option value="Admin">Admin</option>
                    </select>
                    {errors.role && (
                      <p className="text-red-600 text-xs mt-1">{errors.role}</p>
                    )}
                  </div>
                )}

                {/* Organizer Specific Fields */}
                {!isLogin && renderOrganizerFields()}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {isLogin ? "Logging in..." : "Creating account..."}
                    </span>
                  ) : isLogin ? (
                    "Log in"
                  ) : (
                    "Sign up"
                  )}
                </button>

                {/* Forgot Password - Login Only */}
                {isLogin && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() =>
                        alert("Password reset functionality coming soon!")
                      }
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
                    {isLogin
                      ? "Don't have an account? "
                      : "Already have an account? "}
                    <span className="font-semibold text-blue-600">
                      {isLogin ? "Sign up" : "Log in"}
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
