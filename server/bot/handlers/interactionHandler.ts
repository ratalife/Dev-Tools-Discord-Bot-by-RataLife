import { 
  Interaction, 
  ChatInputCommandInteraction, 
  StringSelectMenuInteraction, 
  ButtonInteraction,
  Message,
  AttachmentBuilder
} from 'discord.js';
import { TicketService } from '../services/ticketService';
import { ConversionService } from '../services/conversionService';
import { 
  createWelcomeEmbed, 
  createSelectionMenu, 
  createActionButtons,
  createAOBConversionEmbed,
  createFileUploadEmbed,
  createConversionResultEmbed,
  createResultButtons,
  createConversionButtons
} from '../utils/embedBuilder';
import { storage } from '../../storage';

const userSessions = new Map<string, { 
  type: string; 
  channelId: string; 
  lastResult?: string;
  waitingFor?: 'aob_input' | 'file_upload';
}>();

export async function handleInteraction(interaction: Interaction) {
  try {
    if (interaction.isChatInputCommand()) {
      await handleSlashCommand(interaction);
    } else if (interaction.isStringSelectMenu()) {
      await handleSelectMenu(interaction);
    } else if (interaction.isButton()) {
      await handleButton(interaction);
    }
  } catch (error) {
    console.error('Error handling interaction:', error);
    
    if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: '❌ An error occurred while processing your request.',
        ephemeral: true
      });
    }
  }
}

async function handleSlashCommand(interaction: ChatInputCommandInteraction) {
  if (interaction.commandName === 'devtools') {
    await interaction.deferReply({ ephemeral: true });

    const ticketChannel = await TicketService.createTicketChannel(
      interaction.client,
      interaction.guildId!,
      interaction.user.id,
      interaction.user.username,
      'general'
    );

    if (!ticketChannel) {
      await interaction.editReply({
        content: '❌ Failed to create ticket channel. Please try again.'
      });
      return;
    }

    await interaction.editReply({
      content: `✅ Your private DevTools session has been created: ${ticketChannel}`
    });

    // Send welcome message to ticket channel
    await ticketChannel.send({
      embeds: [createWelcomeEmbed()],
      components: [createSelectionMenu(), createActionButtons()]
    });

    // Set up message listener for this channel
    setupMessageListener(interaction.client, ticketChannel.id);
  }
}

async function handleSelectMenu(interaction: StringSelectMenuInteraction) {
  if (interaction.customId === 'devtools_selection') {
    const selectedType = interaction.values[0];
    
    // Store user session
    userSessions.set(interaction.user.id, {
      type: selectedType,
      channelId: interaction.channelId!
    });

    await interaction.reply({
      content: `✅ Selected: **${getTypeDisplayName(selectedType)}**`,
      ephemeral: true
    });
  }
}

async function handleButton(interaction: ButtonInteraction) {
  const session = userSessions.get(interaction.user.id);
  
  if (interaction.customId === 'proceed_selection') {
    if (!session) {
      await interaction.reply({
        content: '❌ Please select a conversion type first.',
        ephemeral: true
      });
      return;
    }

    await interaction.deferReply();

    switch (session.type) {
      case 'aob_conversion':
        session.waitingFor = 'aob_input';
        userSessions.set(interaction.user.id, session);
        
        await interaction.editReply({
          embeds: [createAOBConversionEmbed()],
          components: [createConversionButtons()]
        });
        break;

      case 'image_conversion':
        session.waitingFor = 'file_upload';
        userSessions.set(interaction.user.id, session);
        
        await interaction.editReply({
          embeds: [createFileUploadEmbed('image')]
        });
        break;

      case 'font_conversion':
        session.waitingFor = 'file_upload';
        userSessions.set(interaction.user.id, session);
        
        await interaction.editReply({
          embeds: [createFileUploadEmbed('font')]
        });
        break;

      case 'source_processing':
        session.waitingFor = 'file_upload';
        userSessions.set(interaction.user.id, session);
        
        await interaction.editReply({
          embeds: [{
            color: 0x9B59B6,
            title: '💾 Source Code Processing',
            description: 'Upload your C# file and I\'ll extract the bone offsets for you.',
            fields: [
              {
                name: 'Supported Files',
                value: '.cs files',
                inline: true
              }
            ],
            footer: { text: 'Upload your .cs file in the next message' }
          }]
        });
        break;
    }
  } else if (interaction.customId === 'close_ticket') {
    await interaction.deferReply();
    
    const success = await TicketService.closeTicketChannel(
      interaction.client,
      interaction.channelId!
    );

    if (success) {
      await interaction.editReply({
        content: '🔒 Ticket is being closed...'
      });
      
      // Clean up session
      userSessions.delete(interaction.user.id);
    } else {
      await interaction.editReply({
        content: '❌ Failed to close ticket.'
      });
    }
  } else if (interaction.customId === 'copy_result') {
    if (session?.lastResult) {
      await interaction.reply({
        content: `📋 **Result copied to clipboard:**\n\`\`\`${session.lastResult.length > 1000 ? session.lastResult.substring(0, 1000) + '...' : session.lastResult}\`\`\``,
        ephemeral: true
      });
    } else {
      await interaction.reply({
        content: '❌ No result to copy.',
        ephemeral: true
      });
    }
  } else if (interaction.customId === 'download_result') {
    if (session?.lastResult) {
      const filename = `DevTools_${session.type}_${Date.now()}.txt`;
      const attachment = new AttachmentBuilder(Buffer.from(session.lastResult), { name: filename });
      
      await interaction.reply({
        content: '💾 **Download ready:**',
        files: [attachment],
        ephemeral: true
      });
    } else {
      await interaction.reply({
        content: '❌ No result to download.',
        ephemeral: true
      });
    }
  }
}

function setupMessageListener(client: any, channelId: string) {
  const messageHandler = async (message: Message) => {
    if (message.channelId !== channelId || message.author.bot) return;
    
    const session = userSessions.get(message.author.id);
    if (!session || session.channelId !== channelId) return;

    try {
      if (session.waitingFor === 'aob_input') {
        // Handle AOB/Byte conversion
        const input = message.content.trim();
        
        // Auto-detect format and convert
        let result;
        if (input.includes('0x') || input.includes("'?'")) {
          // Looks like Byte format, convert to AOB
          result = ConversionService.convertByteToAob(input);
        } else {
          // Assume AOB format, convert to Byte
          result = ConversionService.convertAobToByte(input);
        }

        if (result.error) {
          await message.reply({
            embeds: [{
              color: 0xF04747,
              title: '❌ Conversion Error',
              description: result.error,
              footer: { text: 'Please check your input and try again' }
            }]
          });
        } else {
          session.lastResult = result.result;
          userSessions.set(message.author.id, session);
          
          await message.reply({
            embeds: [createConversionResultEmbed(result.result, 'code conversion')],
            components: [createResultButtons()]
          });
        }
        
        session.waitingFor = undefined;
        userSessions.set(message.author.id, session);
        
      } else if (session.waitingFor === 'file_upload') {
        // Handle file upload
        if (message.attachments.size === 0) {
          await message.reply({
            embeds: [{
              color: 0xF04747,
              title: '❌ No File Attached',
              description: 'Please attach a file to convert.',
            }]
          });
          return;
        }

        const attachment = message.attachments.first()!;
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        if (attachment.size > maxSize) {
          await message.reply({
            embeds: [{
              color: 0xF04747,
              title: '❌ File Too Large',
              description: 'File size must be under 10MB.',
            }]
          });
          return;
        }

        try {
          const response = await fetch(attachment.url);
          const buffer = Buffer.from(await response.arrayBuffer());
          let result;

          if (session.type === 'source_processing') {
            // Handle C# file processing
            const content = buffer.toString('utf-8');
            result = ConversionService.extractOffsetsFromCS(content);
          } else {
            // Handle image/font conversion
            const fileType = session.type === 'image_conversion' ? 'image' : 'font';
            result = await ConversionService.convertFileToByteArray(buffer, attachment.name, fileType);
          }

          if (result.error) {
            await message.reply({
              embeds: [{
                color: 0xF04747,
                title: '❌ Conversion Error',
                description: result.error,
              }]
            });
          } else {
            session.lastResult = result.result;
            userSessions.set(message.author.id, session);
            
            const typeName = session.type.replace('_', ' ');
            await message.reply({
              embeds: [createConversionResultEmbed(result.result, typeName)],
              components: [createResultButtons()]
            });
          }
          
        } catch (error) {
          await message.reply({
            embeds: [{
              color: 0xF04747,
              title: '❌ Processing Error',
              description: 'Failed to process the uploaded file.',
            }]
          });
        }
        
        session.waitingFor = undefined;
        userSessions.set(message.author.id, session);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      await message.reply({
        embeds: [{
          color: 0xF04747,
          title: '❌ Processing Error',
          description: 'An error occurred while processing your request.',
        }]
      });
    }
  };

  client.on('messageCreate', messageHandler);
  
  // Clean up listener after 24 hours
  setTimeout(() => {
    client.off('messageCreate', messageHandler);
  }, 24 * 60 * 60 * 1000);
}

function getTypeDisplayName(type: string): string {
  const typeMap: Record<string, string> = {
    'aob_conversion': 'AOB ↔ Byte Conversion',
    'image_conversion': 'Image to Byte Array',
    'font_conversion': 'Font to Byte Array',
    'source_processing': 'Source Code Processing'
  };
  
  return typeMap[type] || type;
}
