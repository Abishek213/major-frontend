import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { OtpInput } from "./OtpInput";
import api from "../utils/api";

export const VerificationModal = ({
  isOpen,
  onClose,
  type,
  email,
  mobile,
  onVerified,
}) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSendOTP = async () => {
    setLoading(true);
    setError("");
    try {
      if (type === "email") {
        await api.post("/auth/send-email-otp", { email });
      } else {
        await api.post("/auth/send-mobile-otp", { mobile });
      }
      setMessage(`OTP sent to ${type === "email" ? email : mobile}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    setError("");
    try {
      if (type === "email") {
        await api.post("/auth/verify-email-otp", { email, otp });
      } else {
        await api.post("/auth/verify-mobile-otp", { mobile, otp });
      }
      onVerified(type);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Verify your {type === "email" ? "Email" : "Mobile"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Enter the code sent to {type === "email" ? email : mobile}
          </p>
          {!message && (
            <button
              onClick={handleSendOTP}
              disabled={loading}
              className="text-sm text-blue-600 hover:underline"
            >
              Resend OTP
            </button>
          )}
          {message && <p className="text-sm text-green-600">{message}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <OtpInput value={otp} onChange={setOtp} length={6} />
          <button
            onClick={handleVerify}
            disabled={loading || otp.length !== 6}
            className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
