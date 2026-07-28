/**
 * Skin Intelligence & Personalized Skincare Planner
 * Humanized Care Data Sources & Sample Catalog
 */

window.SKIN_DATA = {
    // 6 Target Classes for Image Analysis
    CONCERN_CLASSES: [
        {
            id: 'acne',
            name: 'Blemishes & Breakouts',
            color: '#ef4444',
            description: 'Active spots, papules, and localized skin redness.',
            commonTreatments: ['Salicylic Acid', 'Niacinamide', 'Azelaic Acid'],
            severityLevels: ['Calm', 'Mild Concern', 'Needs Gentle Care']
        },
        {
            id: 'hyperpigmentation',
            name: 'Dark Spots & Sun Marks',
            color: '#f59e0b',
            description: 'Melanin spots, post-blemish marks, and uneven tone.',
            commonTreatments: ['Vitamin C', 'Alpha Arbutin', 'Niacinamide'],
            severityLevels: ['Faint Discoloration', 'Noticeable Spots', 'Widespread Tone Care']
        },
        {
            id: 'wrinkles',
            name: 'Fine Lines & Expression Creases',
            color: '#8b5cf6',
            description: 'Dehydration lines, crow\'s feet, and delicate micro-folds.',
            commonTreatments: ['Encapsulated Retinol', 'Peptides', 'Hyaluronic Acid'],
            severityLevels: ['Superficial Lines', 'Moderate Lines', 'Deep Crease Care']
        },
        {
            id: 'redness',
            name: 'Redness & Sensitivity',
            color: '#ec4899',
            description: 'Flushing, delicate capillaries, and skin barrier sensitivity.',
            commonTreatments: ['Centella Asiatica (Cica)', 'Panthenol (B5)', 'Ceramides'],
            severityLevels: ['Mild Flushing', 'Localized Redness', 'Sensitive Barrier']
        },
        {
            id: 'oily_pores',
            name: 'Sebum Balance & Visible Pores',
            color: '#10b981',
            description: 'Natural oil shine and T-zone pore clarity.',
            commonTreatments: ['Niacinamide', 'Salicylic Acid', 'Zinc PCA'],
            severityLevels: ['Balanced T-Zone', 'Moderate Shine', 'High Sebum Care']
        },
        {
            id: 'dryness',
            name: 'Dryness & Moisture Barrier',
            color: '#3b82f6',
            description: 'Skin tightness, dry surface flakes, and lipid barrier hydration.',
            commonTreatments: ['Hyaluronic Acid', 'Triple Ceramides', 'Squalane'],
            severityLevels: ['Mild Tightness', 'Noticeable Dryness', 'Dehydrated Barrier']
        }
    ],

    // Ingredient Intelligence Database
    INGREDIENTS: [
        {
            name: 'Retinol / Retinoids',
            category: 'Retinoids',
            functions: ['Cell Renewal', 'Collagen Support', 'Blemish Care', 'Fine Line Smoothing'],
            suitableFor: ['wrinkles', 'acne', 'hyperpigmentation'],
            conflicts: ['AHAs/BHAs (same ritual)', 'Pure Vitamin C (L-Ascorbic Acid)'],
            caution: 'Apply during evening ritual only and pair with daily SPF 50.',
            rating: 4.9
        },
        {
            name: 'Niacinamide (Vitamin B3)',
            category: 'Niacinamide',
            functions: ['Sebum Harmony', 'Barrier Repair', 'Calming Redness', 'Even Tone'],
            suitableFor: ['oily_pores', 'redness', 'hyperpigmentation', 'acne'],
            conflicts: [],
            caution: 'Gentle and well-tolerated by most skin profiles.',
            rating: 4.8
        },
        {
            name: 'Vitamin C (L-Ascorbic Acid)',
            category: 'Vitamin C',
            functions: ['Antioxidant Protection', 'Radiance', 'Brightening', 'Sun Damage Defense'],
            suitableFor: ['hyperpigmentation', 'wrinkles'],
            conflicts: ['Retinol (same ritual)', 'High-strength acids'],
            caution: 'Apply morning ritual before sunscreen. Store in a cool, dark place.',
            rating: 4.7
        },
        {
            name: 'Hyaluronic Acid',
            category: 'Hyaluronic Acid',
            functions: ['Deep Hydration', 'Plumping Moisture', 'Barrier Softening'],
            suitableFor: ['dryness', 'wrinkles'],
            conflicts: [],
            caution: 'Apply to damp skin for maximum moisture plumping.',
            rating: 4.9
        },
        {
            name: 'Salicylic Acid (BHA)',
            category: 'AHAs/BHAs',
            functions: ['Pore Clearing', 'Gentle Exfoliation', 'Sebum Balance'],
            suitableFor: ['acne', 'oily_pores'],
            conflicts: ['Retinol', 'Strong Vitamin C'],
            caution: 'Use 2-3 times weekly and follow with a soothing moisturizer.',
            rating: 4.7
        },
        {
            name: 'Ceramides NP/AP/EOP',
            category: 'Ceramides',
            functions: ['Barrier Nourishment', 'Moisture Locking', 'Skin Soothing'],
            suitableFor: ['dryness', 'redness'],
            conflicts: [],
            caution: 'Essential for sensitive or compromised skin barriers.',
            rating: 4.9
        }
    ],

    // Product Database
    PRODUCTS: [
        {
            id: 'p1',
            name: 'LumiClear Gentle Clarifying Wash',
            brand: 'Pure Botanical Care',
            category: 'Cleansing',
            price: 24.00,
            targetConcerns: ['acne', 'oily_pores'],
            keyIngredients: ['Salicylic Acid (2%)', 'Niacinamide', 'Zinc PCA'],
            suitabilityScore: 94,
            rating: 4.8,
            image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&auto=format&fit=crop&q=60'
        },
        {
            id: 'p2',
            name: 'HydraBarrier Triple Ceramide Cream',
            brand: 'CeraCare Botanicals',
            category: 'Moisturizing',
            price: 36.00,
            targetConcerns: ['dryness', 'redness'],
            keyIngredients: ['Ceramides', 'Hyaluronic Acid', 'Squalane', 'Centella'],
            suitabilityScore: 98,
            rating: 4.9,
            image: 'https://images.unsplash.com/photo-1608248597260-244e45c7e14a?w=300&auto=format&fit=crop&q=60'
        },
        {
            id: 'p3',
            name: 'GlowBright Radiance Antioxidant Serum',
            brand: 'Apothecary Skin',
            category: 'Treatment',
            price: 48.00,
            targetConcerns: ['hyperpigmentation', 'wrinkles'],
            keyIngredients: ['L-Ascorbic Acid (15%)', 'Ferulic Acid', 'Vitamin E'],
            suitabilityScore: 91,
            rating: 4.7,
            image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&auto=format&fit=crop&q=60'
        },
        {
            id: 'p4',
            name: 'RetinoLift Gentle Night Renewal Elixir',
            brand: 'Dermatica Gentle Care',
            category: 'Evening Care',
            price: 54.00,
            targetConcerns: ['wrinkles', 'hyperpigmentation', 'acne'],
            keyIngredients: ['Encapsulated Retinol (0.5%)', 'Peptides', 'Niacinamide'],
            suitabilityScore: 89,
            rating: 4.8,
            image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=300&auto=format&fit=crop&q=60'
        },
        {
            id: 'p5',
            name: 'Soothing Invisible Mineral Fluid SPF 50+',
            brand: 'SunCare Botanicals',
            category: 'Sun Protection',
            price: 32.00,
            targetConcerns: ['hyperpigmentation', 'redness', 'wrinkles'],
            keyIngredients: ['Zinc Oxide (18%)', 'Panthenol', 'Ectoin'],
            suitabilityScore: 96,
            rating: 4.9,
            image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=300&auto=format&fit=crop&q=60'
        },
        {
            id: 'p6',
            name: 'CicaSoothe Calming Essence Toner',
            brand: 'PurePhyto Care',
            category: 'Toner',
            price: 22.00,
            targetConcerns: ['redness', 'dryness'],
            keyIngredients: ['Centella Asiatica', 'Madecassoside', 'Green Tea Extract'],
            suitabilityScore: 92,
            rating: 4.7,
            image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=300&auto=format&fit=crop&q=60'
        }
    ],

    CLIENT_PROFILES: [
        {
            id: 'usr_101',
            name: 'Sophia Chen',
            age: 28,
            role: 'User',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            skinType: 'Combination / Sensitive',
            overallScore: 78,
            primaryConcerns: ['acne', 'redness'],
            lastScanDate: '2026-07-26',
            lifestyle: { sleepHours: 7.5, waterLiters: 2.2, sunExposure: 'Moderate', stressLevel: 'Medium' },
            scores: { condition: 74, lifestyle: 82, sleep: 80, routine: 85, hydration: 75 }
        },
        {
            id: 'usr_102',
            name: 'Marcus Vance',
            age: 35,
            role: 'User',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            skinType: 'Oily / Blemish-Prone',
            overallScore: 65,
            primaryConcerns: ['oily_pores', 'acne', 'hyperpigmentation'],
            lastScanDate: '2026-07-27',
            lifestyle: { sleepHours: 6.0, waterLiters: 1.5, sunExposure: 'High', stressLevel: 'High' },
            scores: { condition: 58, lifestyle: 60, sleep: 65, routine: 70, hydration: 60 }
        },
        {
            id: 'usr_103',
            name: 'Elena Rostova',
            age: 42,
            role: 'User',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
            skinType: 'Dry / Mature',
            overallScore: 84,
            primaryConcerns: ['wrinkles', 'dryness', 'hyperpigmentation'],
            lastScanDate: '2026-07-28',
            lifestyle: { sleepHours: 8.0, waterLiters: 2.8, sunExposure: 'Low', stressLevel: 'Low' },
            scores: { condition: 82, lifestyle: 90, sleep: 88, routine: 92, hydration: 90 }
        }
    ]
};
