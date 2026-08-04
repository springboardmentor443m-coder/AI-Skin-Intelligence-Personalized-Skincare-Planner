/**
 * Routine Care Planner & Ingredient Compatibility Guide
 * Generates Morning, Afternoon, Evening & Weekly Rituals + Interactive Tracker & Product Matching
 */

class SkincareRoutineGenerator {
    /**
     * Generate 4-part Care Ritual (Morning, Afternoon, Evening, Weekly) with rich application guidance
     */
    static generatePersonalizedRoutine(detectedConcerns, skinType = 'Combination', ageGroup = '26-39') {
        const morningSteps = [];
        const afternoonSteps = [];
        const eveningSteps = [];
        const weeklySteps = [];

        // 1. MORNING RITUAL
        if (detectedConcerns.includes('acne') || detectedConcerns.includes('oily_pores')) {
            morningSteps.push({
                id: 'm1',
                category: 'Step 1: Gentle Cleansing',
                name: 'LumiClear Gentle Clarifying Wash',
                active: '2% Salicylic Acid & Zinc PCA',
                duration: '60 Seconds',
                method: 'Circular massage on damp face with lukewarm water',
                targetZone: 'Full Face & T-Zone',
                instruction: 'Gentle 60-second massage to dissolve pore sebum without stripping barrier lipids.',
                time: 'Morning',
                completed: false
            });
        } else {
            morningSteps.push({
                id: 'm1',
                category: 'Step 1: Gentle Cleansing',
                name: 'CicaSoothe Hydrating Wash',
                active: 'Centella Asiatica & Panthenol B5',
                duration: '45 Seconds',
                method: 'Light foam massage over damp skin',
                targetZone: 'Full Face',
                instruction: 'Rinse with lukewarm water to preserve natural skin moisture balance.',
                time: 'Morning',
                completed: false
            });
        }

        if (detectedConcerns.includes('hyperpigmentation') || detectedConcerns.includes('wrinkles')) {
            morningSteps.push({
                id: 'm2',
                category: 'Step 2: Antioxidant Radiance Elixir',
                name: 'GlowBright Radiance Antioxidant Serum',
                active: 'L-Ascorbic Acid (15%) + Ferulic Acid',
                duration: 'Wait 60 seconds before moisturizer',
                method: 'Press 4-5 drops gently with fingertips into dry skin',
                targetZone: 'Face & Neck',
                instruction: 'Press drops into skin to brighten complexion and shield against free radical damage.',
                time: 'Morning',
                completed: false
            });
        } else {
            morningSteps.push({
                id: 'm2',
                category: 'Step 2: Barrier Soothing Elixir',
                name: 'CicaSoothe Calming Essence Serum',
                active: 'Niacinamide (5%) + Panthenol B5',
                duration: 'Wait 30 seconds',
                method: 'Smooth evenly across face',
                targetZone: 'Red / Flush Areas',
                instruction: 'Smooth over delicate areas to soothe flushing and fortify barrier defense.',
                time: 'Morning',
                completed: false
            });
        }

        morningSteps.push({
            id: 'm3',
            category: 'Step 3: Moisture Balance',
            name: 'HydraLight Water Cream',
            active: 'Hyaluronic Acid & Niacinamide',
            duration: '30 Seconds',
            method: 'Gently pat until absorbed',
            targetZone: 'Full Face & Neck',
            instruction: 'Lightweight hydration layer that absorbs smoothly under sun protection.',
            time: 'Morning',
            completed: false
        });

        morningSteps.push({
            id: 'm4',
            category: 'Step 4: Broad Spectrum Defense',
            name: 'Soothing Invisible Mineral Fluid SPF 50+',
            active: 'Zinc Oxide 18% & Ectoin',
            duration: 'Apply 15 min before sun exposure',
            method: 'Apply two full finger lengths smoothly',
            targetZone: 'Face, Neck & Ears',
            instruction: 'Apply generously over face and neck to shield against UV photo-aging.',
            time: 'Morning',
            completed: false
        });

        // 2. AFTERNOON TOUCH-UP CARE
        afternoonSteps.push({
            id: 'a1',
            category: 'Step 1: Mid-Day Moisture Refresh',
            name: 'CicaSoothe Barrier Relief Hydrosol Mist',
            active: 'Green Tea & Centella Hydrosol',
            duration: '10 Seconds',
            method: 'Spritz 2-3 pumps 8 inches from face',
            targetZone: 'Full Face',
            instruction: 'Lightly spritz over face to instantly soothe redness and replenish mid-day hydration.',
            time: 'Afternoon',
            completed: false
        });

        afternoonSteps.push({
            id: 'a2',
            category: 'Step 2: SPF Touch-Up Protection',
            name: 'Mineral SPF 50 Cushion Touch-Up',
            active: 'Non-nano Zinc Oxide',
            duration: '30 Seconds',
            method: 'Gently pat cushion over face',
            targetZone: 'Face & Cheekbones',
            instruction: 'Gently pat over makeup or bare skin to maintain continuous broad-spectrum UV defense.',
            time: 'Afternoon',
            completed: false
        });

        // 3. EVENING RITUAL
        eveningSteps.push({
            id: 'e1',
            category: 'Step 1: Double Cleanse Melt',
            name: 'Calming Botanical Oil + LumiClear Wash',
            active: 'Double Cleanse Routine',
            duration: '2 Minutes Total',
            method: 'Massage oil on dry skin 60s, emulsify with water, follow with gentle wash',
            targetZone: 'Full Face',
            instruction: 'Melt sunscreen and daily urban impurities with oil cleanser first, followed by gentle gel wash.',
            time: 'Evening',
            completed: false
        });

        if (ageGroup === '40-54' || ageGroup === '55+' || detectedConcerns.includes('wrinkles')) {
            eveningSteps.push({
                id: 'e2',
                category: 'Step 2: Night Renewal Elixir',
                name: 'RetinoLift Gentle Night Renewal Elixir',
                active: 'Encapsulated Retinol (0.5%) + Copper Peptides',
                duration: 'Wait 3 minutes before moisturizer',
                method: 'Apply pea-sized amount onto completely dry skin 2-3 nights per week',
                targetZone: 'Face (Avoid eye lids)',
                instruction: 'Targeted micro-encapsulated retinol to support cell turnover and smooth fine lines overnight.',
                time: 'Evening',
                completed: false
            });
        } else {
            eveningSteps.push({
                id: 'e2',
                category: 'Step 2: Night Renewal Elixir',
                name: 'Multi-Peptide Youth Elixir',
                active: 'Matrixyl 3000 + Hyaluronic Acid',
                duration: 'Wait 60 seconds',
                method: 'Press gently into face and neck',
                targetZone: 'Face & Neck',
                instruction: 'Smooth over face and neck to deeply nourish skin elasticity overnight.',
                time: 'Evening',
                completed: false
            });
        }

        if (ageGroup === '40-54' || ageGroup === '55+') {
            eveningSteps.push({
                id: 'e3',
                category: 'Step 3: Deep Lipid Barrier Repair',
                name: 'PeptideFirm Deep Lipid Recovery Balm',
                active: 'Copper Tripeptides & Ceramide EOP',
                duration: 'Overnight',
                method: 'Warm small amount in palms and press onto face',
                targetZone: 'Face & Dry Patches',
                instruction: 'Rich lipid recovery balm to seal in active ingredients and deeply restore moisture lipids overnight.',
                time: 'Evening',
                completed: false
            });
        } else {
            eveningSteps.push({
                id: 'e3',
                category: 'Step 3: Barrier Repair Cream',
                name: 'HydraBarrier Triple Ceramide Cream',
                active: 'Ceramides NP/AP/EOP & Squalane',
                duration: 'Overnight',
                method: 'Smooth evenly over face and neck',
                targetZone: 'Full Face',
                instruction: 'Nourishing barrier layer that locks in moisture and comfort while you sleep.',
                time: 'Evening',
                completed: false
            });
        }

        // 4. WEEKLY SPECIAL CARE RITUAL
        weeklySteps.push({
            id: 'w1',
            category: 'Weekly Clarifying Treatment (2x/week)',
            name: 'Botanical BHA Pore Clearing Mask',
            active: 'Willow Bark & Kaolin Clay',
            duration: '10 Minutes',
            method: 'Apply thin layer on T-zone, rinse with lukewarm water',
            targetZone: 'T-Zone & Nose',
            instruction: 'Apply once or twice weekly for 10 minutes to clear congested T-zone pores.',
            time: 'Weekly',
            completed: false
        });

        weeklySteps.push({
            id: 'w2',
            category: 'Weekly Moisture Plump (1x/week)',
            name: 'Bio-Cellulose Deep Hydration Sheet Mask',
            active: 'Triple Hyaluronic Acid & Ceramides',
            duration: '15 Minutes',
            method: 'Apply sheet mask over clean face, pat remaining serum',
            targetZone: 'Full Face',
            instruction: 'Relax for 15 minutes with intensive bio-cellulose mask to restore radiant moisture barrier.',
            time: 'Weekly',
            completed: false
        });

        return { morning: morningSteps, afternoon: afternoonSteps, evening: eveningSteps, weekly: weeklySteps };
    }

    /**
     * Calculate Age-Adjusted Product Suitability Score (%) & Explanation
     */
    static calculateAgeAdjustedMatch(product, activeConcerns = [], userAgeGroup = '26-39') {
        let score = product.baseMatch || 90;
        let ageBonus = 0;
        let concernMatchCount = 0;

        if (product.targetConcerns) {
            product.targetConcerns.forEach(c => {
                if (activeConcerns.includes(c)) concernMatchCount++;
            });
        }

        if (concernMatchCount > 0) {
            score += (concernMatchCount * 3);
        }

        if (product.targetAgeGroups && product.targetAgeGroups.includes(userAgeGroup)) {
            ageBonus = 6;
            score += ageBonus;
        } else {
            score -= 4;
        }

        score = Math.min(99, Math.max(65, score));

        let ageMatchExplanation = product.ageNote || `Formulated for ${userAgeGroup} skin profile needs.`;
        if (product.targetAgeGroups && product.targetAgeGroups.includes(userAgeGroup)) {
            ageMatchExplanation = `✨ Ideal Match for ${userAgeGroup} skin profile. ${product.ageNote}`;
        }

        return {
            suitabilityScore: score,
            ageMatchExplanation
        };
    }

    /**
     * Check ingredient interaction and gentle guidance
     */
    static analyzeIngredientSafety(selectedIngredientNames) {
        const conflicts = [];
        const synergies = [];

        const hasRetinol = selectedIngredientNames.some(i => i.toLowerCase().includes('retinol'));
        const hasVitC = selectedIngredientNames.some(i => i.toLowerCase().includes('vitamin c') || i.toLowerCase().includes('ascorbic'));
        const hasBHA = selectedIngredientNames.some(i => i.toLowerCase().includes('salicylic') || i.toLowerCase().includes('bha'));
        const hasNiacinamide = selectedIngredientNames.some(i => i.toLowerCase().includes('niacinamide'));
        const hasCeramides = selectedIngredientNames.some(i => i.toLowerCase().includes('ceramide'));

        if (hasRetinol && hasVitC) {
            conflicts.push({
                ingredients: ['Retinol', 'Vitamin C'],
                type: 'Ritual Timing Suggestion',
                advice: 'Gentle timing tip: Use Vitamin C during your Morning Ritual to protect skin during the day, and save Retinol for your Evening Ritual to allow deep overnight renewal.'
            });
        }

        if (hasRetinol && hasBHA) {
            conflicts.push({
                ingredients: ['Retinol', 'Salicylic Acid (BHA)'],
                type: 'Alternate Evenings',
                advice: 'Barrier care tip: Alternate evenings between Salicylic Acid and Retinol so your skin moisture barrier remains calm and comfortable.'
            });
        }

        if (hasNiacinamide && hasCeramides) {
            synergies.push({
                ingredients: ['Niacinamide', 'Ceramides'],
                benefit: 'Nourishing Barrier Pair',
                advice: 'Wonderful combination! Niacinamide calms skin while ceramides replenish essential moisture lipids.'
            });
        }

        return { conflicts, synergies };
    }
}

window.SkincareRoutineGenerator = SkincareRoutineGenerator;
