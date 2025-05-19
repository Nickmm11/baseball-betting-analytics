// server/scripts/seed.js
const axios = require('axios');
const { Team, Player } = require('../models');

const seedTeams = async () => {
    try {
        const response = await axios.get('https://statsapi.mlb.com/api/v1/teams?sportId=1');
        const teams = response.data.teams;
        
        for (const team of teams) {
        await Team.create({
            mlbId: team.id,
            name: team.name,
            abbreviation: team.abbreviation || team.teamName,
            city: team.locationName,
            division: team.division?.name,
            league: team.league?.name
        });
        }
        
        console.log(`Seeded ${teams.length} teams successfully.`);
        return teams;
    } catch (error) {
        console.error('Error seeding teams:', error);
        throw error;
    }
};

const seedPlayers = async (teams) => {
    try {
        let playerCount = 0;
        
        for (const team of teams) {
        const response = await axios.get(`https://statsapi.mlb.com/api/v1/teams/${team.id}/roster?rosterType=active`);
        const roster = response.data.roster || [];
        
        for (const player of roster) {
            const playerDetail = await axios.get(`https://statsapi.mlb.com/api/v1/people/${player.person.id}`);
            const playerData = playerDetail.data.people[0];
            
            const teamDb = await Team.findOne({ where: { mlbId: team.id } });
            
            if (teamDb) {
            await Player.create({
                mlbId: playerData.id,
                name: playerData.fullName,
                position: playerData.primaryPosition?.abbreviation,
                batSide: playerData.batSide?.code,
                throwSide: playerData.pitchHand?.code,
                teamId: teamDb.id,
                active: true
            });
            
            playerCount++;
            }
        }
        }
        
        console.log(`Seeded ${playerCount} players successfully.`);
    } catch (error) {
        console.error('Error seeding players:', error);
        throw error;
    }
};

const runSeed = async () => {
    try {
        const teams = await seedTeams();
        await seedPlayers(teams);
        console.log('Database seeding completed.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

runSeed();