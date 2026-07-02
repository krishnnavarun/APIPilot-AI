import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerStart, registerSuccess, registerFailure } from '@/redux/authSlice';
import authService from '@/services/authService';
import toast from 'react-hot-toast';
import { Sparkles, Check, X } from 'lucide-react';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [passwordChecks, setPasswordChecks] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecial: false,
  });

  const validatePassword = (pwd) => {
    setPasswordChecks({
      hasMinLength: pwd.length >= 8,
      hasUppercase: /[A-Z]/.test(pwd),
      hasNumber: /\d/.test(pwd),
      hasSpecial: /[!@#$%^&*]/.test(pwd),
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName) errors.fullName = 'Full name is required';
    else if (formData.fullName.length < 2) errors.fullName = 'Name must be at least 2 characters';
    
    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email format';
    
    if (!formData.password) errors.password = 'Password is required';
    else if (
      formData.password.length < 8 ||
      !/[A-Z]/.test(formData.password) ||
      !/\d/.test(formData.password) ||
      !/[!@#$%^&*]/.test(formData.password)
    ) {
      errors.password = 'Password must meet all requirements';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (name === 'password') {
      validatePassword(value);
    }

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    dispatch(registerStart());
    try {
      const result = await authService.register(formData);
      dispatch(registerSuccess(result));
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : 'Registration failed. Please try again.';
      dispatch(registerFailure(errorMsg));
      toast.error(errorMsg);
    }
  };

  const PasswordCheck = ({ met, label }) => (
    <div className="flex items-center gap-2 text-xs">
      {met ? (
        <Check className="w-4 h-4 text-green-400" />
      ) : (
        <X className="w-4 h-4 text-[#6b7280]" />
      )}
      <span className={met ? 'text-green-400' : 'text-[#aab6c6]'}>{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#090b10] text-[#e6ebf2] flex items-center justify-center relative overflow-hidden py-12">
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
          <h1 className="text-3xl font-bold tracking-tight mb-2">Create your account</h1>
          <p className="text-[#aab6c6] text-sm">Join our platform and start testing APIs</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-700/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-2 text-[#e6ebf2]">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              className={`w-full px-4 py-3 rounded-lg bg-[#1a1f2e] border ${
                fieldErrors.fullName ? 'border-red-500' : 'border-[#2d3748]'
              } text-[#e6ebf2] placeholder-[#6b7280] focus:outline-none focus:border-[#63b3ff] focus:ring-1 focus:ring-[#63b3ff] transition`}
            />
            {fieldErrors.fullName && (
              <p className="text-red-400 text-xs mt-1">{fieldErrors.fullName}</p>
            )}
          </div>

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
            
            {/* Password Requirements */}
            {formData.password && (
              <div className="mt-3 p-3 bg-[#1a1f2e] border border-[#2d3748] rounded-lg space-y-2">
                <PasswordCheck met={passwordChecks.hasMinLength} label="8+ characters" />
                <PasswordCheck met={passwordChecks.hasUppercase} label="One uppercase letter" />
                <PasswordCheck met={passwordChecks.hasNumber} label="One number" />
                <PasswordCheck met={passwordChecks.hasSpecial} label="One special character (!@#$%^&*)" />
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-2 text-[#e6ebf2]">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className={`w-full px-4 py-3 rounded-lg bg-[#1a1f2e] border ${
                fieldErrors.confirmPassword ? 'border-red-500' : 'border-[#2d3748]'
              } text-[#e6ebf2] placeholder-[#6b7280] focus:outline-none focus:border-[#63b3ff] focus:ring-1 focus:ring-[#63b3ff] transition`}
            />
            {fieldErrors.confirmPassword && (
              <p className="text-red-400 text-xs mt-1">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#63b3ff] hover:bg-[#7fbfff] text-[#090b10] font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-[#aab6c6] text-sm">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-[#63b3ff] hover:text-[#7fbfff] font-medium transition"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
