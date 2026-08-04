/**
 * Skin Intelligence & Personalized Skincare Planner
 * Extended Product Catalog & Category Taxonomy
 */

window.SKIN_DATA = {
    AGE_GROUPS: [
        { id: '18-25', label: '18–25 (Young Adult)', focus: 'Sebum Balance & Blemish Prevention' },
        { id: '26-39', label: '26–39 (Adult)', focus: 'Antioxidant Defense & Early Fine-Line Care' },
        { id: '40-54', label: '40–54 (Mature)', focus: 'Collagen Regeneration & Elasticity' },
        { id: '55+', label: '55+ (Graceful Senior)', focus: 'Deep Barrier Lipids & Moisture Locking' }
    ],

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

    INGREDIENTS: [
        {
            name: 'Retinol / Retinoids',
            category: 'Retinoids',
            functions: ['Cell Renewal', 'Collagen Support', 'Blemish Care', 'Fine Line Smoothing'],
            suitableFor: ['wrinkles', 'acne', 'hyperpigmentation'],
            targetAgeGroups: ['26-39', '40-54', '55+'],
            conflicts: ['AHAs/BHAs (same ritual)', 'Pure Vitamin C (L-Ascorbic Acid)'],
            caution: 'Apply during evening ritual only and pair with daily SPF 50.',
            rating: 4.9
        },
        {
            name: 'Niacinamide (Vitamin B3)',
            category: 'Niacinamide',
            functions: ['Sebum Harmony', 'Barrier Repair', 'Calming Redness', 'Even Tone'],
            suitableFor: ['oily_pores', 'redness', 'hyperpigmentation', 'acne'],
            targetAgeGroups: ['18-25', '26-39', '40-54', '55+'],
            conflicts: [],
            caution: 'Gentle and well-tolerated by all age groups.',
            rating: 4.8
        },
        {
            name: 'Vitamin C (L-Ascorbic Acid)',
            category: 'Vitamin C',
            functions: ['Antioxidant Protection', 'Radiance', 'Brightening', 'Sun Damage Defense'],
            suitableFor: ['hyperpigmentation', 'wrinkles'],
            targetAgeGroups: ['18-25', '26-39', '40-54'],
            conflicts: ['Retinol (same ritual)', 'High-strength acids'],
            caution: 'Apply morning ritual before sunscreen.',
            rating: 4.7
        },
        {
            name: 'Hyaluronic Acid',
            category: 'Hyaluronic Acid',
            functions: ['Deep Hydration', 'Plumping Moisture', 'Barrier Softening'],
            suitableFor: ['dryness', 'wrinkles'],
            targetAgeGroups: ['18-25', '26-39', '40-54', '55+'],
            conflicts: [],
            caution: 'Apply to damp skin for maximum moisture plumping.',
            rating: 4.9
        },
        {
            name: 'Salicylic Acid (BHA)',
            category: 'AHAs/BHAs',
            functions: ['Pore Clearing', 'Gentle Exfoliation', 'Sebum Balance'],
            suitableFor: ['acne', 'oily_pores'],
            targetAgeGroups: ['18-25', '26-39'],
            conflicts: ['Retinol', 'Strong Vitamin C'],
            caution: 'Ideal for oily and blemish-prone young skin.',
            rating: 4.7
        },
        {
            name: 'Ceramides & Peptides',
            category: 'Ceramides',
            functions: ['Barrier Nourishment', 'Moisture Locking', 'Skin Firming'],
            suitableFor: ['dryness', 'redness', 'wrinkles'],
            targetAgeGroups: ['26-39', '40-54', '55+'],
            conflicts: [],
            caution: 'Essential for mature barrier repair and firming.',
            rating: 4.9
        }
    ],

    PRODUCTS: [
        {
            id: 'p1',
            name: 'LumiClear Gentle Clarifying Wash',
            brand: 'Pure Botanical Care',
            category: 'Cleanser',
            price: 24.00,
            targetConcerns: ['acne', 'oily_pores'],
            targetAgeGroups: ['18-25', '26-39'],
            ageNote: 'Perfect for young to adult skin managing sebum & pores',
            keyIngredients: ['Salicylic Acid (2%)', 'Niacinamide', 'Zinc PCA'],
            baseMatch: 92,
            tags: ['Cruelty-Free', 'Fragrance-Free', 'Non-Comedogenic'],
            image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&auto=format&fit=crop&q=60'
        },
        {
            id: 'p2',
            name: 'HydraBarrier Triple Ceramide Cream',
            brand: 'CeraCare Botanicals',
            category: 'Moisturizer',
            price: 36.00,
            targetConcerns: ['dryness', 'redness'],
            targetAgeGroups: ['26-39', '40-54', '55+'],
            ageNote: 'Essential moisture lipid replenishment for adult & mature skin',
            keyIngredients: ['Ceramides', 'Hyaluronic Acid', 'Squalane', 'Centella'],
            baseMatch: 95,
            tags: ['Barrier Repair', 'Dermatologist Tested', 'Hypoallergenic'],
            image: 'https://images.unsplash.com/photo-1608248597260-244e45c7e14a?w=300&auto=format&fit=crop&q=60'
        },
        {
            id: 'p3',
            name: 'GlowBright Radiance Antioxidant Serum',
            brand: 'Apothecary Skin',
            category: 'Serum',
            price: 48.00,
            targetConcerns: ['hyperpigmentation', 'wrinkles'],
            targetAgeGroups: ['18-25', '26-39', '40-54'],
            ageNote: 'Brightening antioxidant protection against premature aging',
            keyIngredients: ['L-Ascorbic Acid (15%)', 'Ferulic Acid', 'Vitamin E'],
            baseMatch: 91,
            tags: ['Brightening', 'Antioxidant Defense'],
            image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&auto=format&fit=crop&q=60'
        },
        {
            id: 'p4',
            name: 'RetinoLift Gentle Night Renewal Elixir',
            brand: 'Dermatica Gentle Care',
            category: 'Serum',
            price: 54.00,
            targetConcerns: ['wrinkles', 'hyperpigmentation', 'acne'],
            targetAgeGroups: ['26-39', '40-54', '55+'],
            ageNote: 'Targeted cell renewal & collagen support for 26+ skin',
            keyIngredients: ['Encapsulated Retinol (0.5%)', 'Peptides', 'Niacinamide'],
            baseMatch: 94,
            tags: ['Overnight Renewal', 'Collagen Booster'],
            image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=300&auto=format&fit=crop&q=60'
        },
        {
            id: 'p5',
            name: 'Soothing Invisible Mineral Fluid SPF 50+',
            brand: 'SunCare Botanicals',
            category: 'Sun Protection',
            price: 32.00,
            targetConcerns: ['hyperpigmentation', 'redness', 'wrinkles'],
            targetAgeGroups: ['18-25', '26-39', '40-54', '55+'],
            ageNote: 'Universal broad-spectrum defense essential for all age groups',
            keyIngredients: ['Zinc Oxide (18%)', 'Panthenol', 'Ectoin'],
            baseMatch: 96,
            tags: ['Broad Spectrum SPF 50', 'Reef Safe', 'Invisible Finish'],
            image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=300&auto=format&fit=crop&q=60'
        },
        {
            id: 'p6',
            name: 'PeptideFirm Deep Lipid Recovery Balm',
            brand: 'Cellular Vitality Labs',
            category: 'Moisturizer',
            price: 62.00,
            targetConcerns: ['wrinkles', 'dryness'],
            targetAgeGroups: ['40-54', '55+'],
            ageNote: 'Rich lipid recovery & peptide firming specially formulated for mature skin (40+)',
            keyIngredients: ['Copper Tripeptide-1', 'Ceramide EOP', 'Shea Butter', 'Squalane'],
            baseMatch: 97,
            tags: ['Mature Barrier Support', 'Intensive Lipid Care'],
            image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=300&auto=format&fit=crop&q=60'
        },
        {
            id: 'p7',
            name: 'CicaSoothe Barrier Relief Hydrosol Mist',
            brand: 'PurePhyto Care',
            category: 'Special Care',
            price: 26.00,
            targetConcerns: ['redness', 'dryness'],
            targetAgeGroups: ['18-25', '26-39', '40-54', '55+'],
            ageNote: 'Soothing mid-day hydration & redness calming mist for all skin profiles',
            keyIngredients: ['Centella Asiatica', 'Madecassoside', 'Green Tea Extract'],
            baseMatch: 93,
            tags: ['Soothing', 'Alcohol-Free', 'pH Balanced'],
            image: 'https://images.unsplash.com/photo-1608248597260-244e45c7e14a?w=300&auto=format&fit=crop&q=60'
        },
        {
            id: 'p8',
            name: 'Bio-Cellulose Deep Hydration Sheet Mask',
            brand: 'Apothecary Skin',
            category: 'Special Care',
            price: 28.00,
            targetConcerns: ['dryness', 'wrinkles', 'redness'],
            targetAgeGroups: ['18-25', '26-39', '40-54', '55+'],
            ageNote: 'Intensive weekly hydration treatment to replenish barrier moisture',
            keyIngredients: ['Triple Hyaluronic Acid', 'Ceramides', 'Panthenol'],
            baseMatch: 95,
            tags: ['Weekly Ritual', 'Intensive Plumping'],
            image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&auto=format&fit=crop&q=60'
        }
    ],

    CLIENT_PROFILES: [
        {
            id: 'usr_101',
            name: 'Sophia Chen',
            initials: 'SC',
            age: 28,
            ageGroup: '26-39',
            role: 'User',
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
            initials: 'MV',
            age: 35,
            ageGroup: '26-39',
            role: 'User',
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
            initials: 'ER',
            age: 48,
            ageGroup: '40-54',
            role: 'User',
            skinType: 'Dry / Mature',
            overallScore: 84,
            primaryConcerns: ['wrinkles', 'dryness', 'hyperpigmentation'],
            lastScanDate: '2026-07-28',
            lifestyle: { sleepHours: 8.0, waterLiters: 2.8, sunExposure: 'Low', stressLevel: 'Low' },
            scores: { condition: 82, lifestyle: 90, sleep: 88, routine: 92, hydration: 90 }
        }
    ]
};
