import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export function createWelcomeEmbed() {
  return new EmbedBuilder()
    .setColor('#5865F2')
    .setTitle('🛠️ Welcome to DevTools!')
    .setDescription('This is your private ticket channel. Use the menu below to select what you need help with.')
    .setFooter({ text: 'Dev by RataLife' })
    .setTimestamp();
}

export function createSelectionMenu() {
  return new ActionRowBuilder<StringSelectMenuBuilder>()
    .addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('devtools_selection')
        .setPlaceholder('🔄 Choose a conversion type...')
        .addOptions([
          {
            label: 'AOB ↔ Byte Conversion',
            description: 'Convert between AOB and Byte formats',
            value: 'aob_conversion',
            emoji: '📊'
          },
          {
            label: 'Image to Byte Array',
            description: 'Convert images to byte arrays',
            value: 'image_conversion',
            emoji: '🖼️'
          },
          {
            label: 'Font to Byte Array',
            description: 'Convert fonts to byte arrays',
            value: 'font_conversion',
            emoji: '🔤'
          },
          {
            label: 'Source Code Processing',
            description: 'Process and convert source code',
            value: 'source_processing',
            emoji: '💾'
          }
        ])
    );
}

export function createActionButtons() {
  return new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('proceed_selection')
        .setLabel('Proceed')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel('Close Ticket')
        .setStyle(ButtonStyle.Secondary)
    );
}

export function createAOBConversionEmbed() {
  return new EmbedBuilder()
    .setColor('#43B581')
    .setTitle('🔄 AOB ↔ Byte Conversion Tool')
    .setDescription('Send your AOB or Byte code and I\'ll convert it for you.')
    .addFields([
      {
        name: 'Instructions',
        value: '• Paste your AOB code (e.g., `48 89 5C 24 08`)\n• Or paste your Byte code (e.g., `0x48, 0x89, 0x5C`)\n• I\'ll automatically detect the format and convert it',
        inline: false
      }
    ])
    .setFooter({ text: 'Send your code in the next message' });
}

export function createFileUploadEmbed(type: 'image' | 'font') {
  const emoji = type === 'image' ? '🖼️' : '🔤';
  const title = type === 'image' ? 'Image to Byte Array Converter' : 'Font to Byte Array Converter';
  const extensions = type === 'image' ? 'JPG, PNG, GIF, BMP' : 'TTF, OTF';
  
  return new EmbedBuilder()
    .setColor(type === 'image' ? '#FF7A00' : '#9B59B6')
    .setTitle(`${emoji} ${title}`)
    .setDescription(`Upload your ${type} file and I'll convert it to a byte array.`)
    .addFields([
      {
        name: 'Supported Formats',
        value: extensions,
        inline: true
      },
      {
        name: 'Max File Size',
        value: '10MB',
        inline: true
      }
    ])
    .setFooter({ text: 'Upload your file in the next message' });
}

export function createConversionResultEmbed(result: string, type: string) {
  return new EmbedBuilder()
    .setColor('#43B581')
    .setTitle('✅ Conversion Complete!')
    .setDescription(`Your ${type} has been converted successfully.`)
    .addFields([
      {
        name: 'Result',
        value: `\`\`\`${result.length > 1000 ? result.substring(0, 1000) + '...' : result}\`\`\``,
        inline: false
      }
    ])
    .setFooter({ text: 'Use the buttons below to copy or download the result' });
}

export function createResultButtons() {
  return new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('copy_result')
        .setLabel('Copy Result')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📋'),
      new ButtonBuilder()
        .setCustomId('download_result')
        .setLabel('Download File')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('💾')
    );
}

export function createConversionButtons() {
  return new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('convert_aob_to_byte')
        .setLabel('AOB → Byte')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('➡️'),
      new ButtonBuilder()
        .setCustomId('convert_byte_to_aob')
        .setLabel('Byte → AOB')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('⬅️'),
      new ButtonBuilder()
        .setCustomId('clear_input')
        .setLabel('Clear')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🗑️')
    );
}
