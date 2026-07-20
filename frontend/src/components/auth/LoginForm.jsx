import { useState } from 'react';
import apiClient from '@/services/api_client';

export default function LoginForm({ onSuccess }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await apiClient.post('/auth/login', form);
      window.localStorage.setItem('asi_access_token', data.access_token);
      window.localStorage.setItem('asi_refresh_token', data.refresh_token);
      onSuccess?.(data.user);
    } catch (err) {
      setError(err.response?.data?.detail || 'That email and password combination did not match. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-ink-500">Email</label>
        <input
          id="email"
          type="email"
          required
          value={form.email}
          onChange={update('email')}
          className="input-field"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-ink-500">Password</label>
        <input
          id="password"
          type="password"
          required
          value={form.password}
          onChange={update('password')}
          className="input-field"
          placeholder="••••••••"
        />
      </div>

      {error && <p className="text-sm font-medium text-ink-700">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
        {loading ? 'Signing in…' : 'Log in'}
      </button>
    </form>
  );
}
