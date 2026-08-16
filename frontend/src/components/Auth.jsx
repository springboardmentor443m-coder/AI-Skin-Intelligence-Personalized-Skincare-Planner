import { useState } from 'react';

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login', 'register', 'reset'
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '', confirm_password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleMode = (newMode, e) => {
    e.preventDefault();
    setMode(newMode);
    setFormData({ full_name: '', email: '', password: '', confirm_password: '' });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (mode === 'reset') {
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }
      if (formData.password !== formData.confirm_password) {
        setError("Passwords do not match");
        return;
      }
    }

    setLoading(true);
    
    try {
      if (mode === 'reset') {
        const res = await fetch(`http://127.0.0.1:8000/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, new_password: formData.password })
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.detail || 'Password reset failed');
        
        setSuccess(data.message);
        setMode('login');
        setFormData({ full_name: '', email: '', password: '', confirm_password: '' });
      } else {
        const endpoint = mode === 'login' ? '/login' : '/register';
        const res = await fetch(`http://127.0.0.1:8000${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            full_name: formData.full_name, 
            email: formData.email, 
            password: formData.password 
          })
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.detail || 'Authentication failed');
        
        onLogin(data.user_id, mode === 'login');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: '80vh' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="text-center">
          {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : 'Reset Password'}
        </h2>
        
        {success && <div style={{ color: 'var(--success-color)', marginBottom: '1rem', textAlign: 'center', background: 'rgba(0, 255, 128, 0.1)', padding: '0.5rem', borderRadius: '4px' }}>{success}</div>}
        {error && <div style={{ color: 'var(--error-color)', marginBottom: '1rem', textAlign: 'center', background: 'rgba(255, 0, 0, 0.1)', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="input-group">
              <label>Full Name</label>
              <input type="text" className="input-field" required value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} autoComplete="off" />
            </div>
          )}
          <div className="input-group">
            <label>Email</label>
            <input type="email" className="input-field" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} autoComplete="off" />
          </div>
          <div className="input-group">
            <label>{mode === 'reset' ? 'New Password' : 'Password'}</label>
            <input type="password" className="input-field" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} autoComplete="new-password" />
          </div>
          {mode === 'reset' && (
            <div className="input-group">
              <label>Confirm New Password</label>
              <input type="password" className="input-field" required value={formData.confirm_password} onChange={e => setFormData({...formData, confirm_password: e.target.value})} autoComplete="new-password" />
            </div>
          )}
          
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Processing...' : (mode === 'login' ? 'Login' : mode === 'register' ? 'Register' : 'Reset Password')}
          </button>
        </form>
        
        <div className="text-center" style={{ marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {mode === 'login' && (
            <>
              <div>
                Don't have an account? <a href="#" onClick={(e) => toggleMode('register', e)}>Register</a>
              </div>
              <div>
                <a href="#" onClick={(e) => toggleMode('reset', e)} style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Forgot Password?</a>
              </div>
            </>
          )}
          {mode === 'register' && (
            <div>
              Already have an account? <a href="#" onClick={(e) => toggleMode('login', e)}>Login</a>
            </div>
          )}
          {mode === 'reset' && (
            <div>
              <a href="#" onClick={(e) => toggleMode('login', e)}>Back to Login</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
