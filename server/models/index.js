const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();
console.log("Loaded DATABASE_URL:", process.env.DATABASE_URL ? "Present" : "Missing");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: console.log, // Enable logging for debugging
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        },
        connectTimeout: 60000, // 60 seconds
        acquireTimeout: 60000,
        timeout: 60000,
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    retry: {
        match: [
            /ETIMEDOUT/,
            /EHOSTUNREACH/,
            /ECONNRESET/,
            /ECONNREFUSED/,
            /ETIMEDOUT/,
            /ESOCKETTIMEDOUT/,
            /EHOSTUNREACH/,
            /EPIPE/,
            /EAI_AGAIN/,
            /SequelizeConnectionError/,
            /SequelizeConnectionRefusedError/,
            /SequelizeHostNotFoundError/,
            /SequelizeHostNotReachableError/,
            /SequelizeInvalidConnectionError/,
            /SequelizeConnectionTimedOutError/
        ],
        max: 3
    }
});

//test connection with better error handling
const testConnection = async () => {
    let retries = 3;
    while (retries > 0) {
        try {
            await sequelize.authenticate();
            console.log('Connection to the database has been established successfully.');
            return true;
        } catch (error) {
            console.error(`Unable to connect to the database (${retries} retries left):`, error.message);
            retries--;
            if (retries > 0) {
                console.log('Retrying in 5 seconds...');
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }
    return false;
};

//export sequelize instance
const db = {
    sequelize,
    Sequelize
};

// Import models
db.Team = require('./Team')(sequelize, Sequelize);
db.Player = require('./Player')(sequelize, Sequelize);
db.Game = require('./Game')(sequelize, Sequelize);
db.PlayerGameStat = require('./PlayerGameStat')(sequelize, Sequelize);
db.BettingLine = require('./BettingLine')(sequelize, Sequelize);
db.PlayerProp = require('./PlayerProp')(sequelize, Sequelize);
db.Prediction = require('./Prediction')(sequelize, Sequelize);

// Define associations
db.Team.hasMany(db.Player, { foreignKey: 'teamId' });
db.Player.belongsTo(db.Team, { foreignKey: 'teamId' });

db.Game.belongsTo(db.Team, { as: 'homeTeam', foreignKey: 'homeTeamId' });
db.Game.belongsTo(db.Team, { as: 'awayTeam', foreignKey: 'awayTeamId' });

db.BettingLine.belongsTo(db.Game, { foreignKey: 'gameId' });
db.Game.hasMany(db.BettingLine, { foreignKey: 'gameId' });

db.PlayerProp.belongsTo(db.Player, { foreignKey: 'playerId' });
db.PlayerProp.belongsTo(db.Game, { foreignKey: 'gameId' });
db.Player.hasMany(db.PlayerProp, { foreignKey: 'playerId' });

db.PlayerGameStat.belongsTo(db.Player, { foreignKey: 'playerId' });
db.PlayerGameStat.belongsTo(db.Game, { foreignKey: 'gameId' });
db.Player.hasMany(db.PlayerGameStat, { foreignKey: 'playerId' });
db.Game.hasMany(db.PlayerGameStat, { foreignKey: 'gameId' });

db.Prediction.belongsTo(db.Game, { foreignKey: 'gameId' });
db.Game.hasOne(db.Prediction, { foreignKey: 'gameId' });

// Initialize connection
testConnection();

module.exports = db;