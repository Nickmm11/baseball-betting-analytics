const express = require('express');
const router = express.Router();
const { Team, Player } = require('../models');

// Get all teams
router.get('/', async (req, res) => {
    try {
        const teams = await Team.findAll({
        order: [['name', 'ASC']]
        });
        
        res.json(teams);
    } catch (error) {
        console.error('Error fetching teams:', error);
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
});

// Get team by ID with players
router.get('/:id', async (req, res) => {
    try {
        const team = await Team.findByPk(req.params.id, {
        include: [{
            model: Player,
            where: { active: true }
        }]
        });
        
        if (!team) {
        return res.status(404).json({ error: 'Team not found' });
        }
        
        res.json(team);
    } catch (error) {
        console.error('Error fetching team:', error);
        res.status(500).json({ error: 'Failed to fetch team details' });
    }
});

module.exports = router;