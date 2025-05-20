import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const GamesDashboard = () => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    
    useEffect(() => {
        const fetchUpcomingGames = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/games/upcoming');
            setGames(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching upcoming games:', error);
            setLoading(false);
        }
        };
        
        fetchUpcomingGames();
    }, []);
    
    // Group games by date
    const gamesByDate = games.reduce((acc, game) => {
        const date = new Date(game.startTime).toLocaleDateString();
        
        if (!acc[date]) {
        acc[date] = [];
        }
        
        acc[date].push(game);
        return acc;
    }, {});
    
    // Get dates with games
    const dates = Object.keys(gamesByDate).sort((a, b) => new Date(a) - new Date(b));
    
    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    };
    
    // Get best odds for a game
    const getBestOdds = (game, team) => {
        if (!game.BettingLines || game.BettingLines.length === 0) return null;
        
        let bestOdds = null;
        
        game.BettingLines.forEach(line => {
        const odds = team === 'home' ? line.homeMoneyline : line.awayMoneyline;
        
        if (odds && (!bestOdds || odds > bestOdds)) {
            bestOdds = odds;
        }
        });
        
        return bestOdds;
    };
    
    // Format American odds for display
    const formatOdds = (odds) => {
        if (!odds) return '-';
        return odds > 0 ? `+${odds}` : odds;
    };
    
    if (loading) return <div className="text-center p-8">Loading games...</div>;
    
    return (
        <div className="games-dashboard p-4">
        <h1 className="text-2xl font-bold mb-6">Upcoming Games</h1>
        
        <div className="date-selector mb-6 flex overflow-x-auto">
            {dates.map(date => (
            <button
                key={date}
                className={`px-4 py-2 mr-2 rounded-lg ${
                selectedDate.toLocaleDateString() === date
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
                onClick={() => setSelectedDate(new Date(date))}
            >
                {formatDate(date)}
            </button>
            ))}
        </div>
        
        <div className="games-list">
            {gamesByDate[selectedDate.toLocaleDateString()]?.map(game => {
            const startTime = new Date(game.startTime);
            const homeTeam = game.homeTeam;
            const awayTeam = game.awayTeam;
            
            // Get latest betting line
            const latestLine = game.BettingLines && game.BettingLines.length > 0
                ? game.BettingLines[0]
                : null;
            
            // Get best odds
            const bestHomeOdds = getBestOdds(game, 'home');
            const bestAwayOdds = getBestOdds(game, 'away');
            
            return (
                <div key={game.id} className="game-card bg-white rounded-lg shadow mb-4 overflow-hidden">
                <div className="game-header bg-gray-100 p-3 flex justify-between items-center">
                    <div className="game-time text-sm text-gray-600">
                    {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {game.Prediction && (
                    <div className="prediction text-sm">
                        <span className="font-medium">Prediction:</span>{' '}
                        {game.Prediction.predictedHomeScore.toFixed(1)} - {game.Prediction.predictedAwayScore.toFixed(1)}
                    </div>
                    )}
                </div>
                
                <div className="game-content p-4">
                    <div className="teams-container grid grid-cols-3 gap-4">
                    <div className="away-team">
                        <div className="team-name font-bold">{awayTeam.name}</div>
                        <div className="team-moneyline text-lg font-medium text-blue-600">
                        {formatOdds(bestAwayOdds)}
                        </div>
                    </div>
                    
                    <div className="game-meta flex items-center justify-center">
                        <div className="text-gray-500 text-sm">@</div>
                    </div>
                    
                    <div className="home-team text-right">
                        <div className="team-name font-bold">{homeTeam.name}</div>
                        <div className="team-moneyline text-lg font-medium text-blue-600">
                        {formatOdds(bestHomeOdds)}
                        </div>
                    </div>
                    </div>
                    
                    {latestLine && (
                    <div className="odds-details mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                            <div className="text-gray-500">Spread</div>
                            <div>{formatOdds(latestLine.awaySpread)} ({formatOdds(latestLine.awaySpreadOdds)})</div>
                        </div>
                        
                        <div className="text-center">
                            <div className="text-gray-500">Total</div>
                            <div>O/U {latestLine.overUnder}</div>
                        </div>
                        
                        <div className="text-right">
                            <div className="text-gray-500">Spread</div>
                            <div>{formatOdds(latestLine.homeSpread)} ({formatOdds(latestLine.homeSpreadOdds)})</div>
                        </div>
                        </div>
                    </div>
                    )}
                    
                    <div className="game-actions mt-4 flex justify-end">
                    <Link 
                        to={`/game/${game.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                        View Analysis →
                    </Link>
                    </div>
                </div>
                </div>
            );
            })}
            
            {(!gamesByDate[selectedDate.toLocaleDateString()] || 
            gamesByDate[selectedDate.toLocaleDateString()].length === 0) && (
            <div className="text-center p-8 bg-white rounded-lg shadow">
                No games scheduled for this date.
            </div>
            )}
        </div>
        </div>
    );
};

export default GamesDashboard;