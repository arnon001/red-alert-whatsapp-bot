const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const wwebVersion = '2.2407.2';

const client = new Client({
  authStrategy: new LocalAuth(),

  webVersionCache: {
    type: 'remote',
    remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/${wwebVersion}.html`,
  }
});

client.on('qr', (qrCode) => {
    qrcode.generate(qrCode, { small: true });
});

client.on('message', async (notification) => {
    // Get the chat ID from where the message was sent
    const chatId = notification.id.remote
    const groupChat = await client.getChatById(chatId)
    console.log(groupChat);
});

client.initialize();
