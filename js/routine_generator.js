/**
 * Routine Care Planner & Ingredient Compatibility Guide
 */

class SkincareRoutineGenerator {
    /**
     * Generate morning & evening rituals tailored to detected skin concerns
     */
    static generatePersonalizedRoutine(detectedConcerns, skinType = 'Combination') {
        const morningSteps = [];
        const eveningSteps = [];

        // 1. Cleansing Step
        if (detectedConcerns.includes('acne') || detectedConcerns.includes('oily_pores')) {
            morningSteps.push({
                category: 'Cleansing Ritual',
                name: 'LumiClear Gentle Clarifying Wash',
                active: '2% Salicylic Acid & Zinc PCA',
                instruction: 'Gentle 60-second massage with warm water to clarify pore channels.',
                time: 'Morning'
            });
            eveningSteps.push({
                category: 'Double Cleansing Ritual',
                name: 'Calming Botanical Oil + LumiClear Wash',
                active: 'Double Cleanse Routine',
                instruction: 'Melt sunscreen and daily impurities with nourishing oil cleanser first, followed by gentle gel wash.',
                time: 'Evening'
            });
        } else {
            morningSteps.push({
                category: 'Cleansing Ritual',
                name: 'CicaSoothe Hydrating Wash',
                active: 'Centella Asiatica & Panthenol',
                instruction: 'Rinse with lukewarm water to preserve natural skin moisture balance.',
                time: 'Morning'
            });
            eveningSteps.push({
                category: 'Cleansing Ritual',
                name: 'HydraBarrier Cleansing Milk',
                active: 'Ceramides & Glycerin',
                instruction: 'Massage gently over face to sweep away environmental pollutants without stripping skin.',
                time: 'Evening'
            });
        }

        // 2. Treatment & Serums Step
        if (detectedConcerns.includes('hyperpigmentation') || detectedConcerns.includes('wrinkles')) {
            morningSteps.push({
                category: 'Radiance Elixir',
                name: 'GlowBright Radiance Antioxidant Serum',
                active: 'L-Ascorbic Acid (15%) + Ferulic Acid',
                instruction: 'Press 4-5 drops gently onto clean skin to brighten complexion and guard against daily stress.',
                time: 'Morning'
            });
        } else if (detectedConcerns.includes('redness')) {
            morningSteps.push({
                category: 'Soothing Elixir',
                name: 'CicaSoothe Calming Essence Serum',
                active: 'Niacinamide + Panthenol B5',
                instruction: 'Smooth gently over delicate areas to soothe flushing and fortify the skin barrier.',
                time: 'Morning'
            });
        }

        if (detectedConcerns.includes('wrinkles') || detectedConcerns.includes('acne')) {
            eveningSteps.push({
                category: 'Evening Care Ritual',
                name: 'RetinoLift Gentle Night Renewal Elixir',
                active: 'Encapsulated Retinol (0.5%) + Copper Peptides',
                instruction: 'Apply a small pea-sized amount onto dry skin 2-3 evenings per week. Follow with a rich barrier cream.',
                time: 'Evening'
            });
        } else {
            eveningSteps.push({
                category: 'Evening Care Ritual',
                name: 'Multi-Peptide Youth Elixir',
                active: 'Matrixyl 3000 + Hyaluronic Acid',
                instruction: 'Smooth over face and neck to deeply nourish skin elasticity overnight.',
                time: 'Evening'
            });
        }

        // 3. Moisturizing Step
        morningSteps.push({
            category: 'Moisture Balance',
            name: 'HydraLight Water Cream',
            active: 'Hyaluronic Acid & Niacinamide',
            instruction: 'Lightweight hydration layer that absorbs smoothly under sun protection.',
            time: 'Morning'
        });

        eveningSteps.push({
            category: 'Barrier Nourishment',
            name: 'HydraBarrier Triple Ceramide Cream',
            active: 'Ceramides NP/AP/EOP & Squalane',
            instruction: 'Nourishing barrier layer that locks in moisture and comfort while you sleep.',
            time: 'Evening'
        });

        // 4. Sun Protection (Morning Only)
        morningSteps.push({
            category: 'Daily Sun Protection',
            name: 'Soothing Invisible Mineral Fluid SPF 50+',
            active: 'Zinc Oxide 18% & Ectoin',
            instruction: 'Apply generously over face and neck 15 minutes before stepping outside.',
            time: 'Morning'
        });

        return { morning: morningSteps, evening: eveningSteps };
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
