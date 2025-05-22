import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    Title, 
    Tooltip, 
    Legend 
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    Title, 
    Tooltip, 
    Legend
);

const PlayerPropAnalyzer = () => {
    const { playerId } = useParams();
    const [player, setPlayer] = useState(null);
    const [propHistory, setPropHistory] = useState([]);
    const [currentPropType, setCurrentPropType] = useState('hits');
    const [loading, setLoading] = useState(true);
    const [availablePropTypes, setAvailablePropTypes] = useState([]);
    
    const fetchPlayerData = useCallback(async () => {
        try {
            setLoading(true);
            // Fetch player details
            const playerResponse = await axios.get(`/api/players/${playerId}`);
            setPlayer(playerResponse.data);
            
            // Fetch player prop history
            const propsResponse = await axios.get(`/api/players/${playerId}/props`);
            const props = propsResponse.data;
            setPropHistory(props);
            
            // Get available prop types
            const propTypes = [...new Set(props.map(prop => prop.propType))];
            setAvailablePropTypes(propTypes);
            
            // Set default prop type if available
            if (propTypes.length > 0 && !propTypes.includes(currentPropType)) {
                setCurrentPropType(propTypes[0]);
            }
            
            setLoading(false);
        } catch (error) {
            console.error('Error fetching player data:', error);
            setLoading(false);
        }
    }, [playerId, currentPropType]);
    
    useEffect(() => {
        fetchPlayerData();
    }, [fetchPlayerData]);
    
    // Filter props by selected type
    const filteredProps = propHistory.filter(prop => prop.propType === currentPropType);
    
    // Prepare chart data
    const prepareChartData = () => {
        if (!filteredProps.length) return null;
        
        const sortedProps = [...filteredProps].sort((a, b) => new Date(a.Game.startTime) - new Date(b.Game.startTime));
        
        const labels = sortedProps.map(prop => {
            const date = new Date(prop.Game.startTime);
            return `${date.getMonth() + 1}/${date.getDate()} vs ${prop.Game.awayTeamId === player.teamId ? prop.Game.homeTeam.abbreviation : prop.Game.awayTeam.abbreviation}`;
        });
        
        const lineData = sortedProps.map(prop => prop.result);
        const propLines = sortedProps.map(prop => prop.line);
        
        return {
            labels,
            datasets: [
                {
                    label: currentPropType.charAt(0).toUpperCase() + currentPropType.slice(1),
                    data: lineData,
                    fill: false,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    tension: 0.1
                },
                {
                    label: 'Betting Line',
                    data: propLines,
                    fill: false,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderDash: [5, 5],
                    tension: 0.1
                }
            ]
        };
    };
    
    // Calculate performance metrics
    const calculatePerformance = () => {
        if (!filteredProps.length) return { hitRate: 0, average: 0, totalGames: 0 };
        
        const gamesWithResult = filteredProps.filter(prop => prop.result !== null);
        const hitsOver = filteredProps.filter(prop => prop.hitOver === true).length;
        const totalValues = filteredProps.reduce((sum, prop) => sum + (prop.result || 0), 0);
        
        return {
            hitRate: gamesWithResult.length ? (hitsOver / gamesWithResult.length * 100).toFixed(1) : 0,
            average: gamesWithResult.length ? (totalValues / gamesWithResult.length).toFixed(2) : 0,
            totalGames: gamesWithResult.length
        };
    };
    
    const performance = calculatePerformance();
    const chartData = prepareChartData();
    
    if (loading) return <div className="text-center p-8">Loading player data...</div>;
    if (!player) return <div className="text-center p-8">Player not found</div>;
    
    return (
        <div className="player-prop-analyzer p-4">
            <div className="player-header mb-6 flex items-center">
                <div className="player-info">
                    <h1 className="text-2xl font-bold">{player.name}</h1>
                    <p className="text-gray-600">{player.Team?.name} • {player.position}</p>
                </div>
            </div>
            
            <div className="prop-selector mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Prop Type:
                </label>
                <select 
                    className="form-select rounded-md border-gray-300 shadow-sm"
                    value={currentPropType}
                    onChange={(e) => setCurrentPropType(e.target.value)}
                >
                    {availablePropTypes.map(type => (
                        <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                    ))}
                </select>
            </div>
            
            <div className="performance-stats mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="stat-card bg-white p-4 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Hit Rate (Over)</h3>
                    <p className="text-2xl font-bold">{performance.hitRate}%</p>
                </div>
                <div className="stat-card bg-white p-4 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Average</h3>
                    <p className="text-2xl font-bold">{performance.average}</p>
                </div>
                <div className="stat-card bg-white p-4 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Games Analyzed</h3>
                    <p className="text-2xl font-bold">{performance.totalGames}</p>
                </div>
            </div>
            
            <div className="prop-chart mb-6 bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-medium mb-4">Performance History</h2>
                {chartData ? (
                    <div className="chart-container" style={{ height: '300px' }}>
                        <Line 
                            data={chartData} 
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                    y: {
                                        beginAtZero: true
                                    }
                                }
                            }}
                        />
                    </div>
                ) : (
                    <p className="text-gray-500">No historical data available for this prop type.</p>
                )}
            </div>
            
            <div className="prop-history">
                <h2 className="text-lg font-medium mb-4">Recent Games</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opponent</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Line</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hit?</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredProps.slice(0, 10).map(prop => {
                                const date = new Date(prop.Game.startTime);
                                const opponent = prop.Game.awayTeamId === player.teamId ? 
                                    prop.Game.homeTeam.abbreviation : prop.Game.awayTeam.abbreviation;
                                
                                return (
                                    <tr key={prop.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {date.toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {opponent}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {prop.line}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {prop.result !== null ? prop.result : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {prop.hitOver === true ? (
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                    OVER
                                                </span>
                                            ) : prop.hitOver === false ? (
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                                    UNDER
                                                </span>
                                            ) : (
                                                <span className="text-gray-500">-</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PlayerPropAnalyzer;