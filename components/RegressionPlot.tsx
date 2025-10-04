import React from 'react';
// FIX: Import ZAxis to control scatter point size.
import { ResponsiveContainer, ScatterChart, CartesianGrid, XAxis, YAxis, ZAxis, Tooltip, Scatter, Line, Legend } from 'recharts';
import type { Point, RegressionResult } from '../types';

interface RegressionPlotProps {
    data: Point[];
    regression: RegressionResult;
    outlier?: Point | null;
}

const RegressionPlot: React.FC<RegressionPlotProps> = ({ data, regression, outlier = null }) => {
    
    const allX = data.map(p => p.x);
    const allY = data.map(p => p.y);
    const minX = Math.min(...allX);
    const maxX = Math.max(...allX);
    const minY = Math.min(...allY);
    const maxY = Math.max(...allY);

    const padding = Math.max(Math.abs(maxX-minX), Math.abs(maxY-minY)) * 0.1;

    const regressionLineData = [
        { x: minX - padding, y: regression.intercept + regression.slope * (minX - padding) },
        { x: maxX + padding, y: regression.intercept + regression.slope * (maxX + padding) },
    ];

    const normalData = outlier ? data.filter(p => p.x !== outlier.x || p.y !== outlier.y) : data;
    // FIX: Add a 'size' property to the outlier data to be used by the ZAxis.
    const outlierData = outlier ? [{...outlier, size: 150}] : [];
    
    return (
        <ResponsiveContainer width="100%" height="100%">
            <ScatterChart 
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                // FIX: The 'domain' prop is not valid on ScatterChart. It has been moved to XAxis and YAxis.
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                    type="number" 
                    dataKey="x" 
                    name="X" 
                    // FIX: Apply the calculated domain to the XAxis.
                    domain={[minX - padding, maxX + padding]}
                    label={{ value: 'X Value', position: 'insideBottom', offset: -10 }}
                    allowDataOverflow={true}
                />
                <YAxis 
                    type="number" 
                    dataKey="y" 
                    name="Y" 
                    label={{ value: 'Y Value', angle: -90, position: 'insideLeft', offset: 10 }}
                    allowDataOverflow={true}
                    // FIX: Apply the calculated domain to the YAxis.
                    domain={[minY - padding, maxY + padding]}
                />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Legend />
                
                {/* FIX: Add a ZAxis to control the size of scatter points via the 'size' dataKey. */}
                <ZAxis type="number" dataKey="size" range={[150, 150]} />
                
                <Scatter name="Data Points" data={normalData} fill="#4f46e5" />

                {/* FIX: Remove the invalid 'size' prop. The size is now controlled by the ZAxis. */}
                {outlier && <Scatter name="Outlier" data={outlierData} fill="#d946ef" shape="star" />}
                
                <Line 
                    type="monotone" 
                    dataKey="y"
                    data={regressionLineData} 
                    stroke={regression.slope > 0 ? "#2563eb" : "#dc2626"}
                    strokeWidth={2}
                    dot={false}
                    activeDot={false}
                    legendType="none" 
                    name="Regression Line"
                />
            </ScatterChart>
        </ResponsiveContainer>
    );
};

export default RegressionPlot;