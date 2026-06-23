import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

const { token } = useParams();
const navigate = useNavigate();
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (password !== confirmPassword) {
    toast.error("Passwords do not match");
    return;
  }

  try {
    const res = await axios.put(
      `http://localhost:5000/api/auth/reset-password/${token}`,
      {
        password,
      }
    );

    toast.success(
      res.data.message || "Password reset successful!"
    );

    setTimeout(() => {
      navigate("/login");
    }, 1500);

  } catch (error: any) {
    toast.error(
      error.response?.data?.message ||
      "Failed to reset password"
    );
  }
};

  return (
    <div className="min-h-screen bg-[#E6F2DD] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg mx-auto bg-white rounded-3xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.12)]">
        <div className="relative flex items-center justify-center p-8 sm:p-12 lg:p-16">
          <div className="absolute -top-16 -right-16 w-72 h-72 bg-[#B1D3B9]/20 blur-3xl rounded-full" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="relative z-10 w-full max-w-md"
          >
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#659287] flex items-center justify-center text-white font-bold text-lg">
                  W
                </div>
                <span className="text-2xl font-bold text-[#2F4F46]">
                  WorkWave
                </span>
              </div>  
              <h1
  style={{ color: "#2F4F46" }}
  className="text-2xl sm:text-3xl font-bold mt-6"
>
                Reset Your Password
              </h1>
              <p className="text-[#5E7C72] mt-2">
                Create a new, strong password for your account.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-[#4A6A60] mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    className="w-full pr-12 border border-gray-200 bg-gray-50/50 rounded-lg px-4 py-3 text-[#4A6A60] placeholder:text-gray-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-[#88BDA4]/80 focus:border-transparent"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#659287] transition-colors focus:outline-none cursor-pointer"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.815 7.815 3 3m-3-3a9.14 9.14 0 0 1-5.347 1.724c-.39 0-.778-.025-1.16-.075m0 0a3 3 0 1 1-4.243-4.242M9 10.5a3 3 0 1 1 3 3" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A6A60] mb-2">
                  Confirm New Password
                </label>
                                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    className="w-full pr-12 border border-gray-200 bg-gray-50/50 rounded-lg px-4 py-3 text-[#4A6A60] placeholder:text-gray-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-[#88BDA4]/80 focus:border-transparent"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#659287] transition-colors focus:outline-none cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.177Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.815 7.815 3 3m-3-3a9.14 9.14 0 0 1-5.347 1.724c-.39 0-.778-.025-1.15-.075m0 0a3 3 0 1 1-4.243-4.242M9 10.5a3 3 0 1 1 3 3" />
                      </svg>
                    )}
                  </button>
                </div>  
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-[#659287] hover:bg-[#53786F] text-white font-semibold py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
              >
                Reset Password
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;