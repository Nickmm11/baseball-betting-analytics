module.exports = (sequelize, DataTypes) => {
    const PlayerGameStat = sequelize.define('PlayerGameStat', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        playerId: {
            type: DataTypes.INTEGER,
            references: {
            model: 'Players',
            key: 'id'
            }
        },
        gameId: {
            type: DataTypes.INTEGER,
            references: {
            model: 'Games',
            key: 'id'
            }
        },
        atBats: {
            type: DataTypes.INTEGER
        },
        hits: {
            type: DataTypes.INTEGER
        },
        runs: {
            type: DataTypes.INTEGER
        },
        rbi: {
            type: DataTypes.INTEGER
        },
        homeRuns: {
            type: DataTypes.INTEGER
        },
        strikeouts: {
            type: DataTypes.INTEGER
        },
        walks: {
            type: DataTypes.INTEGER
        },
        stolenBases: {
            type: DataTypes.INTEGER
        },
        pitchCount: {
            type: DataTypes.INTEGER
        },
        inningsPitched: {
            type: DataTypes.FLOAT
        },
        earnedRuns: {
            type: DataTypes.INTEGER
        },
        battersFaced: {
            type: DataTypes.INTEGER
        },
        hitsAllowed: {
            type: DataTypes.INTEGER
        },
        pitchingStrikeouts: {
            type: DataTypes.INTEGER
        }
    }, {
        timestamps: true
    });
    return PlayerGameStat;
};