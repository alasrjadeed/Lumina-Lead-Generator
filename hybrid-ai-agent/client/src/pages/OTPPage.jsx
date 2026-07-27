import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";
import { post } from "../services/api";

export default function OTPPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      toast.error("Please enter the complete OTP");
      return;
    }
    setLoading(true);
    try {
      const { data } = await post("/auth/verify-otp", { email, otp: code });
      login(data.user, data.token);
      toast.success("Verified!");
      navigate("/chat");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold justify-center mb-2">
            Verify OTP
          </h2>
          <p className="text-center text-base-content/60 mb-4">
            Enter the 6-digit code sent to {email || "your email"}
          </p>
          <form onSubmit={handleSubmit}>
            <div className="flex justify-center gap-2 mb-6">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  maxLength={1}
                  className="input input-bordered w-12 h-12 text-center text-xl"
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                />
              ))}
            </div>
            <button
              type="submit"
              className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
