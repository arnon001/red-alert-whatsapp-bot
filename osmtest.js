const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const pikudHaoref = require('pikud-haoref-api');
const fs = require('fs');
const { typeInHebrew } = require('./functions/typeInHebrew.js');
const { groupCities } = require('./functions/citiesTime.js');
const config = require('./config.json');
const puppeteer = require('puppeteer-extra');
const stealthPlugin = require('puppeteer-extra-plugin-stealth');
const L = require('leaflet')

puppeteer.use(stealthPlugin());

const groupId = config.sendToUser; // Replace with your group ID
const interval = 5000;

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
  setTimeout(poll, interval);

  pikudHaoref.getActiveAlert(function (err, alert) {
    if (err) {
      return console.log('Retrieving active alert failed: ', err);
    }

    const test = {
      type: 'missiles',
      cities: ['כיסופים', 'אופקים', 'בארי', 'נחל עוז'],
      instructions: 'היכנסו למבנה, נעלו את הדלתות וסגרו את החלונות',
    };
    sendMessage(test, groupId);

    console.log("Please stop the program now, or it'll keep sending messages to the user every 5 seconds");

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
  const groupedMarkers = {};

  markers.forEach(marker => {
    if (!groupedMarkers[marker.zone]) {
      groupedMarkers[marker.zone] = [];
    }
    groupedMarkers[marker.zone].push(marker);
  });

  function generateZoneCode(zone, zoneMarkers) {
    const decodedZone = decodeURIComponent(zone);
    const encodedMarkers = zoneMarkers.map(marker => ({
      lat: marker.lat,
      lng: marker.lng,
      city: marker.city,
    }));

    const bounds = zoneMarkers.reduce((acc, marker) => {
      acc.extend([marker.lat, marker.lng]);
      return acc;
    }, new L.LatLngBounds());

    return `
      var polygonPoints_${decodedZone} = ${JSON.stringify([[bounds.getNorth(), bounds.getWest()], [bounds.getNorth(), bounds.getEast()], [bounds.getSouth(), bounds.getEast()], [bounds.getSouth(), bounds.getWest()]])};
      var polygon_${decodedZone} = L.polygon(polygonPoints_${decodedZone}, { color: 'red', fillOpacity: 0.3 }).addTo(map);

      ${encodedMarkers.map(marker => {
        const cityArray = marker.city.split(' ');
        return `
          var marker_${decodedZone}_${cityArray.join('_')} = L.marker([${marker.lat}, ${marker.lng}]).addTo(map)
            .bindPopup('${cityArray.join(' ')}');
        `;
      }).join('')}
    `;
  }

  const zoneCodes = Object.entries(groupedMarkers).map(([zone, zoneMarkers]) => generateZoneCode(zone, zoneMarkers)).join('\n');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Leaflet Map</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
        <style>
          #map { height: 100vh; }
        </style>
      </head>
      <body style="margin: 0; padding: 0;">
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
        <script>
          var map = L.map('map').setView([${markers[0].lat}, ${markers[0].lng}], 13);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          ${zoneCodes}
        </script>
      </body>
    </html>
  `;

  const tempDirPath = `${__dirname}/temp`;
  if (!fs.existsSync(tempDirPath)) {
    fs.mkdirSync(tempDirPath);
  }

  const htmlFilePath = `${tempDirPath}/map.html`;
  fs.writeFileSync(htmlFilePath, htmlContent);

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`file://${htmlFilePath}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#map');
  await page.waitForTimeout(3000);

  const screenshotPath = `${tempDirPath}/map.png`;
  await page.screenshot({ path: screenshotPath });
  await browser.close();

  return screenshotPath;
}

async function sendLeafletMap(groupId, cities) {
  try {
    if (!cities || !Array.isArray(cities)) {
      console.error('Cities array is undefined or not an array');
      return;
    }

    const screenshotPath = await generateLeafletMap(cities);
    const imageBuffer = fs.readFileSync(screenshotPath);
    const media = new MessageMedia('image/png', imageBuffer.toString('base64'));
    await client.sendMessage(groupId, media, { sendMediaAsSticker: false });
  } catch (error) {
    console.error('Error fetching or sending map image:', error.message);
    throw error;
  }
}

async function sendMessage(alert, groupId) {
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

  const groupedCities = groupCities(alert.cities);

  let message = `*🔴 צבע אדום (${formattedDate} | ${formattedTime})*\n`;
  message += `סוג ההתרעה: ${typeInHebrew(alert.type)}\n`;

  message += `ערים וישובים:\n`;
  for (const [zone, cities] of Object.entries(groupedCities)) {
    message += `\n• ${zone}: ${cities.map(city => `${city.city}`).join(', ')} (${cities[0].time})\n`;
  }

  message += `\nהוראות: ${alert.instructions}`;

  client.sendMessage(groupId, message);

  const allCities = Object.values(groupedCities).flat();
  sendLeafletMap(groupId, allCities);
}

client.initialize();
