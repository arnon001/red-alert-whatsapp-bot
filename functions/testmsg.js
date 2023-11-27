const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const axios = require('axios');
const config = require('../config.json');
const { groupCities } = require('./citiesTime.js');
const groupId = config.sendToUser;
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
    const simualtion = {
        title: "ירי טילים ורקטות",
        data: ["נירים", "תל אביב - דרום העיר ויפו", "אילת", "משגב עם", "ירושלים - מערב", "ירושלים - דרום", "נחל עוז", "אופקים", "באר שבע - דרום"],
        desc: "היכנסו למרחב המוגן ושהו בו כ10 דקות."
    };
    sendMessage(simualtion, config.sendToUser)

    // Optional Israeli proxy if running outside Israeli borders

    // Get currently active alert from kore.co.il
    axios.get('https://www.kore.co.il/redAlert.json')
        .then(response => {
            const alert = response.data;

            // Schedule polling in X millis
            setTimeout(poll, interval);

            if (alertCheck !== alert.data) {
                sendMessage(alert, groupId);
                alertCheck = alert.data;
            }
            else if(alert == null)
            {
                alertCheck = "";
            }
        })
        .catch(error => {
            console.log('Retrieving active alert failed: ', error);
            // Schedule polling in X millis even if there's an error
            setTimeout(poll, interval);
        });
};  

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
    const groupedCities = groupCities(alert.data);

    // Create the message
    let message = `*🔴 צבע אדום (${formattedDate} | ${formattedTime})*\n`;
    message += `סוג ההתרעה: ${alert.title}\n`;

    // Add cities and towns
    message += `ערים וישובים:\n`;
    for (const [zone, cities] of Object.entries(groupedCities)) {
      message += `\n• ${zone}: ${cities.map(city => `${city.city}`).join(', ')} (${cities[0].time})\n`;
  }

    message += `\n${alert.desc}`;

    // Send the message
    client.sendMessage(groupId, message);
    console.log('Message sent successfully to group');
    console.log();
}
client.initialize();
