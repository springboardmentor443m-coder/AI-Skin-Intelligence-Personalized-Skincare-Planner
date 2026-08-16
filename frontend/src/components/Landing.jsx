export default function Landing({ onStart }) {
  return (
    <div className="flex-center flex-col h-full text-center gap-8" style={{ minHeight: '80vh', padding: '2rem 1rem' }}>
      
      {/* Hero Section */}
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', background: 'linear-gradient(to right, var(--primary-color), var(--secondary-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: '1.2' }}>
          AI Skin Intelligence
        </h1>
        <p style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '0.75rem', fontWeight: '500' }}>
          Understand your skin. Build a personalized routine. Improve your skincare journey with AI.
        </p>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
          Analyze your skin • Get personalized recommendations • Chat with SkinMate
        </p>
        <button className="btn-primary" onClick={onStart} style={{ width: '100%', maxWidth: '280px', height: '56px', padding: '0', fontSize: '1.2rem', borderRadius: '50px', margin: '0 auto' }}>
          Start Your Journey ➔
        </button>
      </div>

      {/* Feature Cards Section */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '1.5rem', 
        justifyContent: 'center', 
        width: '100%',
        maxWidth: '1000px',
        marginTop: '1rem'
      }}>
        {/* Card 1 */}
        <div className="glass-card" style={{ flex: '1 1 280px', padding: '2rem 1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🧠</div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--primary-color)' }}>AI Skin Analysis</h3>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Analyze a skin image and get an AI-powered skin condition prediction.
          </p>
        </div>

        {/* Card 2 */}
        <div className="glass-card" style={{ flex: '1 1 280px', padding: '2rem 1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✨</div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--primary-color)' }}>Personalized Routine</h3>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Get skincare routines adapted to your skin profile and daily check-ins.
          </p>
        </div>

        {/* Card 3 */}
        <div className="glass-card" style={{ flex: '1 1 280px', padding: '2rem 1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🤖</div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--primary-color)' }}>SkinMate</h3>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Chat with your AI skincare companion and ask follow-up questions.
          </p>
        </div>
      </div>
    </div>
  );
}
