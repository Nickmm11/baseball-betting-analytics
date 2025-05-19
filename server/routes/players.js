const express = require('express');
const router = express.Router();
const { Player, Team, PlayerGameStat, Game, PlayerProp } = require('../models');
const { Op, literal, fn, col } = require('sequelize');

// Get all active players
router.get('/', async (req, res) => {
    try {
        const players = await Player.findAll({
        where: { active: true },
        include: [{ model: Team }],
        order: [['name', 'ASC']]
        });
        
        res.json(players);
    } catch (error) {
        console.error('Error fetching players:', error);
        res.status(500).json({ error: 'Failed to fetch players' });
    }
});

// Get player by ID with recent stats
router.get('/:id', async (req, res) => {
    try {
        const player = await Player.findByPk(req.params.id, {
        include: [
            { model: Team },
            {
            model: PlayerGameStat,
            include: [{ model: Game }],
            limit: 10,
            order: [[Game, 'startTime', 'DESC']]
            }
        ]
        });
        
        if (!player) {
        return res.status(404).json({ error: 'Player not found' });
        }
        
        // Calculate prop performance
        const propPerformance = await PlayerProp.findAll({
        attributes: [
            'propType',
            [fn('COUNT', col('id')), 'totalGames'],
            [fn('SUM', literal('CASE WHEN "hitOver" = true THEN 1 ELSE 0 END')), 'hitOvers'],
            [fn('AVG', col('result')), 'average']
        ],
        where: {
            playerId: player.id,
            result: { [Op.ne]: null }
        },
        group: ['propType']
        });
        
        // Format the performance data
        const formattedPerformance = {};
        propPerformance.forEach(prop => {
        const propData = prop.toJSON();
        formattedPerformance[propData.propType] = {
            totalGames: parseInt(propData.totalGames),
            hitOvers: parseInt(propData.hitOvers),
            overRate: parseInt(propData.hitOvers) / parseInt(propData.totalGames),
            average: parseFloat(propData.average)
        };
        });
        
        res.json({
        ...player.toJSON(),
        propPerformance: formattedPerformance
        });
    } catch (error) {
        console.error('Error fetching player:', error);
        res.status(500).json({ error: 'Failed to fetch player details' });
    }
});

// Get player prop history
router.get('/:id/props', async (req, res) => {
    try {
        const propType = req.query.type || null;
        const whereClause = {
        playerId: req.params.id
        };
        
        if (propType) {
        whereClause.propType = propType;
        }
        
        const props = await PlayerProp.findAll({
        where: whereClause,
        include: [{
            model: Game,
            include: [
            { model: Team, as: 'homeTeam' },
            { model: Team, as: 'awayTeam' }
            ]
        }],
        order: [[Game, 'startTime', 'DESC']]
        });
        
        res.json(props);
    } catch (error) {
        console.error('Error fetching player props:', error);
        res.status(500).json({ error: 'Failed to fetch player prop history' });
    }
});

module.exports = router;