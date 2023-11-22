const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const pikudHaoref = require('pikud-haoref-api');
const fs = require('fs');
const { typeInHebrew } = require('./functions/typeInHebrew.js');
const { groupCities } = require('./functions/citiesTime.js');
const config = require('./config.json');
const puppeteer = require('puppeteer-extra');

const stealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(stealthPlugin());

const groupId = config.sendToUser; // Replace with your group ID
const interval = 5000;

// Load the session data if it has been previously saved

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

async function poll() {
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

    // Cymulate alert
    const test = {
      type: 'missiles',
      cities: ['כיסופים', 'אופקים', 'בארי', 'נחל עוז'],
      instructions: 'היכנסו למבנה, נעלו את הדלתות וסגרו את החלונות',
    };
    sendMessage(test, groupId);
    console.log("Please stop the program now, or it'll keep sending messages to the user every 5 seconds");
    // End of Cymulate

    // Line break for readability
    console.log();

    if (!(JSON.parse(JSON.stringify(alert)).type === `none`) && alertCheck !== alert) {
      sendMessage(alert, groupId);
      alertCheck = alert;
    } else if (JSON.parse(JSON.stringify(alert)).type === `none`) {
      alertCheck = "";
    }
  });
}

async function generateLeafletMap(markers) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Leaflet Map</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
      </head>
      <body style="margin: 0; padding: 0;">
        <div id="map" style="height: 100vh; width: 100%;"></div>
        <script>
          // Initialize the map
          var map = L.map('map').setView([${markers[0].lat}, ${markers[0].lng}], 9); // Adjust the zoom level

          // Add the OpenStreetMap tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          // Add markers to the map
          ${markers.map(marker => `
            L.marker([${marker.lat}, ${marker.lng}]).addTo(map)
              .bindPopup('${marker.city}');
          `).join('')}

          // Add polygons to surround the zone of the alarm
          var polygonPoints = [${markers.map(marker => `[${marker.lat}, ${marker.lng}]`).join(',')}];
          var polygon = L.polygon(polygonPoints, { color: 'red', fillOpacity: 0.3 }).addTo(map);
        </script>
      </body>
    </html>
  `;


  // Save the HTML content to a temporary file
  const tempDirPath = `${__dirname}/temp`;
  if (!fs.existsSync(tempDirPath)) {
    fs.mkdirSync(tempDirPath);
  }

  const htmlFilePath = `${tempDirPath}/map.html`;
  fs.writeFileSync(htmlFilePath, htmlContent);

  // Open the HTML file in Puppeteer
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`file://${htmlFilePath}`, { waitUntil: 'domcontentloaded' });

  // Wait for the map container to appear
  await page.waitForSelector('#map');

  // Wait for a short additional time to ensure the map is fully loaded
  await page.waitForTimeout(3000);

  // Capture a screenshot of the map
  const screenshotPath = `${tempDirPath}/map.png`;
  await page.screenshot({ path: screenshotPath });

  // Close the browser
  await browser.close();

  return screenshotPath;
}

async function sendLeafletMap(groupId, cities) {
  try {
    // Check if cities is defined and is an array
    if (!cities || !Array.isArray(cities)) {
      console.error('Cities array is undefined or not an array');
      return;
    }

    // Generate Leaflet map with markers
    const screenshotPath = await generateLeafletMap(cities);

    // Read the image data
    const imageBuffer = fs.readFileSync(screenshotPath);

    // Create a MessageMedia object with the image data
    const media = new MessageMedia('image/png', imageBuffer.toString('base64'));

    // Send the image as a media file with the city names as the caption
    await client.sendMessage(groupId, media, { sendMediaAsSticker: false });
  } catch (error) {
    console.error('Error fetching or sending map image:', error.message);
    throw error;
  }
}

async function sendMessage(alert, groupId) {
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

  // Group cities based on time and zone using your existing function
  const groupedCities = groupCities(alert.cities);

  // Create the message
  let message = `*🔴 צבע אדום (${formattedDate} | ${formattedTime})*\n`;
  message += `סוג ההתרעה: ${typeInHebrew(alert.type)}\n`;

  // Add cities and towns with latitude and longitude
  message += `ערים וישובים:\n`;
  for (const [zone, cities] of Object.entries(groupedCities)) {
    message += `\n• ${zone}: ${cities.map(city => `${city.city}`).join(', ')} (${cities[0].time})\n`;
  }

  message += `\nהוראות: ${alert.instructions}`;

  // Send the message
  client.sendMessage(groupId, message);

  // Send the Leaflet map for the cities mentioned in the alert
  const allCities = Object.values(groupedCities).flat();
  sendLeafletMap(groupId, allCities);
}

client.initialize();
