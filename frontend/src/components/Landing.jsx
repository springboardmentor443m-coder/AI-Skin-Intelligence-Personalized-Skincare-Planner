export default function Landing({ onStart }) {
  return (
    <div className="flex-center flex-col h-full text-center gap-4" style={{ minHeight: '80vh' }}>
      <h1 style={{ fontSize: '3.5rem', marginBottom: '0.5rem', background: 'linear-gradient(to right, var(--primary-color), var(--secondary-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        AI Skin Intelligence
      </h1>
      <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', marginBottom: '2rem' }}>
        Your personalized AI dermatologist and shopping assistant. Upload a selfie and get customized routines and product recommendations.
      </p>
      <button className="btn-primary" onClick={onStart} style={{ padding: '1rem 3rem', fontSize: '1.2rem', borderRadius: '50px' }}>
        Start Your Journey ➔
      </button>
    </div>
  );
}
