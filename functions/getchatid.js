const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
  authStrategy: new LocalAuth()
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
