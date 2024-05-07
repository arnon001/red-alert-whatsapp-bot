// const pikudHaorefCitiesTime = require('pikud-haoref-api/citiesArchive');
const pikudHaorefCitiesTime = require('pikud-haoref-api/cities.json');
function groupCities(cities) {
    const groupedCities = {};

    // Assuming each city has a time, zone, latitude, and longitude associated with it
    for (const city of cities) {
        const cityData = pikudHaorefCitiesTime.find((cityData) => cityData.value === city);
        const { time, zone, lat, lng } = cityData || { time: 'לא ידוע', zone: 'לא ידוע', lat: null, lng: null };

        if (!groupedCities[zone]) {
            groupedCities[zone] = [];
        }

        groupedCities[zone].push({ city, time, lat, lng });
    }

    return groupedCities;
}
module.exports = { groupCities };