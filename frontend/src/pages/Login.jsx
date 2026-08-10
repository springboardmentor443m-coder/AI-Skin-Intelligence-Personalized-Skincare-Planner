import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Sparkles, KeyRound, Mail, AlertTriangle } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setAuthError('');
    setLoading(true);
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      setAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-tr from-slate-100 via-brand-50 to-brand-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-brand-950/20 px-4">
      <div className="absolute top-10 flex items-center gap-2">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-500 to-orange-400 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-brand-500/20">
          ✨
        </div>
        <span className="text-2xl font-bold bg-gradient-to-r from-brand-600 to-orange-400 bg-clip-text text-transparent">
          DermaAI
        </span>
      </div>

      <Card className="w-full max-w-md p-8 glass-card border border-white/40 dark:border-slate-800/40 shadow-xl relative overflow-hidden" glass>
        {/* Aesthetic background glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1.5">
            Welcome Back <Sparkles className="w-5 h-5 text-brand-500" />
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Access your personalized skin intelligence panel
          </p>
        </div>

        {authError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 rounded-xl flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span className="text-xs font-semibold text-red-700 dark:text-red-400">
              {authError}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
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

          <Button
            type="submit"
            className="w-full mt-2"
            isLoading={loading}
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          New to DermaAI?{' '}
          <Link
            to="/register"
            className="text-brand-500 hover:text-brand-600 font-semibold transition-colors duration-150"
          >
            Create an Account
          </Link>
        </div>
      </Card>
    </div>
  );
};
export default Login;
