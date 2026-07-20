import { useState } from 'react';
import apiClient from '@/services/api_client';

const ROLES = [
  { value: 'user', label: 'I want to track my own skin' },
  { value: 'consultant', label: "I'm a skincare consultant" },
  { value: 'dermatologist', label: "I'm a dermatologist" },
];

export default function SignupForm({ onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.password.length < 8) {
      setError('Use a password with at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await apiClient.post('/auth/register', form);
      window.localStorage.setItem('asi_access_token', data.access_token);
      window.localStorage.setItem('asi_refresh_token', data.refresh_token);
      onSuccess?.(data.user);
    } catch (err) {
      setError(err.response?.data?.detail || 'We could not create that account. Check your details and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1.5 block text-xs font-semibold text-ink-500">Full name</label>
        <input id="name" required value={form.name} onChange={update('name')} className="input-field" placeholder="Jamie Rivera" />
      </div>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-ink-500">Email</label>
        <input id="email" type="email" required value={form.email} onChange={update('email')} className="input-field" placeholder="you@example.com" />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-ink-500">Password</label>
        <input id="password" type="password" required value={form.password} onChange={update('password')} className="input-field" placeholder="At least 8 characters" />
      </div>

      <fieldset>
        <legend className="mb-1.5 block text-xs font-semibold text-ink-500">Account type</legend>
        <div className="space-y-2">
          {ROLES.map((r) => (
            <label
              key={r.value}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors ${
                form.role === r.value ? 'border-ink-700 bg-ink-50' : 'border-ink-100'
              }`}
            >
              <input
                type="radio"
                name="role"
                value={r.value}
                checked={form.role === r.value}
                onChange={update('role')}
                className="accent-ink-700"
              />
              {r.label}
            </label>
          ))}
        </div>
      </fieldset>

      {error && <p className="text-sm font-medium text-ink-700">{error}</p>}

      <button type="submit" disabled={loading} className="btn-accent w-full disabled:opacity-60">
        {loading ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
}
