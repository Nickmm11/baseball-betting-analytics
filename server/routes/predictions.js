const express = require('express');
const router = express.Router();
const { Game, Team, Prediction, PlayerGameStat } = require('../models');
const { Op, fn, col } = require('sequelize');
const { spawn } = require('child_process');
const path = require('path');

// Get predictions for all upcoming games
router.get('/upcoming', async (req, res) => {
    try {
        const predictions = await Prediction.findAll({
        include: [{
            model: Game,
            where: {
            startTime: { [Op.gte]: new Date() },
            status: 'scheduled'
            },
            include: [
            { model: Team, as: 'homeTeam' },
            { model: Team, as: 'awayTeam' }
            ]
        }],
        order: [[Game, 'startTime', 'ASC']]
        });
        
        res.json(predictions);
    } catch (error) {
        console.error('Error fetching predictions:', error);
        res.status(500).json({ error: 'Failed to fetch predictions' });
    }
});

// Generate prediction for a specific game
router.post('/generate/:gameId', async (req, res) => {
    try {
        const gameId = req.params.gameId;
        
        // Check if game exists
        const game = await Game.findByPk(gameId, {
        include: [
            { model: Team, as: 'homeTeam' },
            { model: Team, as: 'awayTeam' }
        ]
        });
        
        if (!game) {
        return res.status(404).json({ error: 'Game not found' });
        }
        
        // Get team stats
        const [homeTeamStats, awayTeamStats] = await Promise.all([
        getTeamStats(game.homeTeamId),
        getTeamStats(game.awayTeamId)
        ]);
        
        if (!homeTeamStats || !awayTeamStats) {
        return res.status(400).json({ error: 'Insufficient team statistics for prediction' });
        }
        
        // Prepare features for prediction model
        const features = {
        home_team_batting_avg: homeTeamStats.battingAvg,
        home_team_era: homeTeamStats.era,
        home_team_runs_per_game: homeTeamStats.runsPerGame,
        away_team_batting_avg: awayTeamStats.battingAvg,
        away_team_era: awayTeamStats.era,
        away_team_runs_per_game: awayTeamStats.runsPerGame
        };
        
        // Call Python prediction script
        const prediction = await runPrediction(features);
        
        if (!prediction) {
        return res.status(500).json({ error: 'Failed to generate prediction' });
        }
        
        // Save prediction to database
        const [savedPrediction, created] = await Prediction.findOrCreate({
        where: { gameId },
        defaults: {
            gameId,
            predictedHomeScore: prediction.predicted_home_score,
            predictedAwayScore: prediction.predicted_away_score,
            predictedTotal: prediction.predicted_total,
            confidenceScore: prediction.confidence_score,
            model: 'basic_rf_v1'
        }
        });
        
        if (!created) {
        // Update existing prediction
        await savedPrediction.update({
            predictedHomeScore: prediction.predicted_home_score,
            predictedAwayScore: prediction.predicted_away_score,
            predictedTotal: prediction.predicted_total,
            confidenceScore: prediction.confidence_score
        });
        }
        
        res.json({
        gameId,
        prediction: savedPrediction
        });
    } catch (error) {
        console.error('Error generating prediction:', error);
        res.status(500).json({ error: 'Failed to generate prediction' });
    }
});

// Helper function to get team statistics
async function getTeamStats(teamId) {
    try {
        // Get last 20 games for the team
        const recentGames = await Game.findAll({
        where: {
            [Op.or]: [
            { homeTeamId: teamId },
            { awayTeamId: teamId }
            ],
            status: 'final'
        },
        order: [['startTime', 'DESC']],
        limit: 20
        });
        
        if (recentGames.length < 10) {
        console.warn(`Not enough recent games for team ID ${teamId}`);
        return null;
        }
        
        // Get player stats for those games
        const gameIds = recentGames.map(game => game.id);
        
        const playerStats = await PlayerGameStat.findAll({
        where: {
            gameId: { [Op.in]: gameIds }
        },
        include: [{
            model: Player,
            where: { teamId }
        }]
        });
        
        // Calculate team batting average
        const totalAtBats = playerStats.reduce((sum, stat) => sum + (stat.atBats || 0), 0);
        const totalHits = playerStats.reduce((sum, stat) => sum + (stat.hits || 0), 0);
        const battingAvg = totalAtBats > 0 ? totalHits / totalAtBats : 0;
        
        // Calculate team ERA
        const totalInningsPitched = playerStats.reduce((sum, stat) => sum + (stat.inningsPitched || 0), 0);
        const totalEarnedRuns = playerStats.reduce((sum, stat) => sum + (stat.earnedRuns || 0), 0);
        const era = totalInningsPitched > 0 ? (totalEarnedRuns / totalInningsPitched) * 9 : 0;
        
        // Calculate runs per game
        let totalRuns = 0;
        recentGames.forEach(game => {
        if (game.homeTeamId === teamId) {
            totalRuns += game.homeScore || 0;
        } else {
            totalRuns += game.awayScore || 0;
        }
        });
        
        const runsPerGame = totalRuns / recentGames.length;
        
        return {
        battingAvg,
        era,
        runsPerGame
        };
    } catch (error) {
        console.error(`Error getting team stats for team ID ${teamId}:`, error);
        return null;
    }
}

// Run Python prediction script
function runPrediction(features) {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', [
        path.join(__dirname, '../ml/predict_game.py'),
        JSON.stringify(features)
        ]);
        
        let resultData = '';
        
        pythonProcess.stdout.on('data', (data) => {
        resultData += data.toString();
        });
        
        pythonProcess.stderr.on('data', (data) => {
        console.error(`Python Error: ${data}`);
        });
        
        pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`Python process exited with code ${code}`);
            reject(new Error(`Python process exited with code ${code}`));
            return;
        }
        
        try {
            const prediction = JSON.parse(resultData);
            resolve(prediction);
        } catch (error) {
            console.error('Error parsing prediction result:', error);
            reject(error);
        }
        });
    });
}

module.exports = router;