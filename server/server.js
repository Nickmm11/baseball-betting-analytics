const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models');
const { fetchAndStoreGameOdds } = require('./services/oddsService');
const cron = require('node-cron');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/games', require('./routes/games'));
app.use('/api/players', require('./routes/players'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/odds', require('./routes/odds'));
app.use('/api/predictions', require('./routes/predictions'));

// Schedule odds updates
cron.schedule('*/15 * * * *', async () => {
    console.log('Running scheduled odds update...');
    try {
        await fetchAndStoreGameOdds();
    } catch (error) {
        console.error('Error in scheduled odds update:', error);
    }
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build/index.html'));
    });
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    
    // Test database connection
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
});