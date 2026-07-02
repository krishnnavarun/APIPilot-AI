import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure, clearError } from '@/redux/authSlice';
import authService from '@/services/authService';
import toast from 'react-hot-toast';
import { Sparkles } from 'lucide-react';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email format';
    if (!formData.password) errors.password = 'Password is required';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    dispatch(loginStart());
    try {
      const result = await authService.login(formData);
      dispatch(loginSuccess(result));
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : 'Login failed. Please try again.';
      dispatch(loginFailure(errorMsg));
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-[#090b10] text-[#e6ebf2] flex items-center justify-center relative overflow-hidden">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-radial from-blue-600/40 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-radial from-purple-600/30 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-[#63b3ff]" />
            <span className="text-sm font-medium tracking-widest text-[#aab6c6]">APIPILOT AI</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back</h1>
          <p className="text-[#aab6c6] text-sm">Sign in to your account</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-700/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2 text-[#e6ebf2]">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={`w-full px-4 py-3 rounded-lg bg-[#1a1f2e] border ${
                fieldErrors.email ? 'border-red-500' : 'border-[#2d3748]'
              } text-[#e6ebf2] placeholder-[#6b7280] focus:outline-none focus:border-[#63b3ff] focus:ring-1 focus:ring-[#63b3ff] transition`}
            />
            {fieldErrors.email && (
              <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2 text-[#e6ebf2]">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`w-full px-4 py-3 rounded-lg bg-[#1a1f2e] border ${
                fieldErrors.password ? 'border-red-500' : 'border-[#2d3748]'
              } text-[#e6ebf2] placeholder-[#6b7280] focus:outline-none focus:border-[#63b3ff] focus:ring-1 focus:ring-[#63b3ff] transition`}
            />
            {fieldErrors.password && (
              <p className="text-red-400 text-xs mt-1">{fieldErrors.password}</p>
            )}
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs text-[#63b3ff] hover:text-[#7fbfff] transition"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#63b3ff] hover:bg-[#7fbfff] text-[#090b10] font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Register Link */}
        <p className="text-center text-[#aab6c6] text-sm">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-[#63b3ff] hover:text-[#7fbfff] font-medium transition"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
