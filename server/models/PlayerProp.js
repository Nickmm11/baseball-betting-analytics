module.exports = (sequelize, DataTypes) => {
    const PlayerProp = sequelize.define('PlayerProp', {
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
        sportsbook: {
            type: DataTypes.STRING,
            allowNull: false
        },
        propType: {
            type: DataTypes.STRING,
            allowNull: false
        },
        line: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        overOdds: {
            type: DataTypes.INTEGER
        },
        underOdds: {
            type: DataTypes.INTEGER
        },
        result: {
            type: DataTypes.FLOAT
        },
        hitOver: {
            type: DataTypes.BOOLEAN
        }
    }, {
        timestamps: true
    });
    return PlayerProp;
};