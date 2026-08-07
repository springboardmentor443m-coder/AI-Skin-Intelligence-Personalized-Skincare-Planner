import React, { useState } from 'react';

interface Product {
  id: number;
  name: string;
  brand: string;
  rating: number;
  price: number;
  suitableFor: string;
  ingredients: string[];
  match: number;
  icon: string;
  concern: string;
  image: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export const ProductRecommendations: React.FC = () => {
  const [budget, setBudget] = useState(4000);
  const [selectedConcern, setSelectedConcern] = useState('All');
  const [savedProducts, setSavedProducts] = useState<number[]>([]);

  // Cart and Checkout States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'delivery' | 'payment' | 'success'>('cart');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Form inputs
  const [shippingAddress, setShippingAddress] = useState({
    name: 'Elena Thorne',
    phone: '+1 (555) 234-8291',
    address: 'Suite 404, Clinical Park Lane',
    city: 'New York',
    pincode: '10001'
  });
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'cod'>('card');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '' });
  const [upiId, setUpiId] = useState('');

  const productsList: Product[] = [];
  const concerns = ['Brightening', 'Redness', 'Wrinkles', 'Sebum Control', 'Hydration'];
  const brands = ['Aetheris Bio', 'Clinical Labs', 'Restorative Co.', 'PureDerm', 'Dermal Science', 'Soma Organics', 'Epigenetic Labs', 'KeraCell'];
  const productTypes: { [key: string]: string[] } = {
    'Brightening': ['C+ Serum', 'Alpha Arbutin Gel', 'Niacinamide Toner', 'Kojic Scrub', 'Brightening Masque', 'Vitamin C Lotion', 'Glow Essence'],
    'Redness': ['Barrier bio-cream', 'Soothing Emulsion', 'Cica Recovery Gel', 'Oatmeal Masque', 'Azelaic Calming Treatment', 'Panthenol Balm'],
    'Wrinkles': ['Retinol Treatment', 'Peptide Cream', 'Bakuchiol Serum', 'Restorative Night Elixir', 'Firming Concentrate', 'Line Rewind Gel'],
    'Sebum Control': ['BHA Clarifying Wash', 'Salicylic Cleansing Gel', 'Pore Minimizing Serum', 'Sulfur Masque', 'Zinc Balancing Emulsion'],
    'Hydration': ['Hyaluronic Moisture Gel', 'Squalane Nourishing Cream', 'Water Burst Toner', 'Beta-Glucan Humectant', 'Ceramide Shield Hydrator']
  };
  const ingredientsMap: { [key: string]: string[] } = {
    'Brightening': ['10% L-Ascorbic Acid', 'Ferulic Acid', 'Alpha Arbutin', 'Niacinamide', 'Kojic Acid', 'Licorice Extract', 'Tranexamic Acid'],
    'Redness': ['Centella Asiatica', 'Panthenol', 'Ceramides', 'Allantoin', 'Colloidal Oatmeal', 'Azelaic Acid', 'Madecassoside'],
    'Wrinkles': ['0.5% Pure Retinol', 'Bakuchiol', 'Peptides', 'Adenosine', 'Coenzyme Q10', 'Matrixyl 3000', 'Hyaluronic Acid'],
    'Sebum Control': ['2% Salicylic Acid', 'Zinc PCA', 'Tea Tree Extract', 'Kaolin Clay', 'Witch Hazel', 'Green Tea Extract'],
    'Hydration': ['Multi-weight Hyaluronic Acid', 'Squalane', 'Glycerin', 'Panthenol', 'Polyglutamic Acid', 'Ceramides']
  };
  const iconsMap: { [key: string]: string } = {
    'Brightening': 'colorize',
    'Redness': 'grass',
    'Wrinkles': 'spa',
    'Sebum Control': 'clean_hands',
    'Hydration': 'opacity'
  };
  const categoryImages: { [key: string]: string[] } = {
    'Serum': [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=400&q=80'
    ],
    'Cream': [
      'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=400&q=80'
    ],
    'Cleanser': [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1556229174-5e42a09e45af?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=400&q=80'
    ],
    'Toner': [
      'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=400&q=80'
    ],
    'Masque': [
      'https://images.unsplash.com/photo-1598440947587-f81d1134a6e1?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1567894192231-d22d9c1349db?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&w=400&q=80'
    ]
  };

  const skinTypes = ['Dry', 'Oily', 'Sensitive', 'Normal', 'Combination'];

  for (let i = 1; i <= 210; i++) {
    const concern = concerns[i % concerns.length];
    const brand = brands[i % brands.length];
    const types = productTypes[concern];
    const name = `${brand} ${types[i % types.length]}`;
    const price = Math.round((1000 + (i * 23.5) % 4000) / 50) * 50; 
    const rating = parseFloat((4.0 + (i * 0.17) % 1.0).toFixed(1));
    const match = 80 + (i * 7) % 20;
    
    const pool = ingredientsMap[concern];
    const ingredients = [
      pool[i % pool.length],
      pool[(i + 2) % pool.length],
      pool[(i + 4) % pool.length]
    ];
    
    const suitableFor = `${skinTypes[i % skinTypes.length]}, ${skinTypes[(i + 3) % skinTypes.length]}`;

    // Select category image pool based on name keywords
    const nameLower = name.toLowerCase();
    let category = 'Serum';
    if (nameLower.includes('cream') || nameLower.includes('balm') || nameLower.includes('hydrator') || nameLower.includes('lotion')) {
      category = 'Cream';
    } else if (nameLower.includes('wash') || nameLower.includes('cleans') || nameLower.includes('scrub')) {
      category = 'Cleanser';
    } else if (nameLower.includes('toner') || nameLower.includes('essence') || nameLower.includes('elixir')) {
      category = 'Toner';
    } else if (nameLower.includes('masque') || nameLower.includes('mask') || nameLower.includes('treatment')) {
      category = 'Masque';
    }
    
    const poolImg = categoryImages[category];
    const image = poolImg[i % poolImg.length];

    productsList.push({
      id: i,
      name: name,
      brand: brand,
      rating: rating,
      price: price,
      suitableFor: suitableFor,
      ingredients: ingredients,
      match: match,
      icon: iconsMap[concern],
      concern: concern,
      image: image
    });
  }

  const toggleSave = (id: number) => {
    setSavedProducts(prev => 
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  // Add Product to Cart & open drawer
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setCheckoutStep('cart');
    setIsCartOpen(true);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === id) {
        const nextQ = item.quantity + delta;
        return nextQ > 0 ? { ...item, quantity: nextQ } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.product.id !== id));
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    
    // Simulate transaction delay
    setTimeout(() => {
      setIsProcessingPayment(false);
      setOrderId(`AE-${Math.floor(10000 + Math.random() * 90000)}-${Math.floor(10 + Math.random() * 89)}`);
      setCheckoutStep('success');
      setCart([]); // Clear cart
    }, 2000);
  };

  const filteredProducts = productsList.filter(prod => {
    const budgetOk = prod.price <= budget;
    const concernOk = selectedConcern === 'All' || prod.concern === selectedConcern;
    return budgetOk && concernOk;
  });

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-display text-2xl font-bold text-on-surface">Targeted Product Recommendations</h2>
          <p className="text-xs text-on-surface-variant font-medium mt-1">Dermatologist-formulated skincare recommendations matching your active biometric parameters.</p>
        </div>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative glass-panel px-4 py-2 rounded-full border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all text-xs font-bold text-primary flex items-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">shopping_cart</span>
          Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
        </button>
      </div>

      {/* Filter panel */}
      <div className="glass-card p-5 rounded-2xl border border-white/20 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Budget filter */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            <span>Budget Limit</span>
            <span className="text-primary font-display font-bold">₹{budget.toLocaleString('en-IN')}</span>
          </div>
          <input
            type="range"
            min="500"
            max="5000"
            step="100"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full h-1.5 bg-surface-container-highest dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        {/* Concern filter */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Skin Concern</label>
          <select 
            value={selectedConcern}
            onChange={(e) => setSelectedConcern(e.target.value)}
            className="w-full py-2 px-3 bg-surface-container-low dark:bg-zinc-800 border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
          >
            <option value="All">Show All Concerns</option>
            <option value="Brightening">Brightening / Oxidation</option>
            <option value="Redness">Redness / Sensitivity</option>
            <option value="Wrinkles">Wrinkles / Aging</option>
            <option value="Sebum Control">Sebum Control / Acne</option>
            <option value="Hydration">Hydration / Dryness</option>
          </select>
        </div>

        {/* Active scan tag */}
        <div className="bg-primary/5 border border-primary/15 p-3 rounded-xl flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
          <div>
            <p className="text-[9px] font-bold text-primary uppercase tracking-wider">AI Filter Applied</p>
            <p className="text-[10px] text-on-surface-variant mt-0.5 leading-normal">Products sorted by biometric compatibility.</p>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
        {filteredProducts.map((prod) => {
          const isSaved = savedProducts.includes(prod.id);
          return (
            <div key={prod.id} className="bg-surface-container-lowest dark:bg-zinc-900 border border-outline-variant/15 hover:border-primary/20 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                {/* Product image */}
                <div className="h-44 rounded-xl mb-4 overflow-hidden relative shadow-inner">
                  <img 
                    src={prod.image} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    alt={prod.name}
                  />
                  <div className="absolute top-2.5 right-2.5 bg-primary/90 backdrop-blur text-white text-[9px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                    MATCH: {prod.match}%
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">{prod.brand}</span>
                    <div className="flex items-center gap-1 text-amber-500">
                      <span className="material-symbols-outlined text-sm font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="text-[10px] font-bold">{prod.rating}</span>
                    </div>
                  </div>
                  <h3 className="font-display text-sm font-bold text-on-surface group-hover:text-primary transition-colors leading-tight">{prod.name}</h3>
                  <p className="text-[9px] text-on-surface-variant font-semibold mt-1">Suitable For: {prod.suitableFor}</p>
                </div>

                {/* Key ingredients list tags */}
                <div className="flex flex-wrap gap-1 mt-4">
                  {prod.ingredients.map((ing, i) => (
                    <span key={i} className="text-[8px] font-bold bg-surface-container-high dark:bg-zinc-800 text-on-surface-variant px-2 py-0.5 rounded-md">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-outline-variant/10 flex justify-between items-center">
                <span className="text-sm font-display font-bold text-primary">₹{prod.price.toLocaleString('en-IN')}</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => toggleSave(prod.id)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      isSaved 
                        ? 'bg-rose-500/10 border-rose-500 text-rose-500' 
                        : 'border-outline-variant/30 hover:bg-rose-500/5 text-on-surface-variant hover:text-rose-500'
                    }`}
                    title={isSaved ? "Saved" : "Save product"}
                  >
                    <span className="material-symbols-outlined text-sm leading-none" style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                  </button>
                  <button 
                    onClick={() => addToCart(prod)}
                    className="px-4 py-2 bg-gradient-to-r from-primary to-primary-container text-white text-[10px] font-bold rounded-xl shadow-md hover:opacity-90 active:scale-95 transition-transform cursor-pointer"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filteredProducts.length === 0 && (
          <div className="col-span-3 text-center py-20 bg-surface-container-low/40 rounded-2xl border border-dashed border-outline-variant/30 text-xs text-on-surface-variant font-medium">
            No products match your active filters. Try extending the budget limit slider.
          </div>
        )}
      </div>

      {/* BACKDROP BLUR OVERLAY FOR DRAWER */}
      {isCartOpen && (
        <div 
          onClick={() => { if (!isProcessingPayment) setIsCartOpen(false); }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-all duration-300 animate-in fade-in"
        ></div>
      )}

      {/* SHOPPING CART / DELIVERY / PAYMENT SLIDING DRAWER */}
      <div className={`fixed top-0 right-0 z-50 h-screen w-full max-w-md bg-surface-bright dark:bg-zinc-900 border-l border-outline-variant/35 shadow-2xl flex flex-col justify-between p-6 transition-transform duration-300 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Drawer Header */}
        <div className="flex justify-between items-center pb-4 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">shopping_bag</span>
            <h3 className="font-display text-sm font-bold text-on-surface uppercase tracking-wider">
              {checkoutStep === 'cart' && "Your Skincare Cart"}
              {checkoutStep === 'delivery' && "Delivery Address"}
              {checkoutStep === 'payment' && "Secure Checkout"}
              {checkoutStep === 'success' && "Order Confirmed!"}
            </h3>
          </div>
          {checkoutStep !== 'success' && (
            <button 
              onClick={() => setIsCartOpen(false)}
              disabled={isProcessingPayment}
              className="text-on-surface-variant hover:text-on-surface p-1 hover:bg-primary/5 rounded-full cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          )}
        </div>

        {/* Drawer Body (Steps) */}
        <div className="flex-1 overflow-y-auto py-4">
          
          {/* STEP 1: CART LIST */}
          {checkoutStep === 'cart' && (
            <div className="space-y-4 h-full flex flex-col justify-between">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-20 space-y-4">
                  <span className="material-symbols-outlined text-5xl text-on-surface-variant/40">shopping_cart_off</span>
                  <p className="text-xs text-on-surface-variant font-medium">Your shopping cart is currently empty.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex gap-3 bg-surface-container-low dark:bg-zinc-800/40 p-3 rounded-xl border border-outline-variant/10">
                      <img 
                        src={item.product.image} 
                        className="w-14 h-14 rounded-lg object-cover" 
                        alt={item.product.name}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-on-surface truncate leading-tight">{item.product.name}</h4>
                        <p className="text-[9px] text-on-surface-variant">{item.product.brand}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs font-bold text-primary">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
                          <div className="flex items-center border border-outline-variant/30 rounded-lg bg-surface">
                            <button 
                              onClick={() => updateQuantity(item.product.id, -1)}
                              className="px-2 py-0.5 text-xs hover:bg-primary/5 font-bold cursor-pointer"
                            >
                              -
                            </button>
                            <span className="px-2.5 text-[10px] font-bold text-on-surface">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.product.id, 1)}
                              className="px-2 py-0.5 text-xs hover:bg-primary/5 font-bold cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-on-surface-variant hover:text-error shrink-0 self-start"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: DELIVERY DETAILS */}
          {checkoutStep === 'delivery' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-wider ml-1">Full Name</label>
                  <input 
                    type="text" 
                    value={shippingAddress.name}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                    className="w-full py-2.5 px-3 bg-surface-container-low dark:bg-zinc-800 border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:ring-0 focus:outline-none"
                    placeholder="Full Name"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-wider ml-1">Phone Number</label>
                  <input 
                    type="tel" 
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    className="w-full py-2.5 px-3 bg-surface-container-low dark:bg-zinc-800 border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:ring-0 focus:outline-none"
                    placeholder="Phone"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-wider ml-1">Delivery Address</label>
                  <textarea 
                    rows={3}
                    value={shippingAddress.address}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                    className="w-full py-2.5 px-3 bg-surface-container-low dark:bg-zinc-800 border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:ring-0 focus:outline-none resize-none"
                    placeholder="Address Details"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-wider ml-1">City</label>
                    <input 
                      type="text" 
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      className="w-full py-2.5 px-3 bg-surface-container-low dark:bg-zinc-800 border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:ring-0 focus:outline-none"
                      placeholder="City"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-wider ml-1">Pincode</label>
                    <input 
                      type="text" 
                      value={shippingAddress.pincode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                      className="w-full py-2.5 px-3 bg-surface-container-low dark:bg-zinc-800 border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:ring-0 focus:outline-none"
                      placeholder="Pincode"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT GATEWAY */}
          {checkoutStep === 'payment' && (
            <form onSubmit={handlePaySubmit} className="space-y-5">
              {/* Payment selection tabs */}
              <div className="grid grid-cols-3 gap-2 bg-surface-container-low dark:bg-zinc-800/40 p-1 rounded-xl border border-outline-variant/10">
                <button 
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`py-2 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${paymentMethod === 'card' ? 'bg-primary text-white shadow' : 'text-on-surface-variant hover:bg-primary/5'}`}
                >
                  Card
                </button>
                <button 
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`py-2 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${paymentMethod === 'upi' ? 'bg-primary text-white shadow' : 'text-on-surface-variant hover:bg-primary/5'}`}
                >
                  UPI
                </button>
                <button 
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`py-2 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${paymentMethod === 'cod' ? 'bg-primary text-white shadow' : 'text-on-surface-variant hover:bg-primary/5'}`}
                >
                  COD
                </button>
              </div>

              {/* CARD GATEWAY FIELDS */}
              {paymentMethod === 'card' && (
                <div className="space-y-3 bg-surface-container-low/50 dark:bg-zinc-800/20 p-4 rounded-xl border border-outline-variant/10 relative overflow-hidden">
                  <div className="absolute top-2 right-2 flex gap-1 opacity-20">
                    <span className="material-symbols-outlined text-3xl">credit_card</span>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[8px] font-bold text-on-surface-variant uppercase tracking-wider">Card Number</label>
                    <input 
                      type="text" 
                      placeholder="4000 1234 5678 9010"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                      className="w-full py-2.5 px-3 bg-surface border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:ring-0 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[8px] font-bold text-on-surface-variant uppercase tracking-wider">Expiry</label>
                      <input 
                        type="text" 
                        placeholder="MM/YY"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                        className="w-full py-2.5 px-3 bg-surface border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:ring-0 focus:outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[8px] font-bold text-on-surface-variant uppercase tracking-wider">CVV</label>
                      <input 
                        type="password" 
                        placeholder="•••"
                        maxLength={3}
                        value={cardDetails.cvc}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                        className="w-full py-2.5 px-3 bg-surface border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:ring-0 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* UPI GATEWAY FIELDS */}
              {paymentMethod === 'upi' && (
                <div className="space-y-3 bg-surface-container-low/50 dark:bg-zinc-800/20 p-4 rounded-xl border border-outline-variant/10">
                  <div className="space-y-1">
                    <label className="block text-[8px] font-bold text-on-surface-variant uppercase tracking-wider">UPI Address ID</label>
                    <input 
                      type="text" 
                      placeholder="elena@okaxis"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full py-2.5 px-3 bg-surface border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:ring-0 focus:outline-none"
                      required
                    />
                    <p className="text-[8px] text-on-surface-variant mt-1 leading-normal">Enter your UPI ID to trigger a payment request on your UPI app.</p>
                  </div>
                </div>
              )}

              {/* CASH ON DELIVERY DETAILS */}
              {paymentMethod === 'cod' && (
                <div className="space-y-3 bg-surface-container-low/50 dark:bg-zinc-800/20 p-4 rounded-xl border border-outline-variant/10">
                  <p className="text-[10px] text-on-surface-variant leading-relaxed">
                    Pay with Cash or UPI upon clinical parcel delivery. An OTP verification is triggered on your registered phone.
                  </p>
                </div>
              )}

              {/* Processing Payment Overlay */}
              {isProcessingPayment && (
                <div className="absolute inset-0 bg-white/80 dark:bg-zinc-950/80 z-30 flex flex-col items-center justify-center text-center p-6 backdrop-blur-sm">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                  <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider animate-pulse">Securing transaction...</h4>
                  <p className="text-[9px] text-on-surface-variant mt-1.5">Processing secure payment gateway protocols</p>
                </div>
              )}

              <button 
                type="submit"
                className="hidden" 
                id="hidden-pay-button" 
              />
            </form>
          )}

          {/* STEP 4: SUCCESS CONFIRMATION */}
          {checkoutStep === 'success' && (
            <div className="flex flex-col items-center justify-center text-center py-10 space-y-6">
              {/* Success Tick */}
              <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500 rounded-full flex items-center justify-center text-emerald-500 animate-bounce">
                <span className="material-symbols-outlined text-4xl font-bold">check</span>
              </div>

              <div className="space-y-2">
                <h3 className="font-display text-base font-bold text-on-surface uppercase tracking-wider">Order Dispatched!</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed px-4">
                  Thank you, Elena! Your clinical routine formulation request has been processed successfully.
                </p>
              </div>

              <div className="bg-surface-container-low dark:bg-zinc-800/30 border border-outline-variant/10 p-4 rounded-xl w-full text-left space-y-2.5">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-on-surface-variant">ORDER ID:</span>
                  <span className="text-primary font-display">{orderId}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-on-surface-variant">DELIVERY TO:</span>
                  <span className="text-on-surface">{shippingAddress.city}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-on-surface-variant">ARRIVAL DATE:</span>
                  <span className="text-emerald-500">In 3 Business Days</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Drawer Footer Actions */}
        <div className="pt-4 border-t border-outline-variant/20 space-y-4">
          
          {checkoutStep !== 'success' && (
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-on-surface-variant">TOTAL VALUE:</span>
              <span className="text-lg font-display font-bold text-primary">₹{getCartTotal().toLocaleString('en-IN')}</span>
            </div>
          )}

          {checkoutStep === 'cart' && (
            <button 
              onClick={() => setCheckoutStep('delivery')}
              disabled={cart.length === 0}
              className="w-full py-3 bg-gradient-to-r from-primary to-primary-container text-white text-xs font-bold rounded-xl shadow-lg active:scale-95 hover:opacity-95 transition-all disabled:opacity-50 disabled:scale-100 cursor-pointer flex items-center justify-center gap-2"
            >
              Proceed to Delivery <span className="material-symbols-outlined text-sm leading-none">arrow_forward</span>
            </button>
          )}

          {checkoutStep === 'delivery' && (
            <div className="flex gap-3">
              <button 
                onClick={() => setCheckoutStep('cart')}
                className="px-4 py-3 border border-outline-variant/30 hover:bg-primary/5 text-on-surface text-xs font-bold rounded-xl cursor-pointer"
              >
                Back
              </button>
              <button 
                onClick={() => setCheckoutStep('payment')}
                className="flex-1 py-3 bg-gradient-to-r from-primary to-primary-container text-white text-xs font-bold rounded-xl shadow-lg active:scale-95 hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                Proceed to Payment <span className="material-symbols-outlined text-sm leading-none">arrow_forward</span>
              </button>
            </div>
          )}

          {checkoutStep === 'payment' && (
            <div className="flex gap-3">
              <button 
                onClick={() => setCheckoutStep('delivery')}
                disabled={isProcessingPayment}
                className="px-4 py-3 border border-outline-variant/30 hover:bg-primary/5 text-on-surface text-xs font-bold rounded-xl cursor-pointer disabled:opacity-50"
              >
                Back
              </button>
              <button 
                onClick={() => document.getElementById('hidden-pay-button')?.click()}
                disabled={isProcessingPayment}
                className="flex-1 py-3 bg-gradient-to-r from-primary to-primary-container text-white text-xs font-bold rounded-xl shadow-lg active:scale-95 hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
              >
                Pay Now ₹{getCartTotal().toLocaleString('en-IN')}
              </button>
            </div>
          )}

          {checkoutStep === 'success' && (
            <button 
              onClick={() => setIsCartOpen(false)}
              className="w-full py-3 bg-gradient-to-r from-primary to-primary-container text-white text-xs font-bold rounded-xl shadow-lg active:scale-95 hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              Continue Browsing
            </button>
          )}

        </div>

      </div>

    </div>
  );
};
