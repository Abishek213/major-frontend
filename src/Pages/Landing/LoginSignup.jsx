import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import api from "../../utils/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "../../components/ui/alert";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const LoginSignup = () => {
  const navigate = useNavigate();
  const {
    login,
    sendEmailOtp,
    verifyEmailOtp,
    sendMobileOtp,
    verifyMobileOtp,
  } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
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
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  // Verification modal state
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationType, setVerificationType] = useState("email"); // 'email' or 'mobile'
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationMobile, setVerificationMobile] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [otpError, setOtpError] = useState("");
  const [verifying, setVerifying] = useState(false);

  const redirectAttempted = React.useRef(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!redirectAttempted.current) {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      if (token && role && role !== "undefined") {
        redirectAttempted.current = true;
        redirectBasedOnRole(role);
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

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
        // NOTE: Do NOT wipe localStorage here.
        // AuthContext.login() now always stores a valid role string (never undefined),
        // so this default case should only be reached for genuinely bad data.
        setError(
          "Sign-in error: could not determine user role. Please try again."
        );
        setShowErrorAlert(true);
    }
  };

  /**
   * Determines whether to show a verification modal or redirect directly.
   * Uses strict === false so that undefined (field not returned by backend)
   * is treated as "already verified" and falls through to redirect.
   */
  const handlePostLoginRedirect = (user) => {
    if (user.isEmailVerified === false) {
      setVerificationEmail(user.email);
      setVerificationType("email");
      setShowVerificationModal(true);
    } else if (user.isMobileVerified === false && user.contactNo) {
      setVerificationMobile(user.contactNo);
      setVerificationType("mobile");
      setShowVerificationModal(true);
    } else {
      redirectBasedOnRole(user.role);
    }
  };

  // Handle Google login success
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setError("");
      setShowErrorAlert(false);

      const res = await api.post("/auth/google", {
        tokenId: credentialResponse.credential,
      });

      const { token, user } = res.data;

      // login() now always persists a valid role to localStorage
      // (it defaults to "User" when role is absent from the API response).
      await login(token, user.role, user);

      // FIX: Guard against the localStorage storing the literal string
      // "undefined" (which was the old bug). AuthContext now prevents this,
      // but this guard remains as a safety net.
      const storedRole = localStorage.getItem("role");
      const safeStoredRole =
        storedRole && storedRole !== "undefined" ? storedRole : null;

      const resolvedRole = user.role || safeStoredRole || "User";

      const resolvedUser = {
        ...user,
        role: resolvedRole,
      };

      handlePostLoginRedirect(resolvedUser);
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError(
        err.response?.data?.message ||
          "Google sign-in failed. Please try again."
      );
      setShowErrorAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google sign-in failed. Please try again.");
    setShowErrorAlert(true);
  };

  const handleLogin = async () => {
    setErrors({});
    setError("");
    setShowErrorAlert(false);

    const newErrors = {};
    if (!formData.email?.trim()) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: formData.email.trim(),
        password: formData.password,
      });

      if (response.data?.token && response.data?.user) {
        const { token, user } = response.data;
        await login(token, user.role, user);
        handlePostLoginRedirect(user);
      } else {
        setError("Invalid response from server");
        setShowErrorAlert(true);
      }
    } catch (error) {
      console.error("Login Error:", error);
      setError(error.response?.data?.message || "Invalid email or password");
      setShowErrorAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const validateOrganizerDetails = () => {
    const organizerErrors = {};
    if (formData.role === "Organizer") {
      if (!formData.organizerDetails.organizationName?.trim())
        organizerErrors["organizer.organizationName"] =
          "Organization name is required";
      if (!formData.organizerDetails.organizationEmail?.trim())
        organizerErrors["organizer.organizationEmail"] =
          "Organization email is required";
      if (!formData.organizerDetails.organizationPhone?.trim())
        organizerErrors["organizer.organizationPhone"] =
          "Organization phone is required";
      if (!formData.organizerDetails.organizationAddress?.trim())
        organizerErrors["organizer.organizationAddress"] =
          "Organization address is required";
      if (!formData.organizerDetails.taxId?.trim())
        organizerErrors["organizer.taxId"] =
          "Tax ID/Business registration is required";
    }
    return organizerErrors;
  };

  const handleSignup = async () => {
    setErrors({});
    setError("");
    setShowErrorAlert(false);

    const newErrors = {};

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
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.role === "Organizer") {
      Object.assign(newErrors, validateOrganizerDetails());
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
        ...(formData.role === "Organizer" && {
          organizerDetails: formData.organizerDetails,
        }),
      };

      const response = await api.post("/auth/signup", signupData);

      if (response.data?.user) {
        setError("");
        alert(response.data.message || "Signup successful! Please login.");
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
      console.error("Signup Error:", error);
      setError(
        error.response?.data?.message || "An error occurred during signup"
      );
      setShowErrorAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      handleLogin();
    } else {
      handleSignup();
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

  // OTP handling functions
  const handleSendOtp = async () => {
    setOtpError("");
    setOtpMessage("");
    setVerifying(true);
    try {
      if (verificationType === "email") {
        await sendEmailOtp(verificationEmail);
      } else {
        await sendMobileOtp(verificationMobile);
      }
      setOtpSent(true);
      setOtpMessage(
        `OTP sent to ${
          verificationType === "email" ? verificationEmail : verificationMobile
        }`
      );
    } catch (err) {
      setOtpError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setVerifying(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpValue.length !== 6) return;
    setOtpError("");
    setVerifying(true);
    try {
      if (verificationType === "email") {
        await verifyEmailOtp(verificationEmail, otpValue);
      } else {
        await verifyMobileOtp(verificationMobile, otpValue);
      }
      setShowVerificationModal(false);
      const role = localStorage.getItem("role");
      redirectBasedOnRole(role);
    } catch (err) {
      setOtpError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setVerifying(false);
    }
  };

  const renderOrganizerFields = () => {
    if (formData.role !== "Organizer") return null;

    return (
      <div className="space-y-2 mt-4 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Organization Details
        </h3>

        <div>
          <input
            type="text"
            name="organizer.organizationName"
            placeholder="Organization Name *"
            value={formData.organizerDetails.organizationName}
            onChange={handleInputChange}
            className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm ${
              errors["organizer.organizationName"]
                ? "border-red-500"
                : "border-gray-300"
            }`}
          />
          {errors["organizer.organizationName"] && (
            <p className="text-red-500 text-xs mt-1">
              {errors["organizer.organizationName"]}
            </p>
          )}
        </div>

        <div>
          <input
            type="email"
            name="organizer.organizationEmail"
            placeholder="Organization Email *"
            value={formData.organizerDetails.organizationEmail}
            onChange={handleInputChange}
            className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm ${
              errors["organizer.organizationEmail"]
                ? "border-red-500"
                : "border-gray-300"
            }`}
          />
          {errors["organizer.organizationEmail"] && (
            <p className="text-red-500 text-xs mt-1">
              {errors["organizer.organizationEmail"]}
            </p>
          )}
        </div>

        <div>
          <input
            type="tel"
            name="organizer.organizationPhone"
            placeholder="Organization Phone *"
            value={formData.organizerDetails.organizationPhone}
            onChange={handleInputChange}
            className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm ${
              errors["organizer.organizationPhone"]
                ? "border-red-500"
                : "border-gray-300"
            }`}
          />
          {errors["organizer.organizationPhone"] && (
            <p className="text-red-500 text-xs mt-1">
              {errors["organizer.organizationPhone"]}
            </p>
          )}
        </div>

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

  // Inline OTP input component
  const OtpInput = ({ value, onChange }) => {
    const inputsRef = React.useRef([]);

    const handleChange = (e, index) => {
      const val = e.target.value.replace(/\D/g, "");
      if (!val) return;
      const newValue = value.split("");
      newValue[index] = val.slice(-1);
      onChange(newValue.join(""));
      if (index < 5 && inputsRef.current[index + 1]) {
        inputsRef.current[index + 1].focus();
      }
    };

    const handleKeyDown = (e, index) => {
      if (e.key === "Backspace") {
        if (value[index]) {
          const newValue = value.split("");
          newValue[index] = "";
          onChange(newValue.join(""));
        } else if (index > 0) {
          inputsRef.current[index - 1].focus();
        }
      }
    };

    return (
      <div className="flex gap-2 justify-center">
        {[...Array(6)].map((_, i) => (
          <input
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            type="text"
            maxLength="1"
            value={value[i] || ""}
            onChange={(e) => handleChange(e, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className="w-12 h-12 text-center text-xl border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Background Image */}
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
                {/* Google Sign-In — Login only */}
                {isLogin && (
                  <>
                    <div className="flex justify-center mb-2">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        shape="pill"
                        text="signin_with"
                        theme="outline"
                        size="large"
                      />
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-2 my-3">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-xs text-gray-400">
                        or sign in with email
                      </span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>
                  </>
                )}

                {/* Full Name — Signup only */}
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

                {/* Email */}
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

                {/* Password */}
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

                {/* Confirm Password — Signup only */}
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

                {/* Contact Number — Signup only */}
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

                {/* Role Selection — Signup only */}
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

                {/* Organizer-specific fields */}
                {!isLogin && renderOrganizerFields()}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-2"
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

                {/* Forgot Password — Login only */}
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

                {/* Toggle Login / Signup */}
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

      {/* OTP Verification Modal */}
      <Dialog
        open={showVerificationModal}
        onOpenChange={setShowVerificationModal}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Verify your{" "}
              {verificationType === "email" ? "Email" : "Mobile Number"}
            </DialogTitle>
            <DialogDescription>
              {otpSent
                ? `Enter the 6-digit code sent to ${
                    verificationType === "email"
                      ? verificationEmail
                      : verificationMobile
                  }.`
                : `We'll send a verification code to ${
                    verificationType === "email"
                      ? verificationEmail
                      : verificationMobile
                  }.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {otpMessage && (
              <p className="text-sm text-green-600 text-center">{otpMessage}</p>
            )}
            {otpError && (
              <p className="text-sm text-red-600 text-center">{otpError}</p>
            )}

            {!otpSent ? (
              <button
                onClick={handleSendOtp}
                disabled={verifying}
                className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50 font-semibold text-sm"
              >
                {verifying ? "Sending..." : "Send OTP"}
              </button>
            ) : (
              <>
                <OtpInput value={otpValue} onChange={setOtpValue} />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleVerifyOtp}
                    disabled={verifying || otpValue.length !== 6}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg disabled:opacity-50 font-semibold text-sm"
                  >
                    {verifying ? "Verifying..." : "Verify"}
                  </button>
                  <button
                    onClick={handleSendOtp}
                    disabled={verifying}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg disabled:opacity-50 text-sm"
                  >
                    Resend
                  </button>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="sm:justify-start">
            <button
              type="button"
              onClick={() => {
                setShowVerificationModal(false);
                const role = localStorage.getItem("role");
                if (role && role !== "undefined") redirectBasedOnRole(role);
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Skip for now
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoginSignup;
