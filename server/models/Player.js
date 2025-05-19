module.exports = (sequelize, DataTypes) => {
    const Player = sequelize.define('Player', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        mlbId: {
            type: DataTypes.INTEGER,
            unique: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        position: {
            type: DataTypes.STRING
        },
        batSide: {
            type: DataTypes.STRING
        },
        throwSide: {
            type: DataTypes.STRING
        },
        teamId: {
            type: DataTypes.INTEGER,
            references: {
            model: 'Teams',
            key: 'id'
            }
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        timestamps: true
    });
    return Player;
};