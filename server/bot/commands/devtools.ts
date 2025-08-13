import { SlashCommandBuilder } from 'discord.js';

export const devtoolsCommand = new SlashCommandBuilder()
  .setName('devtools')
  .setDescription('Access development tools for AOB/Byte conversion, image processing, and more');
