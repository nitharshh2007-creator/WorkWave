import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
function ForgotPassword() {
  const [email, setEmail] = useState("");
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const res = await axios.post(
      "http://localhost:5000/api/auth/forgot-password",
      { email }
    );

    toast.success(res.data.message || "Reset link sent!");
  } catch (error: any) {
    toast.error(
      error.response?.data?.message || "Failed to send reset link"
    );
  }
};
  return (
    <div className="min-h-screen bg-[#E6F2DD] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.1)]">
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
  className="text-2xl sm:text-2xl font-bold mt-4"
>
  Forgot Your Password?
</h1>
              <p className="text-[#5E7C72] mt-2">
                No worries! Enter your email and we'll send you a reset link.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-[#4A6A60] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Your Email Address"
                  className="w-full px-3 py-2 rounded-lg border border-[#659287]/30 bg-gray-50/70 text-[#2F4F4F] placeholder:text-gray-500 outline-none transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-[#659287]/20 focus:border-[#659287] text-sm font-medium"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-[#659287] hover:bg-[#53786F] text-white font-semibold py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
              >
                Send Reset Link
              </motion.button>
            </form>

            <p className="text-center mt-8 text-sm text-[#5E7C72]">
              Remember your password?{" "}
              <Link
                to="/login"
                className="text-[#659287] font-semibold hover:underline"
              >
                Sign In
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;