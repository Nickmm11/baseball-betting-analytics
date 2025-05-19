module.exports = (sequelize, DataTypes) => {
    const Team = sequelize.define('Team', {
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
        abbreviation: {
            type: DataTypes.STRING,
            allowNull: false
        },
        city: {
            type: DataTypes.STRING
        },
        division: {
            type: DataTypes.STRING
        },
        league: {
            type: DataTypes.STRING
        }
    }, {
        timestamps: true
    });
    return Team;
}