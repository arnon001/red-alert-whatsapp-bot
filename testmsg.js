const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const pikudHaoref = require('pikud-haoref-api');
const config = require('./config.json');
const { typeInHebrew } = require('./functions/typeInHebrew.js');
const { groupCities } = require('./functions/citiesTime.js');
const { citiesJson } = require('./functions/checkPolygon.js');
const user = config.sendToUser
var interval = 5000;    


// Load the session data if it has been previously saved
// let sessionData;
// if (fs.existsSync(SESSION_FILE_PATH)) {
//   sessionData = JSON.parse(fs.readFileSync(SESSION_FILE_PATH, 'utf-8'));
// }

const client = new Client({
    authStrategy: new LocalAuth()
});
 

client.on('qr', (qrCode) => {
    qrcode.generate(qrCode, { small: true });
});
  
  
  client.on('ready', async () => {
    console.log('Red-Alerts Bot is ready!');
    poll();
  });
client.initialize();
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
        const test = {
            type: 'missiles',
            cities: ['זיקים', 'בארי', 'נחל עוז', 'קריית שמונה', 'מרגליות', 'חולון', 'אזור', 'בת-ים'],
            instructions: 'היכנסו למבנה, נעלו את הדלתות וסגרו את החלונות',
        };
        sendMessage(test, user);
        const image = getAlertsImage(citiesJson?.test.cities);
        console.log("Please stop the program now, or it'll keep sending messages to the user every 5 seconds");

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
    // const formattedDate = currentDate.toLocaleDateString('en-GB', {
    //   day: '2-digit',
    //   month: '2-digit',
    //   year: '2-digit',
    // });

    // const formattedTime = currentDate.toLocaleTimeString('en-GB', {
    //   hour: '2-digit',
    //   minute: '2-digit',
    //   second: '2-digit',
    // });

    // Group cities based on time and zone
    const groupedCities = groupCities(alert.cities);

    // Create the message
    let message = `*🔴 צבע אדום (${formattedDate} | ${formattedTime})*\n`;
    message += `סוג ההתרעה: ${typeInHebrew(alert.type)}\n`;

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

