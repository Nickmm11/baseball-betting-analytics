import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
    return (
        <div className = 'home-page'>
            <div className = 'hero-section bg-gray-100 p-8 rounded-lg shadow-sm mb-8'>
                <h1 className = 'text-3xl font-bold mb-4'>Baseball Betting Analytics Platform</h1>
                <p className = 'text-xl text-gray-700 mb-6'>
                    Make smarter data driven insights on player performance, team matchups, and betting lines
                </p>
                <div className = 'flex space-x-4'>
                    <Link to = '/games' className = 'px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition'>View Today's Games</Link>
                    <Link to = '/players' className = 'px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition'>Browse Players</Link>
                </div>
            </div>

            <div className = 'features grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
                <div className = 'features-card bg-white p-6 rounded-lg shadow-sm'>
                    <h2 className = 'text-xl font-bold mb-3'>Live Betting Lines</h2>
                    <p className = 'text-gray-700'>
                        Track real time odds from various sportsbooks and make informed betting decisions.
                    </p>
                </div>

                <div className = 'feature-card bg-white p-6 rounded-lg shadow-sm'>
                    <h2 className = 'text-xl font-bold mb-3'>Player Performance</h2>
                    <p className = 'text-gray-700'>
                        Analyze how players perform against betting lines with detailed statistics
                    </p>
                </div>

                <div className = 'feature-card bg-white p-6  rounded-lg shadow-sm'>
                    <h2 className = 'text-xl font-bold mb-3'>Game Predictions</h2>
                    <p className = 'text-gray-700'>
                        See ML-Powered predictions for upcoming games and player props.
                    </p>
                </div>
            </div>

            <div className = 'getting-started bg-white p-6 rounded lg-shadow shadow-sm'>
                <h2 className = 'text-2xl font-bold mb-4'>Getting Started</h2>
                <ol className = 'list-decimal pl-6 mb-4 space-y-2'>
                    <li>Browse today's <Link to = '/games' className = 'text-blue-600 hover:underline'>game schedule</Link></li>
                    <li>Select a game to view detailed analysis and betting lines</li>
                    <li>Check a player prop performance histories</li>
                    <li>Make informed betting decisions based on the data</li>
                </ol>
            </div>
        </div>
    );
};

export default HomePage;