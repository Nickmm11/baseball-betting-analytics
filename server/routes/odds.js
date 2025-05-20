const express = require('express');
const router = express.Router();
const { BettingLine, Game, Player, PlayerProp, Team } = require('../models');

// Get latest odds for a specific game
router.get('/game/:gameId', async (req, res) => {
    try {
        const gameId = req.params.gameId;
        
        const odds = await BettingLine.findAll({
        where: { gameId },
        order: [['createdAt', 'DESC']],
        limit: 10
        });
        
        res.json(odds);
    } catch (error) {
        console.error('Error fetching game odds:', error);
        res.status(500).json({ error: 'Failed to fetch game odds' });
    }
});

// Get props for a specific game
router.get('/game-props/:gameId', async (req, res) => {
    try {
        const gameId = req.params.gameId;
        
        const props = await PlayerProp.findAll({
        where: { gameId },
        include: [{
            model: Player,
            include: [{ model: Team }]
        }]
        });
        
        res.json(props);
    } catch (error) {
        console.error('Error fetching game props:', error);
        res.status(500).json({ error: 'Failed to fetch game props' });
    }
});

module.exports = router;