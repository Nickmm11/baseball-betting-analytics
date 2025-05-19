const axios = require('axios');
require('dotenv').config();

const ODDS_API_KEY = process.env.ODDS_API_KEY;
const MLB_API_BASE_URL = 'https://statsapi.mlb.com/api/v1';

//get current betting odds
const getCurrentOdds = async () => {
    try {
        const response = await axios.get(`https://api.the-odds-api.com/v4/sports/baseball_mlb/odds`, {
            params: {
                apiKey: ODDS_API_KEY,
                regions: 'us',
                markets: 'h2h,spreads,totals',
                oddsFormat: 'american'
            }
        }
    );
    return response.data;
    } catch (error) {
    console.error('Error fetching current odds:', error);
    throw error;
    }
};

//get player stats
const getPlayerStats = async (playerId) => {
    try {
        const response = await axios.get(`${MLB_API_BASE_URL}/people/${playerId}/stats/gameLog?season=2024&group=hitting`);
        return response.data;
    } catch (error) {
        console.error('Error fetching player stats:', error);
        throw error;
    }
};

module.exports = {
    getCurrentOdds,
    getPlayerStats
};