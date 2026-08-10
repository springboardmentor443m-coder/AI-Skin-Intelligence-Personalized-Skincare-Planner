import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Sparkles, User, KeyRound, Mail, HelpCircle, CheckCircle } from 'lucide-react';

export const Register = () => {
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      role: 'user',
    },
  });

  const onSubmit = async (data) => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await signup(data.email, data.password, data.fullName, data.role);
      setSuccessMsg('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setErrorMsg(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-tr from-slate-100 via-brand-50 to-brand-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-brand-950/20 px-4 py-12">
      <div className="absolute top-10 flex items-center gap-2">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-500 to-orange-400 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-brand-500/20">
          ✨
        </div>
        <span className="text-2xl font-bold bg-gradient-to-r from-brand-600 to-orange-400 bg-clip-text text-transparent">
          DermaAI
        </span>
      </div>

      <Card className="w-full max-w-md p-8 glass-card border border-white/40 dark:border-slate-800/40 shadow-xl relative overflow-hidden" glass>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1.5">
            Create Account <Sparkles className="w-5 h-5 text-brand-500" />
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Join DermaAI to analyze skin concerns and customize routines
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 rounded-xl flex items-start gap-2.5">
            <span className="text-xs font-semibold text-red-700 dark:text-red-400">
              {errorMsg}
            </span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200/50 dark:border-green-900/30 rounded-xl flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
            <span className="text-xs font-semibold text-green-700 dark:text-green-400">
              {successMsg}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="relative">
            <User className="absolute left-4 top-11.5 w-4 h-4 text-slate-400" />
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              className="pl-11"
              error={errors.fullName}
              {...register('fullName', { required: 'Name is required' })}
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-11.5 w-4 h-4 text-slate-400" />
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              className="pl-11"
              error={errors.email}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
            />
          </div>

          <div className="relative">
            <KeyRound className="absolute left-4 top-11.5 w-4 h-4 text-slate-400" />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              className="pl-11"
              error={errors.password}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
            />
          </div>

          <div className="w-full mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              Select Your Role <HelpCircle className="w-3.5 h-3.5 text-slate-400" title="Sign up with different roles to test access levels" />
            </label>
            <select
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-900 dark:text-slate-100"
              {...register('role')}
            >
              <option value="user">User / Patient</option>
              <option value="dermatologist">Dermatologist</option>
              <option value="consultant">Skincare Consultant</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <Button
            type="submit"
            className="w-full"
            isLoading={loading}
          >
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-brand-500 hover:text-brand-600 font-semibold transition-colors duration-150"
          >
            Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
};
export default Register;
