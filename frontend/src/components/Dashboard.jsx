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
  const [progressData, setProgressData] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [skinProfile, setSkinProfile] = useState(null);

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

  const fetchProgress = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/progress/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setProgressData(data);
      }
    } catch (err) {
      console.error("Failed to load progress", err);
    } finally {
      setLoadingProgress(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/skin-profile/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setSkinProfile(data);
      }
    } catch (err) {
      console.error("Failed to load skin profile", err);
    }
  };

  useEffect(() => {
    fetchRoutine({});
    fetchProgress();
    fetchProfile();
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
      
      // Refresh the progress tracker automatically
      fetchProgress();
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

  const tabs = [
    { id: 'overview', label: '🏠 Overview' },
    { id: 'analysis', label: '🔍 Skin Analysis' },
    { id: 'routine', label: '🧴 My Routine' },
    { id: 'progress', label: '📈 Progress' },
    { id: 'skinmate', label: '🤖 SkinMate' },
    { id: 'recommendations', label: '🛍️ Recommendations' }
  ];

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
        <h2 style={{ margin: 0 }}>My Dashboard</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-primary" onClick={onEditProfile} style={{ width: 'auto' }}>Edit My Profile</button>
          <button className="btn-primary" onClick={onLogout} style={{ width: 'auto' }}>Logout</button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '2rem', 
        overflowX: 'auto', 
        paddingBottom: '0.5rem',
        WebkitOverflowScrolling: 'touch' 
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '20px',
              border: '1px solid var(--surface-border)',
              background: activeTab === tab.id ? 'var(--primary-color)' : 'var(--surface-color)',
              color: activeTab === tab.id ? '#1e1e24' : 'var(--text-primary)',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.3s ease',
              boxShadow: activeTab === tab.id ? '0 4px 14px rgba(252, 165, 165, 0.3)' : 'none',
              backdropFilter: 'var(--blur)'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="glass-card" style={{ minHeight: '500px' }}>
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (() => {
          // Process Routine Completion chart data
          const routineLabels = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
          const routinePercentages = routineLabels.map(day => {
            if (!routine || !routine[day]) return 0;
            const totalItems = (routine[day].morning?.length || 0) + (routine[day].night?.length || 0);
            if (totalItems === 0) return 0;

            let completedCount = 0;
            (routine[day].morning || []).forEach((_, i) => {
              if (completedItems[`${day}-morning-${i}`]) completedCount++;
            });
            (routine[day].night || []).forEach((_, i) => {
              if (completedItems[`${day}-night-${i}`]) completedCount++;
            });

            return Math.round((completedCount / totalItems) * 100);
          });

          return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>Welcome back! 👋</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Here is a quick glance at your skin profile today.</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
                <h4 style={{ color: 'var(--primary-color)', margin: '0 0 1rem 0' }}>User Profile</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {skinProfile?.age && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Age</span>
                      <span style={{ fontWeight: 'bold' }}>{skinProfile.age}</span>
                    </div>
                  )}
                  {skinProfile?.skin_type && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Skin Type</span>
                      <span style={{ fontWeight: 'bold' }}>{skinProfile.skin_type}</span>
                    </div>
                  )}
                  
                  {progressData.length > 0 ? (() => {
                    const latest = progressData[progressData.length - 1];
                    const conditionMatch = latest.notes?.match(/Automated check-in: Detected (.*?) skin condition/);
                    return (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Latest Condition</span>
                          <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>
                            {conditionMatch ? conditionMatch[1].toUpperCase() : 'N/A'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Last Analysis</span>
                          <span style={{ fontWeight: 'bold' }}>
                            {new Date(latest.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </>
                    );
                  })() : (
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>No analysis done yet.</div>
                  )}
                </div>
              </div>
              
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
                <h4 style={{ color: 'var(--secondary-color)', margin: '0 0 1rem 0' }}>Today's Focus</h4>
                <p style={{ margin: '0 0 0.5rem 0' }}>It's {selectedDay}.</p>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Morning: {routine?.[selectedDay]?.morning?.length || 0} items<br/>
                  Night: {routine?.[selectedDay]?.night?.length || 0} items
                </div>
              </div>
            </div>

            {/* Routine Completion Chart */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
              <h4 style={{ margin: '0 0 1.5rem 0' }}>7-Day Routine Completion</h4>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '150px', paddingBottom: '2rem', position: 'relative' }}>
                {routineLabels.map((label, idx) => (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', position: 'relative' }}>
                    <div style={{ 
                      width: '100%', 
                      maxWidth: '40px', 
                      height: `${routinePercentages[idx]}%`, 
                      background: 'var(--primary-color)', 
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.3s ease',
                      minHeight: routinePercentages[idx] === 0 ? '4px' : 'auto',
                      opacity: routinePercentages[idx] === 0 ? 0.3 : 1
                    }} title={`${routinePercentages[idx]}% completed`}></div>
                    <span style={{ position: 'absolute', bottom: '-25px', fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{label}</span>
                    <span style={{ position: 'absolute', top: routinePercentages[idx] === 0 ? 'calc(100% - 24px)' : `calc(100% - ${routinePercentages[idx]}% - 20px)`, fontSize: '0.8rem', fontWeight: 'bold' }}>{routinePercentages[idx]}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* My Skin Report */}
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
              <h4 style={{ color: 'var(--primary-color)', margin: '0 0 1rem 0' }}>My Skin Report 📋</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Age / Skin Type</div>
                  <div style={{ fontWeight: 'bold' }}>{skinProfile?.age || 'Not available'} / {skinProfile?.skin_type || 'Not available'}</div>
                </div>
                
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Latest Condition</div>
                  <div style={{ fontWeight: 'bold' }}>
                    {progressData.length > 0 && progressData[progressData.length - 1].notes?.match(/Automated check-in: Detected (.*?) skin condition/) 
                      ? progressData[progressData.length - 1].notes.match(/Automated check-in: Detected (.*?) skin condition/)[1].toUpperCase() 
                      : 'Not available'}
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Latest Analysis Date</div>
                  <div style={{ fontWeight: 'bold' }}>
                    {progressData.length > 0 
                      ? new Date(progressData[progressData.length - 1].created_at).toLocaleDateString() 
                      : 'Not available'}
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Latest Confidence</div>
                  <div style={{ fontWeight: 'bold' }}>
                    {analysis?.confidence ? `${(analysis.confidence * 100).toFixed(1)}%` : 'Not available'}
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>7-Day Avg Completion</div>
                  <div style={{ fontWeight: 'bold' }}>
                    {routinePercentages.length > 0 
                      ? `${Math.round(routinePercentages.reduce((a, b) => a + b, 0) / routinePercentages.length)}%` 
                      : 'Not available'}
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total History Records</div>
                  <div style={{ fontWeight: 'bold' }}>{progressData.length} check-in{progressData.length !== 1 ? 's' : ''}</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              <button className="btn-primary" onClick={() => setActiveTab('analysis')} style={{ width: 'auto' }}>
                🔍 New Skin Analysis
              </button>
              <button className="btn-secondary" onClick={() => setActiveTab('skinmate')} style={{ width: 'auto' }}>
                🤖 Ask SkinMate
              </button>
            </div>
          </div>
          );
        })()}

        {/* SKIN ANALYSIS TAB */}
        {activeTab === 'analysis' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>AI Skin Analysis</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Upload a close-up selfie to get real-time analysis.</p>
            </div>
            
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px dashed var(--surface-border)' }}>
              <input type="file" accept="image/*" onChange={handleImageChange} className="file-input" style={{ marginBottom: '1rem', color: 'var(--text-primary)', width: '100%' }} />
              
              {preview && (
                <div style={{ marginBottom: '1rem', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--surface-border)', maxHeight: '300px', display: 'flex', justifyContent: 'center', background: 'black' }}>
                  <img src={preview} alt="Selfie preview" style={{ maxHeight: '300px', objectFit: 'contain' }} />
                </div>
              )}

              {error && <div style={{ color: 'var(--error-color)', marginBottom: '1rem' }}>{error}</div>}

              <button className="btn-primary" onClick={analyzeImage} disabled={!image || loading} style={{ width: '100%' }}>
                {loading ? 'Analyzing...' : 'Analyze Image ✨'}
              </button>
            </div>

            {analysis && (
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--primary-color)' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary-color)' }}>
                  Condition Detected: {analysis.prediction.toUpperCase()}
                </h4>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                  Confidence: {analysis.confidence}%
                </p>
                <div style={{ marginTop: '1rem' }}>
                  <button className="btn-secondary" onClick={() => setActiveTab('recommendations')} style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                    View Product Matches 🛍️
                  </button>
                </div>
              </div>
            )}
            
            {/* Mini History */}
            <div style={{ marginTop: '2rem' }}>
              <h4 style={{ margin: '0 0 1rem 0' }}>Recent Analyses</h4>
              {progressData.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No previous analyses found.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  {progressData.slice(-3).reverse().map((entry, idx) => {
                    const conditionMatch = entry.notes?.match(/Automated check-in: Detected (.*?) skin condition/);
                    return (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '1rem', border: '1px solid var(--surface-border)' }}>
                        {conditionMatch ? (
                          <div style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>
                            ✨ {conditionMatch[1].toUpperCase()}
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>{entry.notes || 'Manual Check-in'}</div>
                        )}
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                          {entry.created_at ? new Date(entry.created_at).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MY ROUTINE TAB */}
        {activeTab === 'routine' && (
          <div>
            <h3 style={{ margin: '0 0 1.5rem 0' }}>My 7-Day Skincare Routine</h3>
            {routine ? (
              <div>
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '2rem', paddingBottom: '0.5rem', WebkitOverflowScrolling: 'touch' }}>
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
                        color: selectedDay === day ? '#1e1e24' : 'var(--text-primary)',
                        fontWeight: selectedDay === day ? 'bold' : 'normal',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {day}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                  <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
                    <h4 style={{ margin: '0 0 1rem 0' }}>Daily Check-in ({selectedDay})</h4>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>How is your skin feeling today?</p>
                    <select 
                      value={adaptations[selectedDay] || 'Normal'} 
                      onChange={(e) => handleAdaptationChange(e.target.value)}
                      style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)', width: '100%', outline: 'none' }}
                    >
                      <option value="Normal">Normal</option>
                      <option value="Irritated">Irritated</option>
                      <option value="Dry">Dry</option>
                      <option value="Red">Red</option>
                    </select>

                    {adaptations[selectedDay] && adaptations[selectedDay] !== 'Normal' && (
                      <div style={{ background: 'var(--primary-color)', color: '#1e1e24', padding: '0.75rem', borderRadius: '8px', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
                        <span>⚕️</span> Recovery Routine Active ({adaptations[selectedDay]})
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 style={{ color: 'var(--secondary-color)', margin: '0 0 1rem 0' }}>Morning Routine ☀️</h4>
                    <ul style={{ listStyle: 'none', paddingLeft: 0, color: 'var(--text-secondary)' }}>
                      {routine[selectedDay]?.morning?.map((item, i) => {
                        const key = `${selectedDay}-morning-${i}`;
                        const isCompleted = completedItems[key];
                        return (
                          <li key={i} style={{ marginBottom: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                            <input 
                              type="checkbox" 
                              checked={isCompleted || false}
                              onChange={() => toggleItemCompletion(selectedDay, 'morning', i)}
                              style={{ cursor: 'pointer', accentColor: 'var(--primary-color)', width: '18px', height: '18px', flexShrink: 0, marginTop: '2px' }}
                            />
                            <span style={{ 
                              textDecoration: isCompleted ? 'line-through' : 'none',
                              opacity: isCompleted ? 0.5 : 1,
                              transition: 'all 0.2s ease',
                              lineHeight: '1.4',
                              color: 'var(--text-primary)'
                            }}>
                              {item}
                            </span>
                          </li>
                        );
                      })}
                    </ul>

                    <h4 style={{ color: 'var(--secondary-color)', margin: '2rem 0 1rem 0' }}>Night Routine 🌙</h4>
                    <ul style={{ listStyle: 'none', paddingLeft: 0, color: 'var(--text-secondary)' }}>
                      {routine[selectedDay]?.night?.map((item, i) => {
                        const key = `${selectedDay}-night-${i}`;
                        const isCompleted = completedItems[key];
                        return (
                          <li key={i} style={{ marginBottom: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                            <input 
                              type="checkbox" 
                              checked={isCompleted || false}
                              onChange={() => toggleItemCompletion(selectedDay, 'night', i)}
                              style={{ cursor: 'pointer', accentColor: 'var(--primary-color)', width: '18px', height: '18px', flexShrink: 0, marginTop: '2px' }}
                            />
                            <span style={{ 
                              textDecoration: isCompleted ? 'line-through' : 'none',
                              opacity: isCompleted ? 0.5 : 1,
                              transition: 'all 0.2s ease',
                              lineHeight: '1.4',
                              color: 'var(--text-primary)'
                            }}>
                              {item}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>Loading your routine...</p>
            )}
          </div>
        )}

        {/* PROGRESS TAB */}
        {activeTab === 'progress' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 1.5rem 0' }}>Skin Progress Tracker 📈</h3>
            {loadingProgress ? (
              <p style={{ color: 'var(--text-secondary)' }}>Loading progress...</p>
            ) : progressData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>Start tracking your skin progress</h4>
                <p style={{ color: 'var(--text-secondary)' }}>Upload your first skin image in the Analysis tab to begin seeing your progress over time.</p>
                <button className="btn-primary" onClick={() => setActiveTab('analysis')} style={{ marginTop: '1rem', width: 'auto' }}>Go to Analysis</button>
              </div>
            ) : (
              <div style={{ position: 'relative', padding: '2rem 0', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <div style={{ position: 'absolute', top: '72px', left: '0', right: '0', height: '2px', background: 'var(--surface-border)', zIndex: 0 }}></div>
                <div style={{ display: 'flex', gap: '2rem', position: 'relative', zIndex: 1, padding: '0 1rem', width: 'max-content', minWidth: '100%' }}>
                  {progressData.map((entry, index) => (
                    <div key={entry.progress_id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '200px' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--primary-color)', boxShadow: '0 0 10px var(--primary-color)', marginTop: '24px' }}></div>
                      
                      <div style={{ 
                        background: 'rgba(255,255,255,0.05)', 
                        borderRadius: '12px', 
                        padding: '1.5rem 1rem', 
                        border: '1px solid var(--surface-border)',
                        textAlign: 'center',
                        width: '100%'
                      }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--secondary-color)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                          Check-in {index + 1}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                          {entry.created_at ? new Date(entry.created_at).toLocaleDateString() : 'N/A'}
                        </div>
                        {entry.image_path && (
                          <div style={{ color: 'var(--text-primary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>📷 Image attached</div>
                        )}
                        {entry.notes && (() => {
                          const conditionMatch = entry.notes.match(/Automated check-in: Detected (.*?) skin condition/);
                          if (conditionMatch) {
                            return (
                              <div style={{ 
                                background: 'rgba(252, 165, 165, 0.15)', 
                                color: 'var(--primary-color)', 
                                padding: '0.5rem', 
                                borderRadius: '12px', 
                                fontSize: '0.85rem', 
                                fontWeight: 'bold',
                                display: 'inline-block',
                                border: '1px solid rgba(252, 165, 165, 0.3)'
                              }}>
                                ✨ {conditionMatch[1].toUpperCase()}
                              </div>
                            );
                          }
                          return (
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', wordBreak: 'break-word' }}>"{entry.notes}"</p>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SKINMATE TAB */}
        {activeTab === 'skinmate' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '600px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ margin: 0 }}>SkinMate 🤖</h3>
                <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
                  Your personal AI skincare companion
                </p>
              </div>
              <button className="btn-secondary" onClick={() => setChatHistory([])} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', width: 'auto' }}>Clear Chat</button>
            </div>
            
            <div style={{ 
              flex: 1, 
              overflowY: 'auto', 
              marginBottom: '1.5rem', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1rem', 
              padding: '1rem',
              background: 'rgba(0,0,0,0.1)',
              borderRadius: '12px',
              border: '1px solid var(--surface-border)'
            }}>
              {chatHistory.length === 0 && (
                <div style={{ color: 'var(--text-secondary)', textAlign: 'center', margin: 'auto' }}>
                  Ask me anything about your skin, routine, or products!
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.role === 'user' ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
                  color: msg.role === 'user' ? '#1e1e24' : 'var(--text-primary)',
                  padding: '1rem 1.25rem',
                  borderRadius: '20px',
                  borderBottomRightRadius: msg.role === 'user' ? '4px' : '20px',
                  borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '20px',
                  maxWidth: '85%',
                  border: msg.role === 'assistant' ? '1px solid var(--surface-border)' : 'none',
                  boxShadow: msg.role === 'user' ? '0 4px 14px rgba(252, 165, 165, 0.2)' : 'none'
                }}>
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.5', fontSize: '0.95rem' }}>
                    {msg.content}
                  </p>
                </div>
              ))}
              {mateLoading && (
                <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.05)', padding: '1rem 1.25rem', borderRadius: '20px', borderBottomLeftRadius: '4px', border: '1px solid var(--surface-border)' }}>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Thinking...</p>
                </div>
              )}
            </div>

            <div>
              {mateError && <div style={{ color: 'var(--error-color)', marginBottom: '1rem', fontSize: '0.9rem' }}>{mateError}</div>}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input 
                  value={mateMessage}
                  onChange={(e) => setMateMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && askSkinMate()}
                  placeholder="Ask a skincare question..."
                  style={{ flex: 1, padding: '1rem 1.5rem', borderRadius: '24px', background: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)', outline: 'none', fontSize: '1rem' }}
                />
                <button 
                  className="btn-primary" 
                  onClick={askSkinMate} 
                  disabled={!mateMessage.trim() || mateLoading}
                  style={{ padding: '0 2rem', borderRadius: '24px', width: 'auto' }}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RECOMMENDATIONS TAB */}
        {activeTab === 'recommendations' && (
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>Personalized Recommendations 🛍️</h3>
            <p style={{ color: 'var(--text-secondary)', margin: '0 0 2rem 0' }}>Products matched to your skin profile.</p>

            {analysis && analysis.recommended_products ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {analysis.recommended_products.map((product, i) => (
                  <div key={i} style={{ 
                    padding: '1.5rem', 
                    background: 'rgba(255,255,255,0.05)', 
                    borderRadius: '12px', 
                    border: '1px solid var(--surface-border)',
                    borderTop: '4px solid var(--secondary-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    <h5 style={{ margin: 0, fontSize: '1.1rem' }}>{product.product_name}</h5>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{product.brand_name}</div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem' }}>
                      <span style={{ color: 'var(--success-color)', fontWeight: 'bold', fontSize: '1.2rem' }}>${product.price_usd}</span>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '0.8rem' }}>
                        <span style={{ color: '#fbbf24' }}>★ {product.rating}</span>
                        <span style={{ color: 'var(--primary-color)' }}>Match: {(product.similarity_score * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--surface-border)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧴</div>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>No Recommendations Yet</h4>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Upload a selfie in the Skin Analysis tab to get personalized product matches.</p>
                <button className="btn-primary" onClick={() => setActiveTab('analysis')} style={{ width: 'auto' }}>
                  Analyze My Skin
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
