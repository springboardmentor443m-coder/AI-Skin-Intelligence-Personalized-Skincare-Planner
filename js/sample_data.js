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
            targetSkinTypes: ['Oily', 'Blemish-Prone', 'Combination'],
            targetAgeGroups: ['18-25', '26-39'],
            ageNote: 'Deep pore cleanser dissolving sebum without stripping natural lipids',
            keyIngredients: ['Salicylic Acid (2%)', 'Niacinamide', 'Zinc PCA'],
            baseMatch: 82,
            tags: ['Cruelty-Free', 'Fragrance-Free', 'Non-Comedogenic']
        },
        {
            id: 'p2',
            name: 'HydraBarrier Triple Ceramide Cream',
            brand: 'CeraCare Botanicals',
            category: 'Moisturizer',
            price: 36.00,
            targetConcerns: ['dryness', 'redness'],
            targetSkinTypes: ['Dry', 'Sensitive', 'Normal', 'Combination'],
            targetAgeGroups: ['26-39', '40-54', '55+'],
            ageNote: 'Rich moisture barrier replenishment for dry & delicate skin',
            keyIngredients: ['Ceramides NP/AP/EOP', 'Hyaluronic Acid', 'Squalane'],
            baseMatch: 85,
            tags: ['Barrier Repair', 'Dermatologist Tested', 'Hypoallergenic']
        },
        {
            id: 'p3',
            name: 'GlowBright Radiance Antioxidant Serum',
            brand: 'Apothecary Skin',
            category: 'Serum',
            price: 48.00,
            targetConcerns: ['hyperpigmentation', 'wrinkles'],
            targetSkinTypes: ['Combination', 'Normal', 'Dry'],
            targetAgeGroups: ['18-25', '26-39', '40-54'],
            ageNote: 'Brightening 15% Vitamin C antioxidant serum for sun marks & radiant tone',
            keyIngredients: ['L-Ascorbic Acid (15%)', 'Ferulic Acid', 'Vitamin E'],
            baseMatch: 84,
            tags: ['Brightening', 'Antioxidant Defense']
        },
        {
            id: 'p4',
            name: 'RetinoLift Gentle Night Renewal Elixir',
            brand: 'Dermatica Gentle Care',
            category: 'Serum',
            price: 54.00,
            targetConcerns: ['wrinkles', 'hyperpigmentation', 'acne'],
            targetSkinTypes: ['Mature', 'Combination', 'Normal'],
            targetAgeGroups: ['26-39', '40-54', '55+'],
            ageNote: 'Targeted encapsulated retinol renewal & collagen support for 26+ skin',
            keyIngredients: ['Encapsulated Retinol (0.5%)', 'Peptides', 'Niacinamide'],
            baseMatch: 86,
            tags: ['Overnight Renewal', 'Collagen Booster']
        },
        {
            id: 'p5',
            name: 'Soothing Invisible Mineral Fluid SPF 50+',
            brand: 'SunCare Botanicals',
            category: 'Sun Protection',
            price: 32.00,
            targetConcerns: ['hyperpigmentation', 'redness', 'wrinkles'],
            targetSkinTypes: ['Sensitive', 'Dry', 'Combination', 'Oily', 'Normal'],
            targetAgeGroups: ['18-25', '26-39', '40-54', '55+'],
            ageNote: 'Non-comedogenic broad spectrum SPF 50 essential for all skin types',
            keyIngredients: ['Zinc Oxide (18%)', 'Panthenol', 'Ectoin'],
            baseMatch: 88,
            tags: ['Broad Spectrum SPF 50', 'Reef Safe', 'Invisible Finish']
        },
        {
            id: 'p6',
            name: 'PeptideFirm Deep Lipid Recovery Balm',
            brand: 'Cellular Vitality Labs',
            category: 'Moisturizer',
            price: 62.00,
            targetConcerns: ['wrinkles', 'dryness'],
            targetSkinTypes: ['Dry', 'Mature', 'Sensitive'],
            targetAgeGroups: ['40-54', '55+'],
            ageNote: 'Intensive lipid recovery & copper peptide firming for mature dry skin',
            keyIngredients: ['Copper Tripeptide-1', 'Ceramide EOP', 'Shea Butter', 'Squalane'],
            baseMatch: 88,
            tags: ['Mature Barrier Support', 'Intensive Lipid Care']
        },
        {
            id: 'p7',
            name: 'CicaSoothe Calming Cleansing Foam',
            brand: 'PurePhyto Care',
            category: 'Cleanser',
            price: 22.00,
            targetConcerns: ['redness', 'dryness'],
            targetSkinTypes: ['Sensitive', 'Dry', 'Combination'],
            targetAgeGroups: ['18-25', '26-39', '40-54', '55+'],
            ageNote: 'Ultra-gentle pH-balanced cleanser designed for reactive & sensitive skin',
            keyIngredients: ['Centella Asiatica', 'Panthenol B5', 'Madecassoside'],
            baseMatch: 85,
            tags: ['Calming', 'Fragrance-Free', 'Barrier Mild']
        },
        {
            id: 'p8',
            name: 'Niacinamide 10% + Zinc PCA Sebum Gel',
            brand: 'LumiClear Labs',
            category: 'Serum',
            price: 29.00,
            targetConcerns: ['oily_pores', 'acne', 'redness'],
            targetSkinTypes: ['Oily', 'Blemish-Prone', 'Combination'],
            targetAgeGroups: ['18-25', '26-39'],
            ageNote: 'Pore-tightening sebum regulation gel for oily & blemish-prone complexions',
            keyIngredients: ['Niacinamide (10%)', 'Zinc PCA (1%)', 'Willow Bark'],
            baseMatch: 86,
            tags: ['Pore Refining', 'Shine Control']
        },
        {
            id: 'p9',
            name: 'HydraLight Oil-Free Water Cream Gel',
            brand: 'Pure Botanical Care',
            category: 'Moisturizer',
            price: 30.00,
            targetConcerns: ['oily_pores', 'acne'],
            targetSkinTypes: ['Oily', 'Blemish-Prone', 'Combination'],
            targetAgeGroups: ['18-25', '26-39'],
            ageNote: 'Weightless oil-free hydration gel that won\'t clog pores',
            keyIngredients: ['Hyaluronic Acid', 'Aloe Vera', 'Niacinamide'],
            baseMatch: 84,
            tags: ['Oil-Free', 'Weightless Moisture']
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
            scores: { condition: 74, lifestyle: 82, sleep: 80, routine: 85, hydration: 75 },
            clinicalNote: 'Patient exhibits localized cheek redness and occasional adult acne flareups. Recommended treatment includes gentle Cica wash, 5% Niacinamide serum, and daily SPF 50.'
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
            scores: { condition: 58, lifestyle: 60, sleep: 65, routine: 70, hydration: 60 },
            clinicalNote: 'Excessive T-zone sebum secretion with visible pore congestion. Prescribed 2% BHA clarifying cleanser morning, Niacinamide + Zinc gel evening, and non-comedogenic mineral SPF.'
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
            scores: { condition: 82, lifestyle: 90, sleep: 88, routine: 92, hydration: 90 },
            clinicalNote: 'Periorbital fine lines and stratum corneum lipid depletion. Prescribed Triple Ceramide cream, Encapsulated Retinol 0.5% (3x/week evening), and Copper Peptide lipid recovery balm.'
        }
    ]
};
