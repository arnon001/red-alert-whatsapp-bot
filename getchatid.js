const { Client } = require('whatsapp-web.js');

const client = new Client();

client.on('qr', (qrCode) => {
    qrcode.generate(qrCode, { small: true });
});

client.on('message', async message => {
    // Get the chat ID from where the message was sent
    const chatId = notification.id.remote
    const groupChat = await client.getChatById(chatId)
    console.log(groupChat);
});

client.initialize();
