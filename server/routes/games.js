const express = require('express');
const router = express.Router();
const { Game, Team, BettingLine, Prediction } = require('../models');
const { Op } = require('sequelize');

// Get upcoming games with betting lines
router.get('/upcoming', async (req, res) => {
    try {
        const games = await Game.findAll({
        where: {
            startTime: {
            [Op.gte]: new Date()
            },
            status: 'scheduled'
        },
        include: [
            {
            model: Team,
            as: 'homeTeam'
            },
            {
            model: Team,
            as: 'awayTeam'
            },
            {
            model: BettingLine,
            order: [['createdAt', 'DESC']],
            limit: 1
            },
            {
            model: Prediction
            }
        ],
        order: [['startTime', 'ASC']]
        });
        
        res.json(games);
    } catch (error) {
        console.error('Error fetching upcoming games:', error);
        res.status(500).json({ error: 'Failed to fetch upcoming games' });
    }
});

// Get game by ID with details
router.get('/:id', async (req, res) => {
    try {
        const game = await Game.findByPk(req.params.id, {
        include: [
            {
            model: Team,
            as: 'homeTeam'
            },
            {
            model: Team,
            as: 'awayTeam'
            },
            {
            model: BettingLine,
            order: [['createdAt', 'DESC']]
            },
            {
            model: Prediction
            }
        ]
        });
        
        if (!game) {
        return res.status(404).json({ error: 'Game not found' });
        }
        
        res.json(game);
    } catch (error) {
        console.error('Error fetching game:', error);
        res.status(500).json({ error: 'Failed to fetch game details' });
    }
});

module.exports = router;