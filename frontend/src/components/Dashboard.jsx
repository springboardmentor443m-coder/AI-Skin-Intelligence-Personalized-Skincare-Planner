import { useState, useEffect } from 'react';

export default function Dashboard({ userId, onLogout, onEditProfile }) {
  const [routine, setRoutine] = useState(null);
  const [selectedDay, setSelectedDay] = useState('Day 1');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [adaptations, setAdaptations] = useState({});
  const [mateMessage, setMateMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [mateLoading, setMateLoading] = useState(false);
  const [mateError, setMateError] = useState('');
  const [completedItems, setCompletedItems] = useState({});

  const toggleItemCompletion = (day, time, index) => {
    const key = `${day}-${time}-${index}`;
    setCompletedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const fetchRoutine = async (currentAdaptations) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/routine/${userId}/adapt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adaptations: currentAdaptations || adaptations })
      });
      const data = await res.json();
      setRoutine(data.routine);
      if (data.routine && Object.keys(data.routine).length > 0 && selectedDay === 'Day 1') {
         // Keep selected day if it exists, otherwise it's set by default state
      }
    } catch (err) {
      console.error("Failed to load routine", err);
    }
  };

  useEffect(() => {
    fetchRoutine({});
  }, [userId]);

  const handleAdaptationChange = (condition) => {
    const newAdaptations = { ...adaptations, [selectedDay]: condition };
    setAdaptations(newAdaptations);
    fetchRoutine(newAdaptations);
  };

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

  const askSkinMate = async () => {
    const userMsg = mateMessage.trim();
    if (!userMsg) return;

    const historyToSend = chatHistory.slice(-6);

    const newHistory = [...chatHistory, { role: 'user', content: userMsg }];
    setChatHistory(newHistory);
    setMateMessage('');
    setMateLoading(true);
    setMateError('');

    try {
      const res = await fetch(`http://127.0.0.1:8000/skinmate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          message: userMsg,
          skin_condition: adaptations[selectedDay] || 'Normal',
          chat_history: historyToSend
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'SkinMate failed to respond');
      }

      setMateLoading(false);
      setChatHistory(prev => [...prev, { role: 'assistant', content: '' }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        setChatHistory(prev => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          updated[lastIndex] = { ...updated[lastIndex], content: updated[lastIndex].content + chunk };
          return updated;
        });
      }
    } catch (err) {
      setMateLoading(false);
      setMateError(err.message);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
        <h2 style={{ margin: 0 }}>My Dashboard</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-primary" onClick={onEditProfile} style={{ width: 'auto' }}>Edit My Profile</button>
          <button className="btn-primary" onClick={onLogout} style={{ width: 'auto' }}>Logout</button>
        </div>
      </div>

      <div className="dashboard-grid">
        
        {/* Left Column: Routine */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%' }}>
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

              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>Skin Check-in ({selectedDay})</h4>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>How is your skin feeling today?</p>
                <select 
                  value={adaptations[selectedDay] || 'Normal'} 
                  onChange={(e) => handleAdaptationChange(e.target.value)}
                  style={{ padding: '0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)', width: '100%', outline: 'none' }}
                >
                  <option value="Normal" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>Normal</option>
                  <option value="Irritated" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>Irritated</option>
                  <option value="Dry" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>Dry</option>
                  <option value="Red" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>Red</option>
                </select>
              </div>

              {adaptations[selectedDay] && adaptations[selectedDay] !== 'Normal' && (
                <div style={{ background: 'var(--primary-color)', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
                  <span>⚕️</span> Recovery Routine Active ({adaptations[selectedDay]})
                </div>
              )}

              <h4 style={{ color: 'var(--secondary-color)', marginTop: '0.5rem' }}>Morning ☀️</h4>
              <ul style={{ listStyle: 'none', paddingLeft: 0, color: 'var(--text-secondary)' }}>
                {routine[selectedDay]?.morning?.map((item, i) => {
                  const key = `${selectedDay}-morning-${i}`;
                  const isCompleted = completedItems[key];
                  return (
                    <li key={i} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input 
                        type="checkbox" 
                        checked={isCompleted || false}
                        onChange={() => toggleItemCompletion(selectedDay, 'morning', i)}
                        style={{ cursor: 'pointer', accentColor: 'var(--primary-color)', width: '16px', height: '16px', flexShrink: 0 }}
                      />
                      <span style={{ 
                        textDecoration: isCompleted ? 'line-through' : 'none',
                        opacity: isCompleted ? 0.5 : 1,
                        transition: 'all 0.2s ease',
                        lineHeight: '1.4'
                      }}>
                        {item}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <h4 style={{ color: 'var(--secondary-color)', marginTop: '1.5rem' }}>Night 🌙</h4>
              <ul style={{ listStyle: 'none', paddingLeft: 0, color: 'var(--text-secondary)' }}>
                {routine[selectedDay]?.night?.map((item, i) => {
                  const key = `${selectedDay}-night-${i}`;
                  const isCompleted = completedItems[key];
                  return (
                    <li key={i} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input 
                        type="checkbox" 
                        checked={isCompleted || false}
                        onChange={() => toggleItemCompletion(selectedDay, 'night', i)}
                        style={{ cursor: 'pointer', accentColor: 'var(--primary-color)', width: '16px', height: '16px', flexShrink: 0 }}
                      />
                      <span style={{ 
                        textDecoration: isCompleted ? 'line-through' : 'none',
                        opacity: isCompleted ? 0.5 : 1,
                        transition: 'all 0.2s ease',
                        lineHeight: '1.4'
                      }}>
                        {item}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>Loading your routine...</p>
          )}
        </div>

        {/* Right Column: AI Analysis */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%' }}>
          <h3>AI Skin Analysis</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Upload a close-up selfie to get real-time analysis and product recommendations.
          </p>
          
          <input type="file" accept="image/*" onChange={handleImageChange} className="file-input" style={{ marginBottom: '1rem', color: 'var(--text-primary)', width: '100%' }} />
          
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

        {/* Third Column: SkinMate */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ margin: 0 }}>SkinMate 🤖</h3>
              <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
                Your AI skincare companion
              </p>
            </div>
            <button className="btn-secondary" onClick={() => setChatHistory([])} style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', width: 'auto' }}>Clear Chat</button>
          </div>
          
          <div style={{ flex: 1, minHeight: '300px', maxHeight: '500px', overflowY: 'auto', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem' }}>
            {chatHistory.length === 0 && (
              <div style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
                Ask me anything about your skin or routine!
              </div>
            )}
            {chatHistory.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
                color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                padding: '0.75rem 1rem',
                borderRadius: '16px',
                borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '16px',
                maxWidth: '85%',
                border: msg.role === 'assistant' ? '1px solid var(--surface-border)' : 'none'
              }}>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.4', fontSize: '0.9rem' }}>
                  {msg.content}
                </p>
              </div>
            ))}
            {mateLoading && (
              <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.05)', padding: '0.75rem 1rem', borderRadius: '16px', borderBottomLeftRadius: '4px', border: '1px solid var(--surface-border)' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>SkinMate is thinking...</p>
              </div>
            )}
          </div>

          <div style={{ marginTop: 'auto' }}>
            {mateError && <div style={{ color: 'var(--error-color)', marginBottom: '1rem', fontSize: '0.9rem' }}>{mateError}</div>}

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                value={mateMessage}
                onChange={(e) => setMateMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && askSkinMate()}
                placeholder="Ask a skincare question..."
                style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '20px', background: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)', outline: 'none', boxSizing: 'border-box' }}
              />
              <button 
                className="btn-primary" 
                onClick={askSkinMate} 
                disabled={!mateMessage.trim() || mateLoading}
                style={{ padding: '0.75rem 1.5rem', borderRadius: '20px', width: 'auto' }}
              >
                Send
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
