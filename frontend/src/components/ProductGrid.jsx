import React from 'react';
import { ShoppingBag, Star, CheckCircle, ShieldCheck, Sparkles } from 'lucide-react';

export default function ProductGrid({ recommendations }) {
  if (!recommendations || !recommendations.recommended_products) return null;

  const { target_profile, recommended_products } = recommendations;
  const categories = [
    { title: 'Cleanser', key: 'cleanser', icon: '🧼' },
    { title: 'Treatment Serum', key: 'treatment_serum', icon: '🧪' },
    { title: 'Moisturizer', key: 'moisturizer', icon: '💧' },
    { title: 'Sunscreen (SPF 50+)', key: 'sunscreen', icon: '☀️' }
  ];

  return (
    <section style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <div className="glass-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', marginBottom: '12px' }}>
          <ShoppingBag size={14} color="#06B6D4" />
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#06B6D4' }}>Curated Skincare Prescriptions</span>
        </div>
        <h3 style={{ fontSize: '32px', fontWeight: 800 }}>
          Dermatologist Recommended Products
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>
          Matched specifically for <strong style={{ color: '#818CF8' }}>{target_profile?.skin_type} Skin</strong> treating <strong style={{ color: '#F43F5E' }}>{target_profile?.primary_concern}</strong>
        </p>
      </div>

      {/* Product Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
        {categories.map(({ title, key, icon }) => {
          const product = recommended_products[key];
          if (!product) return null;

          return (
            <div key={key} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
              <div>
                {/* Category Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', tracking: '1px', color: 'var(--text-muted)' }}>
                    {icon} {title}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                    <Star size={12} color="#F59E0B" fill="#F59E0B" />
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#F59E0B' }}>{product.rating}</span>
                  </div>
                </div>

                {/* Product Name & Brand */}
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#818CF8', textTransform: 'uppercase' }}>{product.brand}</span>
                <h4 style={{ fontSize: '16px', fontWeight: 800, marginTop: '4px', marginBottom: '12px', lineHeight: 1.3 }}>
                  {product.name}
                </h4>

                {/* Active Ingredients Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                  {product.actives && product.actives.map((act, i) => (
                    <span key={i} style={{ fontSize: '11px', fontWeight: 500, background: 'rgba(6, 182, 212, 0.1)', color: '#06B6D4', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                      {act}
                    </span>
                  ))}
                </div>

                {/* Rationale */}
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '20px' }}>
                  "{product.why}"
                </p>
              </div>

              {/* Footer Price & Status */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-glass)', paddingTop: '12px' }}>
                <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>{product.price}</span>
                <span style={{ fontSize: '11px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                  <ShieldCheck size={14} /> Dermatologist Verified
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
