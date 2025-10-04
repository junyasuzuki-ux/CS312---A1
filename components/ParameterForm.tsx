
import React, { useState } from 'react';
import type { Point } from '../types';
import { PlayIcon } from './Icons';

interface PointInput {
    x: string;
    y: string;
}

interface PointsFormProps {
    onCalculate: (points: Point[]) => void;
    isLoading: boolean;
    setError: (error: string | null) => void;
}

const PointsForm: React.FC<PointsFormProps> = ({ onCalculate, isLoading, setError }) => {
    const [points, setPoints] = useState<PointInput[]>([
        { x: '1', y: '7' },
        { x: '2', y: '9' },
        { x: '8', y: '21' },
        { x: '10', y: '25' },
    ]);

    const handleInputChange = (index: number, field: 'x' | 'y', value: string) => {
        const newPoints = [...points];
        newPoints[index][field] = value;
        setPoints(newPoints);
    };
    
    const handleSubmit = () => {
        setError(null);
        const numericPoints: Point[] = [];
        for (const p of points) {
            const x = parseFloat(p.x);
            const y = parseFloat(p.y);
            if (isNaN(x) || isNaN(y)) {
                setError("All X and Y values must be valid numbers.");
                return;
            }
            numericPoints.push({ x, y });
        }
        onCalculate(numericPoints);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">1. Enter Four Initial Points</h3>
            <div className="space-y-3">
                {points.map((p, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
                        <label className="text-sm font-medium text-gray-700 md:col-span-2">Point {index + 1}</label>
                        <input
                            type="text"
                            placeholder="X value"
                            value={p.x}
                            onChange={(e) => handleInputChange(index, 'x', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        <input
                            type="text"
                            placeholder="Y value"
                            value={p.y}
                            onChange={(e) => handleInputChange(index, 'y', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                ))}
                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
                >
                     {isLoading ? (
                         <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                           Calculating...
                         </>
                    ) : (
                        <>
                            <PlayIcon />
                            Calculate Initial Regression
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default PointsForm;
