const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const SESSION_FILE_PATH = '../session.json';

// Load the session data if it has been previously saved
let sessionData;
if (fs.existsSync(SESSION_FILE_PATH)) {
  sessionData = JSON.parse(fs.readFileSync(SESSION_FILE_PATH, 'utf-8'));
}

const client = new Client({
  session: sessionData,
  authTimeoutMs: 60 * 1000, // Increase the authTimeout to 1 minute (default is 30 seconds)
  authStrategy: new LocalAuth({
    session: sessionData,
    sessionFile: SESSION_FILE_PATH,
  }),
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
