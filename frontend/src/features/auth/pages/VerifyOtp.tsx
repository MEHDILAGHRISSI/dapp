// src/pages/VerifyOtp.tsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/authStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Logo from "@/components/Logo";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp, resendOtp, isLoading } = useAuthStore();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
      setSuccess(
        location.state.message ||
          "Please enter the verification code sent to your email."
      );
    } else {
      navigate("/signup");
    }
  }, [location, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    try {
      const success = await verifyOtp({ email: email, code: otpCode });
      if (success) {
        setSuccess("Email verified successfully! Redirecting to login...");
        setTimeout(() => navigate("/signin"), 2000);
      }
    } catch (error: any) {
      setError(error.message || "Verification failed. Please try again.");
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setError("");
    try {
      await resendOtp(email);
      setSuccess("Verification code resent to your email!");
      setCountdown(60); // 60 seconds countdown
    } catch (error: any) {
      setError(error.message || "Failed to resend code. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-6">
      {/* Logo outside the card at top center */}
      <div className="flex justify-center mb-4">
        <Logo size="lg" />
      </div>

      <Card className="w-full max-w-md border shadow-lg pt-8">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <div className="bg-[#182a3a] p-3 rounded-full inline-flex mb-4">
              <Mail className="h-8 w-8 text-white" />
            </div>

            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold text-[#182a3a]">
                Verify Your Email
              </CardTitle>
              <CardDescription className="text-lg">
                Enter the 6-digit code sent to
              </CardDescription>
              <p className="font-semibold text-[#182a3a] text-lg">{email}</p>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <Alert className="mt-6 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="mt-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            <div className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  className="w-12 h-12 text-center text-xl font-semibold"
                  pattern="\d*"
                />
              ))}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#182a3a] text-white hover:bg-[#182a3a]/90 h-12 text-base"
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </div>
              ) : (
                "Verify Email"
              )}
            </Button>

            <div className="text-center">
              <span className="text-muted-foreground">
                Didn't receive the code?{" "}
                <Button
                  type="button"
                  variant="link"
                  onClick={handleResendOtp}
                  disabled={countdown > 0}
                  className="text-[#182a3a] hover:text-[#182a3a]/80 font-semibold p-0 h-auto"
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
                </Button>
              </span>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyOtp;
