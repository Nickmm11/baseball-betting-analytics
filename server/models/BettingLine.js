module.exports = (sequelize, DataTypes) => {
    const BettingLine = sequelize.define('BettingLine', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        gameId: {
            type: DataTypes.INTEGER,
            references: {
            model: 'Games',
            key: 'id'
            }
        },
        sportsbook: {
            type: DataTypes.STRING,
            allowNull: false
        },
        homeMoneyline: {
            type: DataTypes.INTEGER
        },
        awayMoneyline: {
            type: DataTypes.INTEGER
        },
        homeSpread: {
            type: DataTypes.FLOAT
        },
        homeSpreadOdds: {
            type: DataTypes.INTEGER
        },
        awaySpread: {
            type: DataTypes.FLOAT
        },
        awaySpreadOdds: {
            type: DataTypes.INTEGER
        },
        overUnder: {
            type: DataTypes.FLOAT
        },
        overOdds: {
            type: DataTypes.INTEGER
        },
        underOdds: {
            type: DataTypes.INTEGER
        }
    }, {
        timestamps: true
    });
    return BettingLine;
};