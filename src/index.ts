// load environment variables
import path from 'path';
import {startIfCreated} from './http/server';
import {Client} from 'discord.js';
import logger from './log';
import config from './config.js';
import {start as startGitHubWebhook} from './http/github/github.webhook';
import {startResourcePackServer} from './http/resourcepack/resourcepack';

import loadListeners from './loader/listener.loader';
import loadCommands from './loader/command.loader';

require('dotenv').config();

process.env.ROOT_DIR_PATH = path.join(__dirname, '..');

const client = new Client();

client.on('ready', () => {
  logger.fine(`Logged in as ${client.user.tag}`);
});

loadListeners(client);
loadCommands();

(async () => {
  if (config.http.github.enabled) {
    await startGitHubWebhook(client);
  }
  if (config.http.resourcePack.enabled) {
    await startResourcePackServer(client);
  }
  await startIfCreated();
})().catch(console.error);


client.login(process.env.BOT_TOKEN)
  .catch(console.error);
