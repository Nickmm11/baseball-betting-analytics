import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const PlayerList = () => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTeam, setSelectedTeam] = useState('');
    const [selectedPosition, setSelectedPosition] = useState('');
    const [teams, setTeams] = useState([]);
    const [positions, setPositions] = useState([]);

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/players');
                setPlayers(response.data);

                //extract unique teams and positions
                const uniqueTeams = [...new Set(response.data.map(player => player.Team?.name))].filter(Boolean);
                const uniquePositions = [...new Set(response.data.map(player => player.position))].filter(Boolean);

                setTeams(uniqueTeams);
                setPositions(uniquePositions);

                setLoading(false);
            } catch (error) {
                console.error('Error fetching players:', error);
                setLoading(false);
            }
        };

        fetchPlayers();
    }, []);

    //filter players based on search and filters
    const filteredPlayers = players.filter(player => {
        const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTeam = selectedTeam ? player.Team?.name === selectedTeam : true;
        const matchesPosition = selectedPosition ? player.position === selectedPosition : true;

        return matchesSearch && matchesTeam && matchesPosition;
    });

    //group players by team
    const playersByTeam = filteredPlayers.reduce((acc, player) => {
        const teamName = player.Team?.name || 'Unknown Team';

        //check if team exists in accumulator
        if (!acc[teamName]) {
            acc[teamName] = [];
        }
        acc[teamName].push(player);
        return acc;
    }, {});

    if (loading) return <div className = 'text-center p-8'>Loading Players...</div>;

    return (
        <div className = 'players-list'>
            <h1 className = 'text-2xl font-bold mb-6'> MLB Players</h1>

            <div className = 'filters bg-white p-4 rounded-lg shadow mb-6'>
                <div className = 'grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div>
                        <label htmlFor = 'search' className = 'block text-sm font-medium text-gray-700 mb-1'>Fetch Player</label>
                        <input 
                        type = 'text'
                        id = 'search'
                        className = 'w-full p-2 border-gray-300 rounded'
                        placeholder = 'Enter player name...'
                        value = {searchTerm}
                        onChange = {(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor = 'team' className = 'block text-sm font-medium text-gray-700 mb-1'>Filter by Team</label>
                        <select
                        id = 'team'
                        className = 'w-full p-2 border-gray-300 rounded'
                        value = {selectedTeam}
                        onChange = {(e) => setSelectedTeam(e.target.value)}>
                            <option value = ''>All Teams</option>
                            {teams.map(team => (
                                <option key = {team} value = {team}>{team}</option>
                            ))}    
                        </select>
                    </div>

                    <div>
                        <label htmlFor = 'position' className = 'block text-sm font-medium text-gray-700 mb-1'>Filter by Position</label>
                        <select
                        id = 'position'
                        className = 'w-full p-2 border-gray-300 rounded'
                        value = {selectedPosition}
                        onChange = {(e) => setSelectedPosition(e.target.value)}>
                            <option value = ''>All Positions</option>
                            {positions.map(position => (
                                <option key = {position} value = {position}>{position}</option>
                            ))}    
                        </select>
                    </div>
                </div>
            </div>

            <div className = 'results'>
                {Object.keys(playersByTeam).length === 0 ? (
                    <div>No players found.</div>
                ) : (
                    Object.entries(playersByTeam).sort(([teamA], [teamB]) => teamA.localeCompare(teamB))
                    .map(([teamName, teamPlayers]) => (
                        <div key = {teamName} className = 'team-group mb-6'>
                            <h2 className = 'text-xl font-semibold mb-3'>{teamName}</h2>
                            <div className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                                {teamPlayers.map(player => (
                                    <Link
                                    key = {player.id}
                                    to = {`/player/${player.id}`}
                                    className = 'player-card bg-white p-4 rounded-lg shadow hover:shadow-md transition'>
                                        <div className = 'flex justify-between items-start'>
                                            <div>
                                                <h3 className = 'text-lg font-medium'>{player.name}</h3>
                                                <p className = 'text-gray-600'>{player.position}</p>
                                            </div>
                                            <div className = 'text-sm text-gray-500'>
                                                {player.batSide === 'R' ? 'Bats: Right' : player.batSide === 'L' ? 'Bats: Left' : 'Bats: Switch'}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default PlayerList;