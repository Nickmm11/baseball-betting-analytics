const { sequelize } = require('../models');
const { Team, Player, Game, BettingLine } = require('../models');
const axios = require('axios');

const setupDatabase = async () => {
    try {
        console.log('Setting up database...');
        
        // Test connection first
        await sequelize.authenticate();
        console.log('Database connection successful');
        
        // Sync database (create tables)
        console.log('Creating/updating database tables...');
        await sequelize.sync({ alter: true }); // Use alter instead of force to preserve data
        console.log('Database tables created/updated successfully');
        
        // Check if we have any teams
        const teamCount = await Team.count();
        console.log(`Current teams in database: ${teamCount}`);
        
        if (teamCount === 0) {
            console.log('No teams found, seeding teams...');
            await seedTeams();
        } else {
            console.log('Teams already exist in database');
        }
        
        // Check if we have any players
        const playerCount = await Player.count();
        console.log(`Current players in database: ${playerCount}`);
        
        if (playerCount === 0) {
            console.log('No players found, seeding players...');
            await seedPlayers();
        } else {
            console.log('Players already exist in database');
        }
        
        console.log('Database setup completed successfully!');
        
    } catch (error) {
        console.error('Database setup failed:', error);
        throw error;
    }
};

const seedTeams = async () => {
    try {
        console.log('Fetching MLB teams...');
        const response = await axios.get('https://statsapi.mlb.com/api/v1/teams?sportId=1');
        const teams = response.data.teams;
        
        console.log(`Creating ${teams.length} teams...`);
        
        for (const team of teams) {
            await Team.findOrCreate({
                where: { mlbId: team.id },
                defaults: {
                    mlbId: team.id,
                    name: team.name,
                    abbreviation: team.abbreviation || team.teamName,
                    city: team.locationName,
                    division: team.division?.name,
                    league: team.league?.name
                }
            });
        }
        
        console.log(`Successfully seeded ${teams.length} teams`);
        return teams;
    } catch (error) {
        console.error('Error seeding teams:', error);
        throw error;
    }
};

const seedPlayers = async () => {
    try {
        const teams = await Team.findAll();
        console.log(`Fetching players for ${teams.length} teams...`);
        
        let playerCount = 0;
        
        for (const team of teams) {
            try {
                console.log(`🔄 Fetching roster for ${team.name}...`);
                const response = await axios.get(`https://statsapi.mlb.com/api/v1/teams/${team.mlbId}/roster?rosterType=active`);
                const roster = response.data.roster || [];
                
                for (const player of roster) {
                    try {
                        const playerDetail = await axios.get(`https://statsapi.mlb.com/api/v1/people/${player.person.id}`);
                        const playerData = playerDetail.data.people[0];
                        
                        await Player.findOrCreate({
                            where: { mlbId: playerData.id },
                            defaults: {
                                mlbId: playerData.id,
                                name: playerData.fullName,
                                position: playerData.primaryPosition?.abbreviation,
                                batSide: playerData.batSide?.code,
                                throwSide: playerData.pitchHand?.code,
                                teamId: team.id,
                                active: true
                            }
                        });
                        
                        playerCount++;
                        
                        // Add a small delay to avoid overwhelming the API
                        await new Promise(resolve => setTimeout(resolve, 100));
                        
                    } catch (playerError) {
                        console.warn(`Could not fetch details for player ${player.person.id}:`, playerError.message);
                    }
                }
                
                // Add delay between teams
                await new Promise(resolve => setTimeout(resolve, 500));
                
            } catch (teamError) {
                console.warn(`Could not fetch roster for team ${team.name}:`, teamError.message);
            }
        }
        
        console.log(`Successfully seeded ${playerCount} players`);
    } catch (error) {
        console.error('Error seeding players:', error);
        throw error;
    }
};

// Run setup if this file is executed directly
if (require.main === module) {
    setupDatabase()
        .then(() => {
            console.log('Setup completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Setup failed:', error);
            process.exit(1);
        });
}

module.exports = {
    setupDatabase,
    seedTeams,
    seedPlayers
};