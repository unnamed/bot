import {Client} from 'discord.js';
import bl from 'bl';
import crypto from 'crypto';

import config from '../../config.js';
import {handleData} from './github.packet.receiver';
import {getApp} from '../server';


const webhookConfig = config.http.github;

// based on rvagg's github webhook handler: https://github.com/rvagg/github-webhook-handler
export async function start(client: Client) {
  const app = await getApp();

  app.post(webhookConfig.route, (req, res) => {

    function fail(message?) {
      if (message) {
        res.status(400).end(message);
      } else {
        res.status(400).end('Not Found');
      }
    }

    const signature: string = req.headers['x-hub-signature'] as string;
    const event: string = req.headers['x-github-event'] as string;

    if (!signature || !event || !req.headers['x-github-delivery']) {
      fail('signature, event and delivery are required headers!');
      return;
    }

    req.pipe(bl((err, data) => {

      if (err) {
        fail(err.message);
        return;
      }

      const sig = Buffer.from(signature);
      const signed = Buffer.from(
        `sha1=${crypto.createHmac('sha1', process.env.GITHUB_SECRET)
          .update(data)
          .digest('hex')}`
      );

      if (sig.length !== signed.length || !crypto.timingSafeEqual(sig, signed)) {
        fail('x-hub-signature doesn\'t match with data signature');
        return;
      }

      try {
        const dataJson = JSON.parse(data.toString());
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end('{"ok": true}');
        handleData(client, event, dataJson);
      } catch (e) {
        fail(e.message);
      }
    }));

  });
}
