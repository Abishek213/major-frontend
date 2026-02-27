import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Building2,
  MapPin,
  Award,
  DollarSign,
} from "lucide-react";
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
      businessName: "",
      contactPerson: "",
      contactPhone: "",
      establishedYear: "",
      expertise: [],
      serviceAreas: [],
      pricing: {
        wedding: { min: "", max: "" },
        birthday: { min: "", max: "" },
        corporate: { min: "", max: "" },
        conference: { min: "", max: "" },
        party: { min: "", max: "" },
      },
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
  const [verificationType, setVerificationType] = useState("email");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationMobile, setVerificationMobile] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [otpError, setOtpError] = useState("");
  const [verifying, setVerifying] = useState(false);

  // City options for Nepal
  const cityOptions = [
    "Kathmandu",
    "Lalitpur",
    "Bhaktapur",
    "Pokhara",
    "Chitwan",
    "Biratnagar",
    "Butwal",
    "Nepalgunj",
    "Dharan",
    "Other",
  ];

  // Event type options
  const eventTypeOptions = [
    { value: "wedding", label: "Wedding" },
    { value: "birthday", label: "Birthday" },
    { value: "corporate", label: "Corporate" },
    { value: "conference", label: "Conference" },
    { value: "party", label: "Party" },
    { value: "anniversary", label: "Anniversary" },
    { value: "workshop", label: "Workshop" },
    { value: "concert", label: "Concert" },
    { value: "festival", label: "Festival" },
  ];

  // Year options (last 50 years)
  const yearOptions = Array.from(
    { length: 50 },
    (_, i) => new Date().getFullYear() - i
  );

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

  const emptyFormData = () => ({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
    contactNo: "",
    role: "",
    organizerDetails: {
      businessName: "",
      contactPerson: "",
      contactPhone: "",
      establishedYear: "",
      expertise: [],
      serviceAreas: [],
      pricing: {
        wedding: { min: "", max: "" },
        birthday: { min: "", max: "" },
        corporate: { min: "", max: "" },
        conference: { min: "", max: "" },
        party: { min: "", max: "" },
      },
    },
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "expertise") {
      // Handle expertise checkboxes
      setFormData((prev) => ({
        ...prev,
        organizerDetails: {
          ...prev.organizerDetails,
          expertise: checked
            ? [...prev.organizerDetails.expertise, value]
            : prev.organizerDetails.expertise.filter((item) => item !== value),
        },
      }));
    } else if (name === "serviceAreas") {
      // Handle service areas checkboxes
      setFormData((prev) => ({
        ...prev,
        organizerDetails: {
          ...prev.organizerDetails,
          serviceAreas: checked
            ? [...prev.organizerDetails.serviceAreas, { city: value }]
            : prev.organizerDetails.serviceAreas.filter(
                (item) => item.city !== value
              ),
        },
      }));
    } else if (name.startsWith("organizer.")) {
      const path = name.split(".");

      if (path.length === 2) {
        // Simple organizer field e.g. organizer.businessName
        setFormData((prev) => ({
          ...prev,
          organizerDetails: {
            ...prev.organizerDetails,
            [path[1]]: value,
          },
        }));
      } else if (path.length === 4 && path[1] === "pricing") {
        // Pricing field e.g. organizer.pricing.wedding.min
        const eventType = path[2];
        const field = path[3];
        setFormData((prev) => ({
          ...prev,
          organizerDetails: {
            ...prev.organizerDetails,
            pricing: {
              ...prev.organizerDetails.pricing,
              [eventType]: {
                ...prev.organizerDetails.pricing[eventType],
                [field]: value,
              },
            },
          },
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    setErrors((prev) => ({ ...prev, [name]: "" }));
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
        setError(
          "Sign-in error: could not determine user role. Please try again."
        );
        setShowErrorAlert(true);
    }
  };

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

      const res = await api.safePost("/auth/google", {
        tokenId: credentialResponse.credential,
      });

      const { token, user } = res.data;
      await login(token, user.role, user);

      const storedRole = localStorage.getItem("role");
      const safeStoredRole =
        storedRole && storedRole !== "undefined" ? storedRole : null;
      const resolvedRole = user.role || safeStoredRole || "User";
      const resolvedUser = { ...user, role: resolvedRole };

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
              console.log('API object:', api); // See what api actually contains

      const response = await api.safePost("/auth/login", {
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
      if (!formData.organizerDetails.businessName?.trim())
        organizerErrors["organizer.businessName"] = "Business name is required";
      if (!formData.organizerDetails.contactPerson?.trim())
        organizerErrors["organizer.contactPerson"] =
          "Contact person name is required";
      if (!formData.organizerDetails.contactPhone?.trim())
        organizerErrors["organizer.contactPhone"] = "Contact phone is required";
      if (formData.organizerDetails.expertise.length === 0)
        organizerErrors.expertise = "Select at least one event type";
      if (formData.organizerDetails.serviceAreas.length === 0)
        organizerErrors.serviceAreas = "Select at least one service area";
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
      // Clean up pricing data (remove empty values)
      const cleanedPricing = {};
      Object.entries(formData.organizerDetails.pricing).forEach(
        ([eventType, range]) => {
          if (range.min || range.max) {
            cleanedPricing[eventType] = {
              min: range.min ? Number(range.min) : 0,
              max: range.max ? Number(range.max) : 0,
            };
          }
        }
      );

      const signupData = {
        fullname: formData.fullname.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        contactNo: formData.contactNo.trim(),
        role: formData.role,
        ...(formData.role === "Organizer" && {
          organizerDetails: {
            businessName: formData.organizerDetails.businessName.trim(),
            contactPerson: formData.organizerDetails.contactPerson.trim(),
            contactPhone: formData.organizerDetails.contactPhone.trim(),
            establishedYear: formData.organizerDetails.establishedYear || null,
            expertise: formData.organizerDetails.expertise,
            serviceAreas: formData.organizerDetails.serviceAreas,
            pricing: cleanedPricing,
          },
        }),
      };

      const response = await api.safePost("/auth/signup", signupData);

      if (response.data?.user) {
        setError("");
        alert(response.data.message || "Signup successful! Please login.");
        setIsLogin(true);
        setFormData(emptyFormData());
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
    setFormData(emptyFormData());
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
      <div className="flex justify-center gap-2">
        {[...Array(6)].map((_, i) => (
          <input
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            type="text"
            maxLength="1"
            value={value[i] || ""}
            onChange={(e) => handleChange(e, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className="w-12 h-12 text-xl text-center border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        ))}
      </div>
    );
  };

  const renderOrganizerFields = () => {
    if (formData.role !== "Organizer") return null;

    return (
      <div className="pt-6 mt-6 space-y-4 border-t-2 border-gray-200">
        <h2 className="flex items-center mb-4 text-lg font-semibold text-gray-800">
          <Building2 className="w-5 h-5 mr-2 text-blue-600" />
          Business Information
        </h2>

        {/* Business Identity */}
        <div className="p-4 space-y-3 rounded-lg bg-gray-50">
          <div>
            <label className="block mb-1 text-xs font-medium text-gray-600">
              Business Name *
            </label>
            <input
              type="text"
              name="organizer.businessName"
              placeholder="Enter your business name"
              value={formData.organizerDetails.businessName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm ${
                errors["organizer.businessName"]
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {errors["organizer.businessName"] && (
              <p className="mt-1 text-xs text-red-500">
                {errors["organizer.businessName"]}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-xs font-medium text-gray-600">
              Contact Person Name *
            </label>
            <input
              type="text"
              name="organizer.contactPerson"
              placeholder="Enter contact person name"
              value={formData.organizerDetails.contactPerson}
              onChange={handleInputChange}
              className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm ${
                errors["organizer.contactPerson"]
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {errors["organizer.contactPerson"] && (
              <p className="mt-1 text-xs text-red-500">
                {errors["organizer.contactPerson"]}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-xs font-medium text-gray-600">
              Contact Phone *
            </label>
            <input
              type="tel"
              name="organizer.contactPhone"
              placeholder="Enter contact phone number"
              value={formData.organizerDetails.contactPhone}
              onChange={handleInputChange}
              className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm ${
                errors["organizer.contactPhone"]
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {errors["organizer.contactPhone"] && (
              <p className="mt-1 text-xs text-red-500">
                {errors["organizer.contactPhone"]}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-xs font-medium text-gray-600">
              Established Year (Optional)
            </label>
            <select
              name="organizer.establishedYear"
              value={formData.organizerDetails.establishedYear}
              onChange={handleInputChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            >
              <option value="">Select year</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Service Areas */}
        <div className="p-4 rounded-lg bg-gray-50">
          <label className="flex items-center block mb-2 text-xs font-medium text-gray-600">
            <MapPin className="w-4 h-4 mr-1 text-blue-600" />
            Service Areas * (Select cities you serve)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {cityOptions.map((city) => (
              <label key={city} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  name="serviceAreas"
                  value={city}
                  checked={formData.organizerDetails.serviceAreas.some(
                    (area) => area.city === city
                  )}
                  onChange={handleInputChange}
                  className="text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span>{city}</span>
              </label>
            ))}
          </div>
          {errors.serviceAreas && (
            <p className="mt-2 text-xs text-red-500">{errors.serviceAreas}</p>
          )}
        </div>

        {/* Event Types / Expertise */}
        <div className="p-4 rounded-lg bg-gray-50">
          <label className="flex items-center block mb-2 text-xs font-medium text-gray-600">
            <Award className="w-4 h-4 mr-1 text-blue-600" />
            Event Types * (Select what you organize)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {eventTypeOptions.map((event) => (
              <label
                key={event.value}
                className="flex items-center space-x-2 text-sm"
              >
                <input
                  type="checkbox"
                  name="expertise"
                  value={event.value}
                  checked={formData.organizerDetails.expertise.includes(
                    event.value
                  )}
                  onChange={handleInputChange}
                  className="text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span>{event.label}</span>
              </label>
            ))}
          </div>
          {errors.expertise && (
            <p className="mt-2 text-xs text-red-500">{errors.expertise}</p>
          )}
        </div>

        {/* Optional Pricing */}
        <div className="p-4 rounded-lg bg-gray-50">
          <label className="flex items-center block mb-2 text-xs font-medium text-gray-600">
            <DollarSign className="w-4 h-4 mr-1 text-blue-600" />
            Pricing (Optional - helps with matching)
          </label>
          <p className="mb-3 text-xs text-gray-500">
            Fill only for event types you selected above
          </p>

          {formData.organizerDetails.expertise.map((eventType) => {
            const eventLabel =
              eventTypeOptions.find((opt) => opt.value === eventType)?.label ||
              eventType;
            return (
              <div
                key={eventType}
                className="p-2 mb-3 bg-white border border-gray-200 rounded"
              >
                <p className="mb-2 text-sm font-medium">{eventLabel}</p>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    name={`organizer.pricing.${eventType}.min`}
                    placeholder="Min (Rs)"
                    value={
                      formData.organizerDetails.pricing[eventType]?.min || ""
                    }
                    onChange={handleInputChange}
                    className="w-1/2 px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  />
                  <input
                    type="number"
                    name={`organizer.pricing.${eventType}.max`}
                    placeholder="Max (Rs)"
                    value={
                      formData.organizerDetails.pricing[eventType]?.max || ""
                    }
                    onChange={handleInputChange}
                    className="w-1/2 px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-2 text-xs text-gray-500">* Required fields</p>
      </div>
    );
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1920&h=1080&fit=crop"
          alt="Background"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 to-blue-900/30"></div>
      </div>

      {/* Form Card */}
      <div className="relative z-10 flex items-center justify-center w-full p-4 pt-24">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-4 max-h-[90vh] overflow-y-auto">
          {showErrorAlert && error && (
            <Alert variant="destructive" className="mb-4 text-sm">
              <AlertTitle className="text-sm">Error</AlertTitle>
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} onKeyDown={handleKeyPress}>
            <div>
              <h1 className="mb-1 text-2xl font-bold text-gray-900">
                {isLogin ? "Welcome back!" : "Create your account"}
              </h1>
              <p className="mb-6 text-sm text-gray-600">
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
                      <p className="mt-1 text-xs text-red-500">
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
                    <p className="mt-1 text-xs text-red-500">{errors.email}</p>
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
                    className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-500">
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
                      className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-xs text-red-500">
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
                      <p className="mt-1 text-xs text-red-500">
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
                      <p className="mt-1 text-xs text-red-600">{errors.role}</p>
                    )}
                  </div>
                )}

                {/* Organizer-specific fields — Signup only */}
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
                        className="w-4 h-4 mr-2 -ml-1 text-white animate-spin"
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
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Toggle Login / Signup */}
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="text-xs text-gray-700 hover:underline"
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

          <div className="py-4 space-y-4">
            {otpMessage && (
              <p className="text-sm text-center text-green-600">{otpMessage}</p>
            )}
            {otpError && (
              <p className="text-sm text-center text-red-600">{otpError}</p>
            )}

            {!otpSent ? (
              <button
                onClick={handleSendOtp}
                disabled={verifying}
                className="w-full py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg disabled:opacity-50"
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
                    className="flex-1 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg disabled:opacity-50"
                  >
                    {verifying ? "Verifying..." : "Verify"}
                  </button>
                  <button
                    onClick={handleSendOtp}
                    disabled={verifying}
                    className="flex-1 py-2 text-sm text-gray-800 bg-gray-200 rounded-lg disabled:opacity-50"
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
