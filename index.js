const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const config = require('./config.json');
const pikudHaoref = require('pikud-haoref-api');
const groupId = config.groupId;
var interval = 5000;

const client = new Client();

client.on('qr', (qrCode) => {
    qrcode.generate(qrCode, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp Web is ready!');
});

pikudHaoref.getActiveAlert(function (err, alert){
    setTimeout(poll, interval);
    if (err) {
        return console.log('Retrieving active alert failed: ', err);
    }
    console.log('Currently active alert:');

    console.log(alert);

    if(!JSON.parse(alert).type === 'none')
    {
        sendMessage(alert, groupId);
    }

    console.log();
});

function sendMessage(message, groupId){
    client.sendMessage(groupId, message + `\n היכנסו למרחב המוגן ושהו בו כ10 דקות!`);
    console.log('Message sent successfully to group:', groupId);
}   
client.initialize();
