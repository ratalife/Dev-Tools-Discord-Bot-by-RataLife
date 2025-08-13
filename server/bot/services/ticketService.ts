import { Client, ChannelType, PermissionFlagsBits, TextChannel } from 'discord.js';
import { storage } from '../../storage';

export class TicketService {
  static async createTicketChannel(client: Client, guildId: string, userId: string, username: string, type: string): Promise<TextChannel | null> {
    try {
      const guild = await client.guilds.fetch(guildId);
      if (!guild) return null;

      // Check if user already has an active ticket
      const existingTickets = await storage.getActiveTickets();
      const userTicket = existingTickets.find(ticket => ticket.userId === userId && ticket.guildId === guildId);
      
      if (userTicket) {
        // Return existing channel
        try {
          const existingChannel = await client.channels.fetch(userTicket.channelId) as TextChannel;
          if (existingChannel) return existingChannel;
        } catch (error) {
          // Channel might have been deleted, clean up the ticket
          await storage.closeTicket(userTicket.id);
        }
      }

      // Create new ticket channel
      const channelName = `ticket-${username.toLowerCase()}`;
      const channel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        topic: `Private DevTools ticket for ${username}`,
        permissionOverwrites: [
          {
            id: guild.id, // @everyone
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: userId, // ticket creator
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.AttachFiles,
            ],
          },
          {
            id: client.user!.id, // bot
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.AttachFiles,
              PermissionFlagsBits.ManageMessages,
            ],
          },
        ],
      });

      // Store ticket in database
      await storage.createTicket({
        userId,
        username,
        channelId: channel.id,
        guildId,
        type,
        status: 'active',
      });

      return channel;
    } catch (error) {
      console.error('Error creating ticket channel:', error);
      return null;
    }
  }

  static async closeTicketChannel(client: Client, channelId: string): Promise<boolean> {
    try {
      const ticket = await storage.getTicketByChannelId(channelId);
      if (!ticket) return false;

      const channel = await client.channels.fetch(channelId);
      if (channel?.isTextBased() && 'send' in channel) {
        await channel.send({
          embeds: [{
            color: 0xF04747,
            title: '🔒 Ticket Closing',
            description: 'This ticket will be automatically deleted in 10 seconds.',
            footer: { text: 'Thank you for using DevTools!' },
            timestamp: new Date().toISOString(),
          }]
        });

        // Close ticket in database
        await storage.closeTicket(ticket.id);

        // Delete channel after delay
        setTimeout(async () => {
          try {
            await channel.delete();
            console.log(`✅ Closed ticket channel: ${channelId}`);
          } catch (error) {
            console.error(`Error deleting channel ${channelId}:`, error);
          }
        }, 10000);

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error closing ticket channel:', error);
      return false;
    }
  }
}
