const axios = require('axios');
const { BettingLine, Game, Team, PlayerProp, Player } = require('../models');
require('dotenv').config();

const ODDS_API_KEY = process.env.ODDS_API_KEY;

const fetchAndStoreGameOdds = async () => {
    try {
        console.log('Fetching current MLB game odds...');
        const response = await axios.get(
        `https://api.the-odds-api.com/v4/sports/baseball_mlb/odds`,
        {
            params: {
            apiKey: ODDS_API_KEY,
            regions: 'us',
            markets: 'h2h,spreads,totals',
            oddsFormat: 'american'
            }
        }
        );
        
        const games = response.data;
        
        for (const gameOdds of games) {
        // Find or create game
        const homeTeam = await Team.findOne({
            where: { name: gameOdds.home_team }
        });
        
        const awayTeam = await Team.findOne({
            where: { name: gameOdds.away_team }
        });
        
        if (!homeTeam || !awayTeam) {
            console.warn(`Could not find teams for game: ${gameOdds.home_team} vs ${gameOdds.away_team}`);
            continue;
        }
        
        let game = await Game.findOne({
            where: {
            homeTeamId: homeTeam.id,
            awayTeamId: awayTeam.id,
            startTime: new Date(gameOdds.commence_time)
            }
        });
        
        if (!game) {
            game = await Game.create({
            homeTeamId: homeTeam.id,
            awayTeamId: awayTeam.id,
            startTime: new Date(gameOdds.commence_time),
            status: 'scheduled',
            season: new Date().getFullYear()
            });
        }
        
        // Store odds for each sportsbook
        for (const bookmaker of gameOdds.bookmakers) {
            let homeMoneyline = null;
            let awayMoneyline = null;
            let homeSpread = null;
            let homeSpreadOdds = null;
            let awaySpread = null;
            let awaySpreadOdds = null;
            let overUnder = null;
            let overOdds = null;
            let underOdds = null;
            
            // Process markets
            for (const market of bookmaker.markets) {
            if (market.key === 'h2h') {
                // Moneyline odds
                for (const outcome of market.outcomes) {
                if (outcome.name === gameOdds.home_team) {
                    homeMoneyline = outcome.price;
                } else {
                    awayMoneyline = outcome.price;
                }
                }
            } else if (market.key === 'spreads') {
                // Spread odds
                for (const outcome of market.outcomes) {
                if (outcome.name === gameOdds.home_team) {
                    homeSpread = outcome.point;
                    homeSpreadOdds = outcome.price;
                } else {
                    awaySpread = outcome.point;
                    awaySpreadOdds = outcome.price;
                }
                }
            } else if (market.key === 'totals') {
                // Over/under odds
                overUnder = market.outcomes[0].point;
                
                for (const outcome of market.outcomes) {
                if (outcome.name === 'Over') {
                    overOdds = outcome.price;
                } else {
                    underOdds = outcome.price;
                }
                }
            }
            }
            
            // Store the betting line
            await BettingLine.create({
            gameId: game.id,
            sportsbook: bookmaker.key,
            homeMoneyline,
            awayMoneyline,
            homeSpread,
            homeSpreadOdds,
            awaySpread,
            awaySpreadOdds,
            overUnder,
            overOdds,
            underOdds
            });
        }
        }
        
        console.log(`Updated odds for ${games.length} games`);
        return games.length;
    } catch (error) {
        console.error('Error fetching and storing odds:', error);
        throw error;
    }
};

module.exports = {
    fetchAndStoreGameOdds
};