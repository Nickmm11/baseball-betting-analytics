module.exports = (sequelize, DataTypes) => {
    const Game = sequelize.define('Game', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        mlbId: {
            type: DataTypes.INTEGER,
            unique: true
        },
        homeTeamId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Teams',
                key: 'id'
            }
        },
        awayTeamId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Teams',
                key: 'id'
            }
        },
        startTime: {
            type: DataTypes.DATE,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('scheduled', 'in_progress', 'final'),
            defaultValue: 'scheduled'
        },
        homeScore: {
            type: DataTypes.INTEGER
        },
        awayScore: {
            type: DataTypes.INTEGER,
        },
        weather: {
            type: DataTypes.JSONB
        },
        venue: {
            type: DataTypes.STRING
        },
        season: {
            type: DataTypes.STRING
        }
    }, {
        timestamps: true
    });
    return Game;
};