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
    poll();
});

var poll = function () {
    // Optional Israeli proxy if running outside Israeli borders

    // Get currently active alert
    // Example response:
    // { 
    //    type: 'missiles', 
    //    cities: ['תל אביב - מזרח', 'חיפה - כרמל ועיר תחתית', 'עין גדי'],
    //    instructions: 'היכנסו למבנה, נעלו את הדלתות וסגרו את החלונות'
    // }
    pikudHaoref.getActiveAlert(function (err, alert) {
        // Schedule polling in X millis
        setTimeout(poll, interval);
        
        // Log errors
        if (err) {
            return console.log('Retrieving active alert failed: ', err);
        }

        // Alert header
        console.log('Currently active alert:');

        // Log the alert (if any)
        console.log(alert);

        // Line break for readability
        console.log();

        
        if(!(JSON.parse(JSON.stringify(alert)).type === `none`))
        {
            sendMessage(alert, groupId);
        }

    });
}

function sendMessage(message, groupId){
    client.sendMessage(groupId, message + `\n היכנסו למרחב המוגן ושהו בו כ10 דקות!`);
    console.log('Message sent successfully to group:', groupId);
}   
client.initialize();
