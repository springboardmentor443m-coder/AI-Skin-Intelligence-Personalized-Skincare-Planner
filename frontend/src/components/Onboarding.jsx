import { useState, useEffect } from 'react';

const CONCERNS_OPTIONS = ['Acne', 'Dark Spots', 'Blackheads', 'Dryness', 'Redness', 'Dullness', 'Uneven Texture', 'Wrinkles', 'Puffy Eyes', 'None'];
const ALLERGY_OPTIONS = ['Fragrance', 'Essential Oils', 'Retinol', 'AHA', 'BHA', 'Niacinamide', 'Other', 'None'];

export default function Onboarding({ userId, isNewUser, onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otherAllergy, setOtherAllergy] = useState('');
  const [initialLoading, setInitialLoading] = useState(!isNewUser);

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

  useEffect(() => {
    if (isNewUser) return;
    
    const fetchExistingData = async () => {
      try {
        const [profileRes, lifestyleRes] = await Promise.all([
          fetch(`http://127.0.0.1:8000/skin-profile/${userId}`),
          fetch(`http://127.0.0.1:8000/lifestyle/${userId}`)
        ]);
        
        if (!profileRes.ok || !lifestyleRes.ok) {
          throw new Error('Failed to load existing profile');
        }
        
        const profileData = await profileRes.json();
        const lifestyleData = await lifestyleRes.json();
        
        let allergyStr = profileData.allergies;
        const allergyList = allergyStr.split(',').map(s => s.trim()).filter(Boolean);
        const known = ALLERGY_OPTIONS.filter(o => o !== 'Other' && o !== 'None');
        const custom = allergyList.find(a => !known.includes(a) && a !== 'None');
        
        if (custom) {
          setOtherAllergy(custom);
          allergyStr = allergyList.map(a => a === custom ? 'Other' : a).join(', ');
        }
        
        setProfile({
          user_id: userId,
          age: profileData.age,
          gender: profileData.gender,
          skin_type: profileData.skin_type,
          skin_concerns: profileData.skin_concerns,
          allergies: allergyStr,
          sensitive_skin: profileData.sensitive_skin
        });
        
        setLifestyle({
          user_id: userId,
          sleep_hours: lifestyleData.sleep_hours,
          water_intake: lifestyleData.water_intake,
          stress_level: lifestyleData.stress_level,
          diet: lifestyleData.diet
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setInitialLoading(false);
      }
    };
    
    fetchExistingData();
  }, [userId, isNewUser]);

  const handlePillToggle = (field, option) => {
    let current = profile[field].split(',').map(s => s.trim()).filter(Boolean);
    
    if (option === 'None') {
      current = ['None'];
      if (field === 'allergies') {
        setOtherAllergy('');
      }
    } else {
      current = current.filter(item => item !== 'None');
      
      if (current.includes(option)) {
        current = current.filter(item => item !== option);
        if (field === 'allergies' && option === 'Other') {
          setOtherAllergy('');
        }
      } else {
        current.push(option);
      }
      
      if (current.length === 0) {
        current = ['None'];
      }
    }
    
    setProfile({ ...profile, [field]: current.join(', ') });
  };

  const renderPills = (field, options) => {
    const currentSelections = profile[field].split(',').map(s => s.trim());
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
        {options.map(option => {
          const isSelected = currentSelections.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => handlePillToggle(field, option)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                border: isSelected ? '1px solid var(--primary-color)' : '1px solid var(--surface-border)',
                background: isSelected ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
                color: isSelected ? 'white' : 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                outline: 'none',
                fontSize: '0.9rem'
              }}
              aria-pressed={isSelected}
            >
              {option}
            </button>
          );
        })}
      </div>
    );
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const method = isNewUser ? 'POST' : 'PUT';
      const url = isNewUser ? 'http://127.0.0.1:8000/skin-profile' : `http://127.0.0.1:8000/skin-profile/${userId}`;
      
      const payload = { ...profile };
      let allergyList = payload.allergies.split(',').map(s => s.trim()).filter(Boolean);
      if (allergyList.includes('Other') && otherAllergy.trim()) {
        allergyList = allergyList.filter(a => a !== 'Other');
        allergyList.push(otherAllergy.trim());
        payload.allergies = allergyList.join(', ');
      }

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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
      const method = isNewUser ? 'POST' : 'PUT';
      const url = isNewUser ? 'http://127.0.0.1:8000/lifestyle' : `http://127.0.0.1:8000/lifestyle/${userId}`;
      const res = await fetch(url, {
        method: method,
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

  if (initialLoading) {
    return (
      <div className="flex-center" style={{ minHeight: '80vh' }}>
        <div className="glass-card" style={{ width: '100%', maxWidth: '500px', textAlign: 'center' }}>
          <h2>Loading Profile...</h2>
        </div>
      </div>
    );
  }

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
              </select>
            </div>
            <div className="input-group">
              <label>Skin Concerns</label>
              {renderPills('skin_concerns', CONCERNS_OPTIONS)}
            </div>
            <div className="input-group">
              <label>Known Allergies / Ingredient Sensitivities</label>
              {renderPills('allergies', ALLERGY_OPTIONS)}
              {profile.allergies.split(',').map(s => s.trim()).includes('Other') && (
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter your allergy or ingredient sensitivity..."
                  value={otherAllergy}
                  onChange={e => setOtherAllergy(e.target.value)}
                  style={{ marginTop: '0.5rem' }}
                />
              )}
            </div>
            <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" id="sensitive" checked={profile.sensitive_skin} onChange={e => setProfile({...profile, sensitive_skin: e.target.checked})} />
              <label htmlFor="sensitive" style={{ margin: 0 }}>Sensitive Skin?</label>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              {!isNewUser && (
                <button type="button" className="btn-secondary" onClick={onComplete}>Cancel</button>
              )}
              <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1 }}>
                {loading ? 'Saving...' : (isNewUser ? 'Next Step ➔' : 'Save Changes ➔')}
              </button>
            </div>
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
              <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1 }}>
                {loading ? 'Saving...' : (isNewUser ? 'Complete Profile ✓' : 'Save Lifestyle ✓')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
