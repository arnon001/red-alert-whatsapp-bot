const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const config = require('./config.json');
const pikudHaoref = require('pikud-haoref-api');
const groupId = config.groupId;
var interval = 5000;

const client = new Client();

var alertCheck = "";
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

    const message = `${typeInHebrew(alert.type)}\n${alert.cities}\n${alert.instructions}`;

    client.sendMessage(groupId, message);
    console.log('Message sent successfully to group:', groupId);
}   

function typeInHebrew (type) {
    if(type = "missiles")
        return "ירי טילים ורקטות";
    else if (type = "radiologicalEvent")
        return "אירוע רדיולוגי";
    else if (type = "earthQuake")
        return "רעידת אדמה";
    else if (type = "tsunami")
        return "צונאמי";
    else if (type = "hostileAircraftIntrusion")
        return "חדירת כלי טייס עויינים";
    else if (type = "hazardousMaterials")
        return "חומרים מסוכנים";
    else if (type = "terroristInfiltration")
        return "חשש לחדירת מחבלים";
    else if (type = "missilesDrill")
        return "אימון של ירי טילים ורקטות";
    else if (type = "earthQuakeDrill")
        return "אימון של רעידת אדמה";
    else if (type = "radiologicalEventDrill")
        return "אימון של אירוע רדיולוגי";
    else if (type = "tsunamiDrill")
        return "אימון של צונאמי";
    else if (type = "hostileAircraftIntrusionDrill")
        return "אימון של חדירת כלי טיס עויינים";
    else if (type = "hazardousMaterialsDrill")
        return "אימון של חומרים מסוכנים";
    else if (type = "terroristInfiltrationDrill")
        return "אימון של חדירת מחבלים";
    return "לא ידוע";
}
client.initialize();
