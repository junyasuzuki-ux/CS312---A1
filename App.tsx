
import React, { useState, useCallback, useEffect } from 'react';
import type { Point, RegressionResult } from './types';
import { calculateLinearRegression, calculateReversalPoint } from './services/statistics';
import PointsForm from './components/ParameterForm';
import RegressionPlot from './components/RegressionPlot';
import { AnalyticsIcon, ChartIcon, TargetIcon } from './components/Icons';

const App: React.FC = () => {
    // Step 1: Initial data
    const [initialPoints, setInitialPoints] = useState<Point[] | null>(null);
    const [initialRegression, setInitialRegression] = useState<RegressionResult | null>(null);
    const [suggestedReversalPoint, setSuggestedReversalPoint] = useState<Point | null>(null);
    
    // Step 2: 5th point data
    const [fifthPointInput, setFifthPointInput] = useState<{x: string, y: string}>({ x: '', y: '' });
    const [fifthPoint, setFifthPoint] = useState<Point | null>(null);
    
    // Step 3: Combined data
    const [combinedData, setCombinedData] = useState<Point[] | null>(null);
    const [combinedRegression, setCombinedRegression] = useState<RegressionResult | null>(null);

    // App state
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleCalculateInitial = useCallback((points: Point[]) => {
        setIsLoading(true);
        setError(null);

        // Reset everything
        setInitialPoints(null);
        setInitialRegression(null);
        setSuggestedReversalPoint(null);
        setFifthPointInput({ x: '', y: '' });
        setFifthPoint(null);
        setCombinedData(null);
        setCombinedRegression(null);
        
        setTimeout(() => {
            try {
                if (points.length !== 4) {
                    throw new Error("Exactly four points are required.");
                }

                const regression4pts = calculateLinearRegression(points);
                if (regression4pts.slope <= 0) {
                     setError("The initial four points must result in a positive slope for this demonstration. Please adjust the points.");
                     setIsLoading(false);
                     return;
                }
                
                setInitialPoints(points);
                setInitialRegression(regression4pts);

                const reversal = calculateReversalPoint(points);
                setSuggestedReversalPoint(reversal);

            } catch (e) {
                if (e instanceof Error) setError(e.message);
                else setError("An unknown error occurred.");
            } finally {
                setIsLoading(false);
            }
        }, 300);
    }, []);
    
    // Effect to handle 5th point changes
    useEffect(() => {
        const x = parseFloat(fifthPointInput.x);
        const y = parseFloat(fifthPointInput.y);

        if (!isNaN(x) && !isNaN(y)) {
            const newFifthPoint = { x, y };
            setFifthPoint(newFifthPoint);
            if (initialPoints) {
                const newData = [...initialPoints, newFifthPoint];
                setCombinedData(newData);
                setCombinedRegression(calculateLinearRegression(newData));
            }
        } else {
            setFifthPoint(null);
            setCombinedData(null);
            setCombinedRegression(null);
        }
    }, [fifthPointInput, initialPoints]);
    
    const handleUseSuggestion = () => {
        if (suggestedReversalPoint) {
            setFifthPointInput({
                x: suggestedReversalPoint.x.toFixed(2),
                y: suggestedReversalPoint.y.toFixed(2)
            });
        }
    };

    const ResultCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center mb-4">
                {icon}
                <h3 className="text-xl font-semibold text-gray-700">{title}</h3>
            </div>
            {children}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold leading-tight text-gray-900">
                        Regression Line Sign Reverser
                    </h1>
                    <p className="mt-1 text-md text-gray-600">
                        An interactive tool to demonstrate the powerful influence of a single outlier on linear regression.
                    </p>
                </div>
            </header>
            <main className="py-10">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-8">
                        <PointsForm onCalculate={handleCalculateInitial} isLoading={isLoading} setError={setError} />
                        {error && (
                            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
                                <strong className="font-bold">Error: </strong>
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}
                        {initialRegression && (
                            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 sticky top-8">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">2. Add a Fifth Point</h3>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-2">
                                         <input
                                            type="text"
                                            placeholder="X value"
                                            value={fifthPointInput.x}
                                            onChange={(e) => setFifthPointInput(prev => ({...prev, x: e.target.value}))}
                                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Y value"
                                            value={fifthPointInput.y}
                                            onChange={(e) => setFifthPointInput(prev => ({...prev, y: e.target.value}))}
                                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                    {suggestedReversalPoint && (
                                        <div className="bg-purple-50 border border-purple-200 p-3 rounded-md text-center">
                                            <div className="flex items-center mb-2 justify-center">
                                                <TargetIcon />
                                                <h4 className="text-md font-semibold text-purple-800">Suggested Reversal Point</h4>
                                            </div>
                                            <p className="text-sm text-purple-700 font-mono">
                                                (x: {suggestedReversalPoint.x.toFixed(2)}, y: {suggestedReversalPoint.y.toFixed(2)})
                                            </p>
                                            <button 
                                              onClick={handleUseSuggestion}
                                              className="mt-2 w-full text-sm text-purple-600 font-semibold hover:text-purple-800 transition-colors"
                                            >
                                                Use this point
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="lg:col-span-2 space-y-8">
                        {initialRegression && initialPoints && (
                            <ResultCard title="Analysis with 4 Points" icon={<ChartIcon />}>
                                <p className="text-gray-600 mb-4">Regression based on the four points you provided.</p>
                                <div className="font-mono bg-gray-100 p-3 rounded-md text-center mb-4">
                                    Slope (β̂₁_4pts): <span className="font-bold text-blue-600">{initialRegression.slope.toFixed(4)}</span>
                                </div>
                                <div className="w-full h-80">
                                    <RegressionPlot data={initialPoints} regression={initialRegression} />
                                </div>
                            </ResultCard>
                        )}

                        {combinedRegression && combinedData && fifthPoint && (
                            <ResultCard title="Analysis with 5 Points" icon={<AnalyticsIcon />}>
                                <p className="text-gray-600 mb-4">The regression line updated with the fifth point. Notice how the slope changes.</p>
                                <div className="font-mono bg-gray-100 p-3 rounded-md text-center mb-4">
                                    New Slope (β̂₁_5pts): <span className={`font-bold ${combinedRegression.slope > 0 ? 'text-blue-600' : 'text-red-600'}`}>{combinedRegression.slope.toFixed(4)}</span>
                                </div>
                                <div className="w-full h-80">
                                    <RegressionPlot data={combinedData} regression={combinedRegression} outlier={fifthPoint} />
                                </div>
                            </ResultCard>
                        )}
                        
                        {!initialPoints && !isLoading && (
                            <div className="text-center py-12 bg-white rounded-lg shadow-md border border-gray-200">
                                <h2 className="text-2xl font-semibold text-gray-700">Ready to start?</h2>
                                <p className="mt-2 text-gray-500">Enter four data points and click "Calculate" to begin.</p>
                            </div>
                        )}
                         {isLoading && (
                            <div className="text-center py-12 bg-white rounded-lg shadow-md border border-gray-200 flex justify-center items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-xl font-semibold text-gray-700">Calculating...</span>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;
