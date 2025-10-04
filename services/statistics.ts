
import type { Point, RegressionResult } from '../types';

/**
 * Calculates the simple linear regression (slope and intercept) for a set of points.
 * @param points An array of data points.
 * @returns The calculated slope and intercept.
 */
export const calculateLinearRegression = (points: Point[]): RegressionResult => {
    const n = points.length;
    if (n < 2) return { slope: 0, intercept: 0 };

    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (const p of points) {
        sumX += p.x;
        sumY += p.y;
        sumXY += p.x * p.y;
        sumX2 += p.x * p.x;
    }

    const denominator = n * sumX2 - sumX * sumX;
    if (denominator === 0) return { slope: 0, intercept: sumY / n };

    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
};

/**
 * Calculates a single outlier point that will reverse the sign of the regression slope.
 * @param initialPoints The initial array of 4 data points.
 * @returns The calculated reversal point (x₅, y₅).
 */
export const calculateReversalPoint = (initialPoints: Point[]): Point => {
    const n = initialPoints.length; // n = 4
    let sumX = 0, sumY = 0, sumXY = 0;
    for (const p of initialPoints) {
        sumX += p.x;
        sumY += p.y;
        sumXY += p.x * p.y;
    }

    const meanX = sumX / n;
    const stdDevX = Math.sqrt(initialPoints.reduce((acc, p) => acc + (p.x - meanX) ** 2, 0) / n);
    
    // Choose x5 far from the mean of x1..x4 to create a high-leverage point.
    const x5 = meanX + 5 * (stdDevX || 1); 

    // The numerator of the new slope (β̂₁_5pts) must have the opposite sign of the old one.
    // We target a negative slope. Numerator_5pts = (N_5 * sumXY_5 - sumX_5 * sumY_5) < 0
    // After expanding and solving for y5:
    // y5 * (n*x5 - sumX) < x5*sumY - ( (n+1)*sumXY - sumX*sumY )
    
    const lhs_factor = n * x5 - sumX;
    const rhs = x5 * sumY - ( (n+1) * sumXY - sumX * sumY);

    let y5;
    if (lhs_factor > 0) {
        const boundary = rhs / lhs_factor;
        y5 = boundary - Math.abs(boundary * 0.2) - 10; // Be safely below
    } else if (lhs_factor < 0) {
        const boundary = rhs / lhs_factor;
        y5 = boundary + Math.abs(boundary * 0.2) + 10; // Be safely above
    } else {
        // This case is extremely unlikely. Fallback by placing y5 very low.
        const meanY = sumY / n;
        y5 = meanY - 20 * (Math.abs(meanY) || 1);
    }

    return { x: x5, y: y5 };
};
