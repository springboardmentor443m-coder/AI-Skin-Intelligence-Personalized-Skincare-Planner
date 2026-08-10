export const INGREDIENT_DATABASE = {
  'Salicylic Acid': {
    name: 'Salicylic Acid (BHA)',
    activePercentage: '2% Beta Hydroxy Acid',
    whyRecommended: 'Penetrates deep into pores to dissolve trapped sebum, dead skin cells, and blackheads.',
    suitableFor: ['Oily Skin', 'Acne-Prone', 'Combination Skin', 'Enlarged Pores'],
    avoidIf: ['Hypersensitive to Aspirin', 'Severely Compromised Barrier', 'Active Open Wounds'],
    sideEffects: 'Mild dryness, temporary purging, slight tingling on application.',
    bestTimeToUse: 'Night routine (or Morning routine followed by SPF 30+)',
    scientificExplanation: 'Salicylic acid is lipid-soluble, allowing it to penetrate through sebum into hair follicles where it breaks desmosomal bonds holding dead keratinocytes together, clearing comedones from within.'
  },
  'Niacinamide': {
    name: 'Niacinamide (Vitamin B3)',
    activePercentage: '5% - 10% Nicotinamide',
    whyRecommended: 'Strengthens the skin barrier, reduces sebum overproduction, and fades post-acne dark marks.',
    suitableFor: ['All Skin Types', 'Sensitive Skin', 'Oily & Acne-Prone', 'Redness-Prone'],
    avoidIf: ['Known rare allergy to Vitamin B3', 'High 15%+ irritant concentrations'],
    sideEffects: 'Rare mild flushing or transient tingling if combined with low pH acids.',
    bestTimeToUse: 'Morning & Night routines',
    scientificExplanation: 'Niacinamide increases ceramide and free fatty acid synthesis in the stratum corneum, accelerating epidermal barrier repair while inhibiting melanosome transfer from melanocytes to keratinocytes.'
  },
  'Hyaluronic Acid': {
    name: 'Hyaluronic Acid',
    activePercentage: 'Multi-Molecular Weight Sodium Hyaluronate',
    whyRecommended: 'Attracts and binds up to 1000x its weight in water to deeply hydrate and plump dehydrated skin.',
    suitableFor: ['Dry Skin', 'Dehydrated Skin', 'Sensitive Skin', 'Aging Skin'],
    avoidIf: ['Applying to bone-dry skin in extremely dry arid climates without seal coat'],
    sideEffects: 'None; naturally occurring biocompatible molecule.',
    bestTimeToUse: 'Morning & Night under moisturizer',
    scientificExplanation: 'A hydrophilic glycosaminoglycan polymer that holds moisture in the extracellular matrix, restoring skin turgor and reinforcing intercellular hydration networks.'
  },
  'Ceramides': {
    name: 'Ceramides (NP, AP, EOP)',
    activePercentage: 'Essential Lipid Complex',
    whyRecommended: 'Replenishes missing lipid matrix to repair damaged skin barriers and lock in moisture.',
    suitableFor: ['Dry & Flaky Skin', 'Eczema & Dermatitis', 'Sensitive Skin', 'Post-Treatment'],
    avoidIf: ['None known'],
    sideEffects: 'None',
    bestTimeToUse: 'Morning & Night',
    scientificExplanation: 'Ceramides comprise ~50% of the stratum corneum lipid layer. Topical bio-identical ceramides integrate directly into intercellular lipid lamellae to restore skin barrier integrity.'
  },
  'Benzoyl Peroxide': {
    name: 'Benzoyl Peroxide',
    activePercentage: '2.5% - 5% Micronized Benzoyl Peroxide',
    whyRecommended: 'Potent antibacterial agent that kills acne-causing Cutibacterium acnes bacteria.',
    suitableFor: ['Inflammatory Acne', 'Pustules & Red Bumps'],
    avoidIf: ['Severe Eczema', 'Hypersensitive Rosacea', 'Fabric Contact (causes bleaching)'],
    sideEffects: 'Initial peeling, dryness, mild redness, bleaching of pillowcases/towels.',
    bestTimeToUse: 'Night routine',
    scientificExplanation: 'Decomposes to release free oxygen radicals within hair follicle ducts, oxidatively destroying C. acnes anaerobic bacteria without causing bacterial antibiotic resistance.'
  },
  'Adapalene': {
    name: 'Adapalene / Retinoids',
    activePercentage: '0.1% Adapalene / Retinoid Derivative',
    whyRecommended: 'Normalizes skin cell turnover, prevents pore clogging, and smooths rough texture.',
    suitableFor: ['Persistent Acne', 'Clogged Pores', 'Fine Lines & Photo-Aging'],
    avoidIf: ['Pregnancy or Nursing', 'Severe Sunburn', 'Active Eczema Flares'],
    sideEffects: 'Retinization phase: flaking, dryness, temporary sensitivity during first 2-4 weeks.',
    bestTimeToUse: 'Night routine only (Mandatory Broad-Spectrum Sunscreen during day)',
    scientificExplanation: 'Binds selectively to nuclear retinoic acid receptors (RAR-beta and RAR-gamma) to modulate cell differentiation and decrease follicular microcomedone formation.'
  },
  'Vitamin C': {
    name: 'Vitamin C (L-Ascorbic Acid)',
    activePercentage: '10% - 15% Pure L-Ascorbic Acid',
    whyRecommended: 'Neutralizes free radical environmental damage, boosts collagen, and brightens dark spots.',
    suitableFor: ['Dull Skin', 'Hyperpigmentation & Sun Damage', 'Aging Prevention'],
    avoidIf: ['Active Broken Barrier', 'Severe Inflammatory Rosacea'],
    sideEffects: 'Tingling, mild temporary redness on sensitive skin.',
    bestTimeToUse: 'Morning routine before Sunscreen',
    scientificExplanation: 'Potent antioxidant that donates electrons to neutralize reactive oxygen species (ROS) generated by UV radiation and inhibits tyrosinase enzyme activity.'
  },
  'Azelaic Acid': {
    name: 'Azelaic Acid',
    activePercentage: '10% Dicarboxylic Acid',
    whyRecommended: 'Reduces inflammatory bumps, calms rosacea redness, and fades stubborn hyperpigmentation.',
    suitableFor: ['Rosacea', 'Post-Acne Dark Spots', 'Sensitive Acne-Prone Skin'],
    avoidIf: ['Known allergy to dicarboxylic acids'],
    sideEffects: 'Transient mild itching or tickling sensation upon application.',
    bestTimeToUse: 'Morning or Night routine',
    scientificExplanation: 'Inhibits cellular thioredoxin reductase and 5-alpha-reductase, exerting anti-inflammatory, antibacterial, and selective anti-melanogenic effects.'
  }
}

export function getIngredientDetail(ingredientName) {
  if (!ingredientName) return null
  const cleanName = ingredientName.trim()
  
  // Exact match
  if (INGREDIENT_DATABASE[cleanName]) {
    return INGREDIENT_DATABASE[cleanName]
  }

  // Partial match search
  const foundKey = Object.keys(INGREDIENT_DATABASE).find(key => 
    cleanName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(cleanName.toLowerCase())
  )

  if (foundKey) {
    return INGREDIENT_DATABASE[foundKey]
  }

  // Fallback template for custom active ingredients
  return {
    name: cleanName,
    activePercentage: 'Clinical Formula',
    whyRecommended: `Formulated to support healthy skin function and target ${cleanName.toLowerCase()} concerns.`,
    suitableFor: ['All Skin Types', 'Targeted Treatment'],
    avoidIf: ['Known sensitivity to active formulation'],
    sideEffects: 'Mild localized skin adaptation period possible.',
    bestTimeToUse: 'Daily routine as directed',
    scientificExplanation: `Biological active agent designed to penetrate target epidermal layers and enhance cellular recovery.`
  }
}
