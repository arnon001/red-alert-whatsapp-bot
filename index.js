const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const pikudHaoref = require('pikud-haoref-api');
const fs = require('fs');
const { typeInHebrew } = require('./functions/typeInHebrew.js');
const config = require('./config.json');
const { groupCities } = require('./functions/citiesTime.js');
const groupId = config.groupId;
var interval = 5000;


const client = new Client({
  authStrategy: new LocalAuth()
});

var alertCheck = "";
client.on('qr', (qrCode) => {
    qrcode.generate(qrCode, { small: true });
});
  
  
  client.on('ready', async () => {
    console.log('Red-Alerts Bot is ready!');
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

        // Line break for readability
        console.log();

        
        if(!(JSON.parse(JSON.stringify(alert)).type === `none`) && alertCheck !== alert)
        {
            sendMessage(alert, groupId);
            alertCheck = alert;
        }
        else if (JSON.parse(JSON.stringify(alert)).type === `none`)
        {
            alertCheck = "";
        }
    });
}  

function sendMessage(alert, groupId) {
    // Get current date and time
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });

    const formattedTime = currentDate.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    // Group cities based on time and zone
    const groupedCities = groupCities(alert.cities);

    // Create the message
    let message = `*🔴 צבע אדום (${formattedDate} | ${formattedTime})*\n`;
    message += `סוג ההתראה: ${typeInHebrew(alert.type)}\n`;

    // Add cities and towns
    message += `ערים וישובים:\n`;
    for (const [zone, cities] of Object.entries(groupedCities)) {
        message += `\n• ${zone}: ${cities.map(city => `${city.city}`).join(', ')} (${cities[0].time})\n`;
    }

    message += `\n${alert.instructions}`;

    // Send the message
    client.sendMessage(groupId, message);
    console.log('Message sent successfully to group');
}
client.initialize();
