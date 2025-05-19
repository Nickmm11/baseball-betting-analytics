module.exports = (sequelize, DataTypes) => {
    const Prediction = sequelize.define('Prediction', {
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
        predictedHomeScore: {
            type: DataTypes.FLOAT
        },
        predictedAwayScore: {
            type: DataTypes.FLOAT
        },
        predictedTotal: {
            type: DataTypes.FLOAT
        },
        confidenceScore: {
            type: DataTypes.FLOAT
        },
        model: {
            type: DataTypes.STRING
        }
    }, {
        timestamps: true
    });
    return Prediction;
};