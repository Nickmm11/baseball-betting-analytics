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
app.use('/api/predictions', require('./routes/predictions'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/odds', require('./routes/odds'));

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        await sequelize.authenticate();
        res.json({ status: 'healthy', database: 'connected' });
    } catch (error) {
        res.status(500).json({ status: 'unhealthy', database: 'disconnected', error: error.message });
    }
});

// Schedule odds updates - but only if database is connected
let oddsUpdateJob = null;

const startScheduledJobs = () => {
    if (oddsUpdateJob) {
        oddsUpdateJob.stop();
    }
    
    oddsUpdateJob = cron.schedule('*/15 * * * *', async () => {
        console.log('Running scheduled odds update...');
        try {
            await fetchAndStoreGameOdds();
        } catch (error) {
            console.error('Error in scheduled odds update:', error);
        }
    }, {
        scheduled: false // Don't start immediately
    });
    
    console.log('Scheduled jobs configured (will start after DB connection)');
};

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build/index.html'));
    });
}

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    // Start the HTTP server first
    const server = app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });

    // Test database connection
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
        
        // Only start scheduled jobs if database is connected
        startScheduledJobs();
        if (oddsUpdateJob) {
            oddsUpdateJob.start();
            console.log('Scheduled jobs started');
        }
    } catch (error) {
        console.error('Unable to connect to the database:', error.message);
        console.log('Server running without database connection');
        console.log('Scheduled jobs will not run until database is connected');
    }

    return server;
};

startServer().catch(console.error);