import { useState, useEffect } from 'react';

export default function Dashboard({ userId, onLogout }) {
  const [routine, setRoutine] = useState(null);
  const [selectedDay, setSelectedDay] = useState('Day 1');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch routine on load
    fetch(`http://127.0.0.1:8000/routine/${userId}`)
      .then(res => res.json())
      .then(data => {
        setRoutine(data.routine);
        if (data.routine && Object.keys(data.routine).length > 0) {
          setSelectedDay(Object.keys(data.routine)[0]);
        }
      })
      .catch(err => console.error("Failed to load routine", err));
  }, [userId]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setAnalysis(null);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', image);

    try {
      const res = await fetch(`http://127.0.0.1:8000/analyze-image?user_id=${userId}`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Analysis failed');
      setAnalysis(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>My Dashboard</h2>
        <button className="btn-secondary" onClick={onLogout} style={{ width: 'auto' }}>Logout</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Left Column: Routine */}
        <div className="glass-card">
          <h3>My 7-Day Skincare Routine</h3>
          {routine ? (
            <div>
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '1.5rem', paddingBottom: '0.5rem', WebkitOverflowScrolling: 'touch' }}>
                {Object.keys(routine).map(day => (
                  <button 
                    key={day} 
                    onClick={() => setSelectedDay(day)}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      borderRadius: '20px', 
                      border: 'none', 
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      background: selectedDay === day ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
                      color: selectedDay === day ? 'white' : 'var(--text-primary)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <h4 style={{ color: 'var(--secondary-color)', marginTop: '0.5rem' }}>Morning ☀️</h4>
              <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                {routine[selectedDay]?.morning?.map((item, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>{item}</li>)}
              </ul>
              <h4 style={{ color: 'var(--secondary-color)', marginTop: '1.5rem' }}>Night 🌙</h4>
              <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                {routine[selectedDay]?.night?.map((item, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>{item}</li>)}
              </ul>
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>Loading your routine...</p>
          )}
        </div>

        {/* Right Column: AI Analysis */}
        <div className="glass-card">
          <h3>AI Skin Analysis</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Upload a close-up selfie to get real-time analysis and product recommendations.
          </p>
          
          <input type="file" accept="image/*" onChange={handleImageChange} style={{ marginBottom: '1rem', color: 'var(--text-primary)' }} />
          
          {preview && (
            <div style={{ marginBottom: '1rem', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--surface-border)' }}>
              <img src={preview} alt="Selfie preview" style={{ width: '100%', display: 'block' }} />
            </div>
          )}

          {error && <div style={{ color: 'var(--error-color)', marginBottom: '1rem' }}>{error}</div>}

          <button className="btn-primary" onClick={analyzeImage} disabled={!image || loading}>
            {loading ? 'Analyzing...' : 'Analyze Image ✨'}
          </button>

          {analysis && (
            <div style={{ marginTop: '2rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <h4 style={{ margin: 0, color: 'var(--primary-color)' }}>
                  Condition Detected: {analysis.prediction.toUpperCase()}
                </h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Confidence: {analysis.confidence}%
                </p>
              </div>

              <h4>Top Product Matches:</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {analysis.recommended_products.map((product, i) => (
                  <div key={i} style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', borderLeft: '4px solid var(--secondary-color)' }}>
                    <h5 style={{ margin: 0, marginBottom: '0.25rem' }}>{product.product_name}</h5>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <span>{product.brand_name}</span>
                      <span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>${product.price_usd}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--primary-color)', marginTop: '0.5rem' }}>
                      ★ {product.rating} | Match Score: {(product.similarity_score * 100).toFixed(0)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
