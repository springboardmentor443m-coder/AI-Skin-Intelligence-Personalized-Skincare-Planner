/**
 * Holistic Skin Health Scoring Engine
 * Evaluates overall vitality using the 5-factor weighted care model:
 * Overall Score = (0.35 * Skin Condition) + (0.20 * Lifestyle) + (0.15 * Sleep) + (0.20 * Routine Consistency) + (0.10 * Hydration)
 */

class SkinScoringEngine {
    static calculateHealthScore(params) {
        const {
            conditionScore = 75,
            sleepHours = 7.5,
            waterLiters = 2.0,
            sunExposure = 'Moderate',
            stressLevel = 'Medium',
            routineConsistencyDays = 6
        } = params;

        // 1. Dermal Condition Assessment (35%)
        const skinCondition = Math.min(100, Math.max(0, conditionScore));

        // 2. Lifestyle Harmony (20%)
        let lifestyleScore = 80;
        if (sunExposure === 'Low') lifestyleScore += 10;
        if (sunExposure === 'High') lifestyleScore -= 20;
        if (stressLevel === 'Low') lifestyleScore += 10;
        if (stressLevel === 'High') lifestyleScore -= 20;
        lifestyleScore = Math.min(100, Math.max(20, lifestyleScore));

        // 3. Restful Sleep Quality (15%)
        const sleepScore = Math.min(100, Math.round((sleepHours / 8.0) * 100));

        // 4. Routine Ritual Care (20%)
        const routineScore = Math.min(100, Math.round((routineConsistencyDays / 7.0) * 100));

        // 5. Hydration Balance (10%)
        const hydrationScore = Math.min(100, Math.round((waterLiters / 2.5) * 100));

        // Weighted Overall Calculation
        const overallScore = Math.round(
            (skinCondition * 0.35) +
            (lifestyleScore * 0.20) +
            (sleepScore * 0.15) +
            (routineScore * 0.20) +
            (hydrationScore * 0.10)
        );

        // Warm, humanized wellness status
        let grade = 'Fair Balance';
        let gradeColor = '#f59e0b';
        if (overallScore >= 85) {
            grade = 'Radiant & Balanced';
            gradeColor = '#10b981';
        } else if (overallScore >= 70) {
            grade = 'Healthy & Nourished';
            gradeColor = '#3b82f6';
        } else if (overallScore < 55) {
            grade = 'Needs Gentle Care';
            gradeColor = '#ef4444';
        }

        return {
            overallScore,
            grade,
            gradeColor,
            breakdown: {
                skinCondition: { score: skinCondition, weight: '35%', weightedContrib: +(skinCondition * 0.35).toFixed(1) },
                lifestyle: { score: lifestyleScore, weight: '20%', weightedContrib: +(lifestyleScore * 0.20).toFixed(1) },
                sleep: { score: sleepScore, weight: '15%', weightedContrib: +(sleepScore * 0.15).toFixed(1) },
                routineCare: { score: routineScore, weight: '20%', weightedContrib: +(routineScore * 0.20).toFixed(1) },
                hydration: { score: hydrationScore, weight: '10%', weightedContrib: +(hydrationScore * 0.10).toFixed(1) }
            },
            recommendations: this._generateActionableTips(overallScore, sleepHours, waterLiters, sunExposure, routineConsistencyDays)
        };
    }

    static _generateActionableTips(overallScore, sleep, water, sun, consistency) {
        const tips = [];
        if (water < 2.0) {
            tips.push('Hydration Care: Sip fresh water throughout the day (aim for 2.5L) to keep your skin feeling soft and supple.');
        }
        if (sleep < 7.0) {
            tips.push('Restful Renewal: Enjoy 7-8 hours of restful sleep so your skin cells can repair naturally overnight.');
        }
        if (sun === 'High') {
            tips.push('Sun Protection: High sun exposure detected. Reapply gentle mineral SPF 50 every 2 hours when outdoors.');
        }
        if (consistency < 5) {
            tips.push('Ritual Consistency: Enjoy your morning and evening skincare steps consistently at least 5 days a week.');
        }
        if (tips.length === 0) {
            tips.push('Your skin care routine is beautifully balanced! Keep enjoying your morning and evening rituals.');
        }
        return tips;
    }
}

window.SkinScoringEngine = SkinScoringEngine;
