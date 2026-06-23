// Updated Register.tsx with navigation after successful registration
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("candidate");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          name,
          email,
          password,
          role,
        }
      );

            toast.success("Account created successfully! Redirecting to login...", {
        // Green check icon
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0f5132" width="20" height="20">
            <path d="M9 12l2 2 4-4" stroke="#0f5132" strokeWidth="2" fill="none" />
            <circle cx="12" cy="12" r="10" stroke="#0f5132" strokeWidth="2" fill="none" />
          </svg>
        ),
        style: { background: "#e6ffed", color: "#0f5132" },
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed", {
        // Red cross icon
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#842029" width="20" height="20">
            <line x1="6" y1="6" x2="18" y2="18" stroke="#842029" strokeWidth="2" />
            <line x1="6" y1="18" x2="18" y2="6" stroke="#842029" strokeWidth="2" />
            <circle cx="12" cy="12" r="10" stroke="#842029" strokeWidth="2" fill="none" />
          </svg>
        ),
        style: { background: "#ffe6e6", color: "#842029" },
      });
    }
};

  return (
    <div className="min-h-screen lg:h-screen w-full flex flex-col lg:flex-row bg-white overflow-x-hidden">
      {/* Left Panel: Full-Screen Illustration (50% Width) */}
      <div className="hidden lg:block lg:w-1/2 h-full relative overflow-hidden bg-[#E6F2DD]">
        <img
          src="/workwave-login.png"
          alt="WorkWave Illustration"
          className="absolute inset-0 h-full w-full object-cover select-none"
          draggable="false"
        />
        {/* Elegant overlay to enhance readability and contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/5 to-transparent pointer-events-none" />
      </div>

      {/* Right Panel: Full-Screen Register Form (50% Width) */}
      <div className="w-full lg:w-1/2 min-h-screen lg:min-h-0 lg:h-full flex flex-col justify-center p-8 sm:p-12 md:p-14 lg:p-16 bg-white overflow-y-auto relative">
        {/* Background Decorative Blur - pointer-events-none ensures no click blocking */}
        <div className="absolute -top-16 -right-16 w-80 h-80 bg-[#B1D3B9]/25 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-[#659287]/10 blur-3xl rounded-full pointer-events-none" />

        {/* Main Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 my-auto py-8 w-full max-w-[400px] mx-auto"
        >
          <div className="mb-8">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-[#659287] flex items-center justify-center text-white font-extrabold text-lg shadow-[0_4px_12px_rgba(101,146,135,0.2)]">
                W
              </div>
              <span className="text-2xl font-bold tracking-tight text-[#2F4F46]">
                WorkWave
              </span>
            </div>
            <p className="text-base font-semibold text-[#659287]">
              Start your professional journey today.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#4A6A60]">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter Your Name"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-[#2F4F46] placeholder:text-gray-400 outline-none transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-[#659287]/20 focus:border-[#659287] text-sm font-normal"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#4A6A60]">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter Your Email Address"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-[#2F4F46] placeholder:text-gray-400 outline-none transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-[#659287]/20 focus:border-[#659287] text-sm font-normal"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#4A6A60]">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 bg-gray-50/50 text-[#2F4F46] placeholder:text-gray-400 outline-none transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-[#659287]/20 focus:border-[#659287] text-sm font-normal"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#4A6A60]">
                I am a ...
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-[#2F4F46] outline-none transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-[#659287]/20 focus:border-[#659287] text-sm font-normal appearance-none cursor-pointer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="candidate">Candidate</option>
                <option value="employer">Employer</option>
              </select>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              className="w-full bg-[#659287] hover:bg-[#53786F] text-white font-bold py-3.5 px-6 rounded-xl shadow-[0_4px_12px_rgba(101,146,135,0.25)] hover:shadow-[0_6px_20px_rgba(101,146,135,0.35)] transition-all duration-200 text-sm mt-1"
            >
              Create Account
            </motion.button>
          </form>
        </motion.div>

        <div className="text-center text-xs text-[#5E7C72] mt-4">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#659287] font-bold hover:text-[#53786F] hover:underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
