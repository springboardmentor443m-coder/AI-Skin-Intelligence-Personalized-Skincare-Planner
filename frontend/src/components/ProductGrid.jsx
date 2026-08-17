import React, { useState } from 'react';
import { ShoppingBag, Star, ShieldCheck, ExternalLink, Filter, Tag, ChevronDown, ChevronUp, Layers, Search } from 'lucide-react';

export default function ProductGrid({ recommendations }) {
  if (!recommendations || !recommendations.recommended_products) return null;

  const { target_profile, recommended_products, total_monthly_routine_cost, all_matching_products } = recommendations;
  const [selectedBudget, setSelectedBudget] = useState('All');
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { title: 'Cleanser', key: 'cleanser', icon: '🧼' },
    { title: 'Treatment Serum', key: 'treatment_serum', icon: '🧪' },
    { title: 'Moisturizer', key: 'moisturizer', icon: '💧' },
    { title: 'Sunscreen (SPF 50+)', key: 'sunscreen', icon: '☀️' }
  ];

  const parseNumPrice = (priceStr) => {
    if (!priceStr) return 0;
    const match = priceStr.match(/\d+/);
    if (!match) return 0;
    let num = parseInt(match[0], 10);
    if (priceStr.includes('$')) num *= 83;
    return num;
  };

  const isProductInBudget = (product) => {
    if (selectedBudget === 'All') return true;
    const price = parseNumPrice(product.price);
    if (selectedBudget === 'Budget') return price <= 500;
    if (selectedBudget === 'Mid-Tier') return price > 500 && price <= 1500;
    if (selectedBudget === 'Premium') return price > 1500;
    return true;
  };

  // Deduplicate: Exclude the top 4 core prescribed products from the bottom list
  const top4Names = new Set(
    Object.values(recommended_products)
      .filter(Boolean)
      .map(p => (p.name || '').toLowerCase())
  );

  const rawAdditionalList = all_matching_products || [];
  const uniqueAdditionalProducts = rawAdditionalList.filter(
    p => p && p.name && !top4Names.has(p.name.toLowerCase())
  );

  // Search query filtering for catalog list
  const filteredCatalog = uniqueAdditionalProducts.filter(item => {
    if (!isProductInBudget(item)) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.brand.toLowerCase().includes(q) ||
      (item.label && item.label.toLowerCase().includes(q))
    );
  });

  return (
    <section style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header Title & Subtitle */}
      <div style={{ marginBottom: '28px', textAlign: 'center' }}>
        <div className="glass-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', marginBottom: '12px' }}>
          <ShoppingBag size={14} color="#06B6D4" />
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#06B6D4' }}>Curated Skincare Prescriptions</span>
        </div>
        <h3 style={{ fontSize: '32px', fontWeight: 800 }}>
          Dermatologist Recommended Products
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>
          Matched specifically for {target_profile?.gender && target_profile.gender !== 'Unisex' ? <strong style={{ color: '#10B981' }}>{target_profile.gender} </strong> : null}<strong style={{ color: '#818CF8' }}>{target_profile?.skin_type} Skin</strong> treating <strong style={{ color: '#F43F5E' }}>{target_profile?.primary_concern}</strong>
        </p>

        {/* Total Monthly Routine Investment Banner */}
        {total_monthly_routine_cost && (
          <div style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '8px 20px', borderRadius: '30px' }}>
            <Tag size={16} color="#10B981" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#10B981' }}>
              Estimated Routine Investment: <strong>{total_monthly_routine_cost} / month</strong>
            </span>
          </div>
        )}
      </div>

      {/* Budget Tier Filters */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Filter size={14} color="#818CF8" /> Budget Filter:
        </span>
        {[
          { label: 'All Price Tiers', value: 'All' },
          { label: '💸 Budget (< ₹500)', value: 'Budget' },
          { label: '💳 Mid-Tier (₹500 - ₹1500)', value: 'Mid-Tier' },
          { label: '👑 Premium (> ₹1500)', value: 'Premium' }
        ].map((b) => (
          <button
            key={b.value}
            onClick={() => setSelectedBudget(b.value)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: selectedBudget === b.value ? '1px solid #818CF8' : '1px solid var(--border-glass)',
              background: selectedBudget === b.value ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.03)',
              color: selectedBudget === b.value ? '#FFFFFF' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* Product Cards Grid - Core 4 Prescribed Products */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {categories.map(({ title, key, icon }) => {
          const product = recommended_products[key];
          if (!product) return null;

          const matchesFilter = isProductInBudget(product);

          return (
            <div
              key={key}
              className="glass-card"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                position: 'relative',
                opacity: matchesFilter ? 1 : 0.4,
                filter: matchesFilter ? 'none' : 'grayscale(80%)',
                transition: 'all 0.3s ease'
              }}
            >
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

                {/* Product Image Thumbnail from Dataset */}
                {product.img && (
                  <div style={{ width: '100%', height: '160px', borderRadius: '12px', overflow: 'hidden', background: '#FFFFFF', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
                    <img
                      src={product.img}
                      alt={product.name}
                      style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}

                {/* Product Name & Brand */}
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#818CF8', textTransform: 'uppercase' }}>{product.brand}</span>
                <h4 style={{ fontSize: '15px', fontWeight: 800, marginTop: '4px', marginBottom: '12px', lineHeight: 1.3 }}>
                  {product.name}
                </h4>

                {/* Active Ingredients Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                  {product.actives && product.actives.map((act, i) => (
                    <span key={i} style={{ fontSize: '10px', fontWeight: 600, background: 'rgba(6, 182, 212, 0.1)', color: '#06B6D4', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                      {act}
                    </span>
                  ))}
                </div>

                {/* Rationale */}
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '20px' }}>
                  "{product.why}"
                </p>
              </div>

              {/* Footer Price & Buy Button */}
              <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>{product.price}</span>
                  <span style={{ fontSize: '11px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                    <ShieldCheck size={14} /> Dermatologist Verified
                  </span>
                </div>

                {product.url && (
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none' }}
                  >
                    <button
                      className="btn-secondary"
                      style={{ width: '100%', justifyContent: 'center', fontSize: '12px', padding: '8px', background: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.3)', color: '#818CF8' }}
                    >
                      <span>Buy / View Product</span>
                      <ExternalLink size={13} />
                    </button>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Down Arrow Toggle Button - View All Additional Dataset Alternatives (Only show if > 0 products exist) */}
      {uniqueAdditionalProducts.length > 0 && (
        <div style={{ textAlign: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: '32px' }}>
          
          <button
            onClick={() => setShowAllProducts(!showAllProducts)}
            className="btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 28px',
              borderRadius: '30px',
              fontSize: '14px',
              fontWeight: 700,
              background: showAllProducts ? 'linear-gradient(135deg, #4F46E5, #06B6D4)' : 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              color: '#FFFFFF',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            <Layers size={18} />
            <span>
              {showAllProducts ? `Collapse Dataset Catalog` : `Browse All ${uniqueAdditionalProducts.length} Additional Dataset Alternatives`}
            </span>
            {showAllProducts ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            {showAllProducts ? `Viewing unified product catalog table (Top 4 prescribed items excluded)` : `Click down arrow to view all ${uniqueAdditionalProducts.length} additional products for ${target_profile?.skin_type} skin`}
          </p>

          {/* Expanded Catalog Table / List View */}
          {showAllProducts && (
            <div className="glass-card" style={{ marginTop: '28px', padding: '24px', textAlign: 'left', overflow: 'hidden' }}>
              
              {/* Search Bar & Counter */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>
                    Matching Skincare Catalog ({filteredCatalog.length} Products)
                  </h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    All items are unique alternatives matched from 960+ dataset
                  </span>
                </div>

                <div style={{ position: 'relative', width: '260px' }}>
                  <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '10px' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search catalog items..."
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 34px',
                      borderRadius: '20px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-glass)',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* List Table Layout */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      <th style={{ padding: '12px 16px' }}>Item</th>
                      <th style={{ padding: '12px 16px' }}>Product & Brand</th>
                      <th style={{ padding: '12px 16px' }}>Category</th>
                      <th style={{ padding: '12px 16px' }}>Active Ingredients</th>
                      <th style={{ padding: '12px 16px' }}>Price</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCatalog.map((item, idx) => (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        {/* Image Thumbnail */}
                        <td style={{ padding: '12px 16px', width: '60px' }}>
                          {item.img ? (
                            <div style={{ width: '44px', height: '44px', borderRadius: '8px', overflow: 'hidden', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px' }}>
                              <img
                                src={item.img}
                                alt={item.name}
                                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            </div>
                          ) : (
                            <span style={{ fontSize: '18px' }}>🧴</span>
                          )}
                        </td>

                        {/* Product Name & Brand */}
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: '#818CF8', textTransform: 'uppercase', display: 'block' }}>
                            {item.brand}
                          </span>
                          <strong style={{ fontSize: '13px', color: '#FFFFFF' }}>{item.name}</strong>
                        </td>

                        {/* Category Label */}
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: '11px', background: 'rgba(255, 255, 255, 0.06)', padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
                            {item.label || 'Skincare'}
                          </span>
                        </td>

                        {/* Actives */}
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {item.actives && item.actives.slice(0, 2).map((act, i) => (
                              <span key={i} style={{ fontSize: '10px', background: 'rgba(6, 182, 212, 0.1)', color: '#06B6D4', padding: '2px 6px', borderRadius: '4px' }}>
                                {act}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Price */}
                        <td style={{ padding: '12px 16px', fontWeight: 800, color: '#10B981' }}>
                          {item.price}
                        </td>

                        {/* Action Buy Link */}
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          {item.url && (
                            <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                              <button style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#818CF8', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <span>Buy Now</span>
                                <ExternalLink size={11} />
                              </button>
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

        </div>
      )}

    </section>
  );
}
