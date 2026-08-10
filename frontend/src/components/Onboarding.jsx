import { useState } from 'react';

export default function Onboarding({ userId, isNewUser, onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [profile, setProfile] = useState({
    user_id: userId,
    age: 25,
    gender: 'Female',
    skin_type: 'Combination',
    skin_concerns: 'Acne, Dark Spots',
    allergies: 'None',
    sensitive_skin: false
  });

  const [lifestyle, setLifestyle] = useState({
    user_id: userId,
    sleep_hours: 7,
    water_intake: 2,
    stress_level: 'Medium',
    diet: 'Balanced'
  });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const method = isNewUser ? 'POST' : 'PUT';
      const url = isNewUser ? 'http://127.0.0.1:8000/skin-profile' : `http://127.0.0.1:8000/skin-profile/${userId}`;
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      if (!res.ok) throw new Error('Failed to save profile');
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLifestyleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://127.0.0.1:8000/lifestyle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lifestyle)
      });
      if (!res.ok) throw new Error('Failed to save lifestyle');
      onComplete();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: '80vh' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '500px' }}>
        <h2 className="text-center">{step === 1 ? 'Step 1: Skin Profile' : 'Step 2: Lifestyle'}</h2>
        
        {error && <div style={{ color: 'var(--error-color)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleProfileSubmit}>
            <div className="input-group">
              <label>Age</label>
              <input type="number" className="input-field" required value={profile.age} onChange={e => setProfile({...profile, age: parseInt(e.target.value)})} />
            </div>
            <div className="input-group">
              <label>Gender</label>
              <select className="input-field" value={profile.gender} onChange={e => setProfile({...profile, gender: e.target.value})}>
                <option>Female</option>
                <option>Male</option>
                <option>Other</option>
              </select>
            </div>
            <div className="input-group">
              <label>Skin Type</label>
              <select className="input-field" value={profile.skin_type} onChange={e => setProfile({...profile, skin_type: e.target.value})}>
                <option>Dry</option>
                <option>Oily</option>
                <option>Combination</option>
                <option>Normal</option>
                <option>Sensitive</option>
              </select>
            </div>
            <div className="input-group">
              <label>Skin Concerns (comma separated)</label>
              <input type="text" className="input-field" value={profile.skin_concerns} onChange={e => setProfile({...profile, skin_concerns: e.target.value})} />
            </div>
            <div className="input-group">
              <label>Allergies</label>
              <input type="text" className="input-field" value={profile.allergies} onChange={e => setProfile({...profile, allergies: e.target.value})} />
            </div>
            <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" id="sensitive" checked={profile.sensitive_skin} onChange={e => setProfile({...profile, sensitive_skin: e.target.checked})} />
              <label htmlFor="sensitive" style={{ margin: 0 }}>Sensitive Skin?</label>
            </div>
            
            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
              {loading ? 'Saving...' : 'Next Step ➔'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLifestyleSubmit}>
            <div className="input-group">
              <label>Sleep (Hours/Night)</label>
              <input type="number" step="0.5" className="input-field" required value={lifestyle.sleep_hours} onChange={e => setLifestyle({...lifestyle, sleep_hours: parseFloat(e.target.value)})} />
            </div>
            <div className="input-group">
              <label>Water Intake (Liters/Day)</label>
              <input type="number" step="0.1" className="input-field" required value={lifestyle.water_intake} onChange={e => setLifestyle({...lifestyle, water_intake: parseFloat(e.target.value)})} />
            </div>
            <div className="input-group">
              <label>Stress Level</label>
              <select className="input-field" value={lifestyle.stress_level} onChange={e => setLifestyle({...lifestyle, stress_level: e.target.value})}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div className="input-group">
              <label>Diet</label>
              <select className="input-field" value={lifestyle.diet} onChange={e => setLifestyle({...lifestyle, diet: e.target.value})}>
                <option>Balanced</option>
                <option>Vegan</option>
                <option>Keto</option>
                <option>High Sugar</option>
                <option>Junk Food</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="button" className="btn-secondary" onClick={() => setStep(1)}>Back</button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Complete Profile ✓'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
