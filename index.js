const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios').default;
const config = require('./config.json');

const url = 'https://www.oref.org.il/WarningMessages/alert/alerts.json';

const client = new Client();

client.on('qr', (qrCode) => {
    qrcode.generate(qrCode, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp Web is ready!');
    checkAlerts();
    setInterval(checkAlerts, 1500);
});

let prevId = '';

async function checkAlerts() {
    try {
        const response = await axios.get(url, {
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                Referer: 'https://www.oref.org.il/12481-he/Pakar.aspx',
            },
            maxContentLength: Infinity,
        });

        const json = response.data;
        const locations = json.data.join('\n');

        if (json.id !== prevId) {
            prevId = json.id;

            const message = `**${json.title}**\n${json.desc}\n\n**יישובים**\n${locations}`;

            // Find the group chat where you want to send the message using the group invite link or phone number
            const chat = await client.getChatById(config.GID);

            chat.sendMessage(message);
            console.log(`[${new Date()}] Sent message to the group!`);
        }
    } catch (error) {
        console.error(error);
    }
}

client.initialize();
