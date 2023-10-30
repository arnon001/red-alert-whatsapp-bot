const { Client } = require('whatsapp-web.js');

const client = new Client();

client.on('qr', (qrCode) => {
    qrcode.generate(qrCode, { small: true });
});

client.on('message', async message => {
    // Get the chat ID from where the message was sent
    const chatId = message.from;

    // Call your custom function or perform actions with the chat ID
    handleChatId(chatId);
});

client.initialize();

function handleChatId(chatId) {
    // Your custom logic here to handle the chat ID
    console.log('Message received from chat ID:', chatId);
}
