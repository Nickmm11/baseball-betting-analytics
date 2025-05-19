import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const GameAnalysis = () => {
    const { gameId } = useParams();
    const [game, setGame] = useState(null);
    const [playerProps, setPlayerProps] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchGameData = async () => {
        try {
            setLoading(true);
            // Fetch game details
            const gameResponse = await axios.get(`/api/games/${gameId}`);
            setGame(gameResponse.data);
            
            // Fetch player props for this game
            const propsResponse = await axios.get(`/api/odds/game-props/${gameId}`);
            setPlayerProps(propsResponse.data);
            
            setLoading(false);
        } catch (error) {
            console.error('Error fetching game data:', error);
            setLoading(false);
        }
        };
        
        fetchGameData();
    }, [gameId]);
    
    if (loading) return <div className="text-center p-8">Loading game data...</div>;
    if (!game) return <div className="text-center p-8">Game not found</div>;
    
    const startTime = new Date(game.startTime);
    const homeTeam = game.homeTeam;
    const awayTeam = game.awayTeam;
    
    // Group props by player and team
    const homeTeamProps = playerProps.filter(prop => 
        prop.Player.teamId === game.homeTeamId
    );
    
    const awayTeamProps = playerProps.filter(prop => 
        prop.Player.teamId === game.awayTeamId
    );
    
    // Group props by player
    const groupPropsByPlayer = (props) => {
        return props.reduce((acc, prop) => {
        if (!acc[prop.playerId]) {
            acc[prop.playerId] = {
            player: prop.Player,
            props: []
            };
        }
        
        acc[prop.playerId].props.push(prop);
        return acc;
        }, {});
    };
    
    const homePlayerProps = groupPropsByPlayer(homeTeamProps);
    const awayPlayerProps = groupPropsByPlayer(awayTeamProps);
    
    // Format odds
    const formatOdds = (odds) => {
        if (!odds) return '-';
        return odds > 0 ? `+${odds}` : odds;
    };
    
    return (
        <div className="game-analysis p-4">
        <div className="game-header mb-6">
            <h1 className="text-2xl font-bold mb-2">
            {awayTeam.name} @ {homeTeam.name}
            </h1>
            <p className="text-gray-600">
            {startTime.toLocaleDateString()} • {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
        </div>
        
        {game.Prediction && (
            <div className="prediction-card bg-white rounded-lg shadow mb-6 p-4">
            <h2 className="text-lg font-medium mb-3">Game Prediction</h2>
            <div className="grid grid-cols-3 gap-4">
                <div>
                <p className="text-gray-500">Away Score</p>
                <p className="text-2xl font-bold">{game.Prediction.predictedAwayScore.toFixed(1)}</p>
                </div>
                <div className="text-center">
                <p className="text-gray-500">Total</p>
                <p className="text-2xl font-bold">{game.Prediction.predictedTotal.toFixed(1)}</p>
                </div>
                <div className="text-right">
                <p className="text-gray-500">Home Score</p>
                <p className="text-2xl font-bold">{game.Prediction.predictedHomeScore.toFixed(1)}</p>
                </div>
            </div>
            <div className="mt-3">
                <p className="text-gray-500 text-sm">Confidence: {(game.Prediction.confidenceScore * 100).toFixed(0)}%</p>
            </div>
            </div>
        )}
        
        <div className="odds-card bg-white rounded-lg shadow mb-6 p-4">
            <h2 className="text-lg font-medium mb-3">Betting Lines</h2>
            
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sportsbook</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{awayTeam.name} ML</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{homeTeam.name} ML</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spread</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {game.BettingLines.map(line => (
                    <tr key={line.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {line.sportsbook}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatOdds(line.awayMoneyline)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatOdds(line.homeMoneyline)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {awayTeam.abbreviation} {formatOdds(line.awaySpread)} ({formatOdds(line.awaySpreadOdds)})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        O/U {line.overUnder} (O: {formatOdds(line.overOdds)})
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>
        
        <div className="player-props-section mb-6">
            <h2 className="text-lg font-medium mb-3">Player Props</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="team-props">
                <h3 className="text-md font-medium mb-3">{awayTeam.name}</h3>
                
                {Object.values(awayPlayerProps).map(({ player, props }) => (
                <div key={player.id} className="player-prop-card bg-white rounded-lg shadow mb-4 p-4">
                    <Link 
                    to={`/player/${player.id}`}
                    className="player-name text-lg font-medium hover:text-blue-600"
                    >
                    {player.name}
                    </Link>
                    
                    <div className="prop-list mt-3">
                    {props.map(prop => (
                        <div key={prop.id} className="prop-item mb-2 pb-2 border-b border-gray-100 last:border-0">
                        <div className="flex justify-between">
                            <div className="prop-type text-gray-600">
                            {prop.propType.charAt(0).toUpperCase() + prop.propType.slice(1)}
                            </div>
                            <div className="prop-line font-medium">
                            {prop.line} (O: {formatOdds(prop.overOdds)})
                            </div>
                        </div>
                        
                        {player.propPerformance && player.propPerformance[prop.propType] && (
                            <div className="prop-stats mt-1 text-sm text-gray-500">
                            Hits over {(player.propPerformance[prop.propType].overRate * 100).toFixed(1)}% of games
                            (Avg: {player.propPerformance[prop.propType].average.toFixed(2)})
                            </div>
                        )}
                        </div>
                    ))}
                    </div>
                    
                    <div className="mt-3 text-right">
                    <Link 
                        to={`/player/${player.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                        View History →
                    </Link>
                    </div>
                </div>
                ))}
            </div>
            
            <div className="team-props">
                <h3 className="text-md font-medium mb-3">{homeTeam.name}</h3>
                
                {Object.values(homePlayerProps).map(({ player, props }) => (
                <div key={player.id} className="player-prop-card bg-white rounded-lg shadow mb-4 p-4">
                    <Link 
                    to={`/player/${player.id}`}
                    className="player-name text-lg font-medium hover:text-blue-600"
                    >
                    {player.name}
                    </Link>
                    
                    <div className="prop-list mt-3">
                    {props.map(prop => (
                        <div key={prop.id} className="prop-item mb-2 pb-2 border-b border-gray-100 last:border-0">
                        <div className="flex justify-between">
                            <div className="prop-type text-gray-600">
                            {prop.propType.charAt(0).toUpperCase() + prop.propType.slice(1)}
                            </div>
                            <div className="prop-line font-medium">
                            {prop.line} (O: {formatOdds(prop.overOdds)})
                            </div>
                        </div>
                        
                        {player.propPerformance && player.propPerformance[prop.propType] && (
                            <div className="prop-stats mt-1 text-sm text-gray-500">
                            Hits over {(player.propPerformance[prop.propType].overRate * 100).toFixed(1)}% of games
                            (Avg: {player.propPerformance[prop.propType].average.toFixed(2)})
                            </div>
                        )}
                        </div>
                    ))}
                    </div>
                    
                    <div className="mt-3 text-right">
                    <Link 
                        to={`/player/${player.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                        View History →
                    </Link>
                    </div>
                </div>
                ))}
            </div>
            </div>
        </div>
        </div>
    );
};

export default GameAnalysis;