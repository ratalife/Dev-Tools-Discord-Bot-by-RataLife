import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import { devtoolsCommand } from './commands/devtools';
import { handleInteraction } from './handlers/interactionHandler';

const TOKEN = process.env.DISCORD_BOT_TOKEN || 'MTQwNTA1NjYwODkyODY2NTcwMw.GATM7b.SMtLA9NehVvkUT3Y-_cAcTFj8srL2zE6dbhHyg';
const CLIENT_ID = '1405056608928665703';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
  ],
});

const commands = [devtoolsCommand.toJSON()];

const rest = new REST({ version: '10' }).setToken(TOKEN);

async function deployCommands() {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(CLIENT_ID), {
      body: commands,
    });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error deploying commands:', error);
  }
}

client.once('ready', async () => {
  console.log(`✅ Bot is ready! Logged in as ${client.user?.tag}`);
  console.log(`🔗 Invite link: https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&permissions=8&scope=bot%20applications.commands`);
  
  await deployCommands();
  
  // Set bot status
  client.user?.setActivity('🛠️ /devtools | Dev by RataLife', { type: 2 });
});

client.on('interactionCreate', handleInteraction);

// Cleanup inactive tickets every hour
setInterval(async () => {
  const { storage } = await import('../storage');
  const tickets = await storage.getActiveTickets();
  
  for (const ticket of tickets) {
    const createdAt = new Date(ticket.createdAt!);
    const now = new Date();
    const hoursSinceCreated = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    
    // Close tickets older than 24 hours
    if (hoursSinceCreated > 24) {
      try {
        const channel = await client.channels.fetch(ticket.channelId);
        if (channel?.isTextBased()) {
          await channel.delete();
        }
        await storage.closeTicket(ticket.id);
        console.log(`🧹 Cleaned up inactive ticket: ${ticket.channelId}`);
      } catch (error) {
        console.error(`Error cleaning up ticket ${ticket.id}:`, error);
      }
    }
  }
}, 60 * 60 * 1000); // Run every hour

client.login(TOKEN);

export { client };
