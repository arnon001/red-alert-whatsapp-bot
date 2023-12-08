"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAlertsImage = void 0;
const staticmaps_1 = __importDefault(require("staticmaps"));
const lib_1 = require("../../magen_common_ts/src/lib");
const path_1 = __importDefault(require("path"));
const jimp_1 = __importDefault(require("jimp"));
const fs_1 = __importDefault(require("fs"));
function getAssetPath(asset) {
    return path_1.default.resolve(path_1.default.dirname(__filename), `assets/${asset}`);
}
function reverseCoordinates(coordinates) {
    for (let i = 0; i < coordinates.length; i++) {
        if (coordinates[i].length === 2) {
            coordinates[i] = [coordinates[i][1], coordinates[i][0]];
        }
        else {
            coordinates[i] = reverseCoordinates(coordinates[i]);
        }
    }
    return coordinates;
}
function getBoundingBox(alerts) {
    if (alerts.length === 0) {
        throw new Error('No alerts provided');
    }
    let minLat = alerts[0].city.lat;
    let maxLat = alerts[0].city.lat;
    let minLng = alerts[0].city.lng;
    let maxLng = alerts[0].city.lng;
    for (const alert of alerts) {
        const lat = alert.city.lat;
        const lng = alert.city.lng;
        if (lat < minLat) {
            minLat = lat;
        }
        else if (lat > maxLat) {
            maxLat = lat;
        }
        if (lng < minLng) {
            minLng = lng;
        }
        else if (lng > maxLng) {
            maxLng = lng;
        }
    }
    // Convert to [minLng, maxLng, minLat, maxLat] format
    return [minLng, maxLng, minLat, maxLat];
}
function calculateZoomLevel(boundaries, mapWidth, mapHeight) {
    const latDiff = boundaries.maxLat - boundaries.minLat;
    const lngDiff = boundaries.maxLng - boundaries.minLng;
    const latZoom = Math.log(360 / latDiff) / Math.LN2;
    const lngZoom = Math.log(360 / lngDiff) / Math.LN2;
    const zoom = Math.min(latZoom, lngZoom);
    // Adjust the zoom based on the map dimensions
    const mapDim = Math.max(mapWidth, mapHeight);
    const adjustedZoom = zoom - Math.log(mapDim / 256) / Math.LN2;
    return adjustedZoom;
}
function renderAlerts(alerts) {
    return __awaiter(this, void 0, void 0, function* () {
        const options = {
            width: 640,
            height: 530,
            tileSubdomains: "mt0,mt1,mt2,mt3".split(","),
            tileUrl: "https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=he",
            zoomRange: {
                max: 11,
                min: 7
            }
        };
        let map = new staticmaps_1.default(options);
        const cities = alerts.filter(a => { var _a; return ((_a = a.city) === null || _a === void 0 ? void 0 : _a.lng) !== undefined; }).map((a) => {
            let polygon = lib_1.polygonsJson === null || lib_1.polygonsJson === void 0 ? void 0 : lib_1.polygonsJson[a.city.id].slice();
            polygon = reverseCoordinates(polygon);
            return {
                coord: [a.city.lng, a.city.lat],
                polygon,
            };
        });
        const markerPath = getAssetPath("marker.svg");
        for (const city of cities) {
            const marker = {
                img: markerPath,
                offsetX: 13,
                offsetY: 43,
                coord: city.coord,
                drawHeight: 40,
                drawWidth: 40,
                height: 50,
                width: 50,
                resizeMode: "inside",
            };
            map.addMarker(marker);
            map.addPolygon({
                coords: city.polygon,
                color: "#FF0000",
                width: 3,
                fill: "#FF000060",
            });
        }
        // const boundaries = findBoundaries(alerts);
        //   const zoom = calculateZoomLevel(boundaries, 700, 700)
        const center = getBoundingBox(alerts);
        yield map.render(center);
        const buffer = map.image.image.buffer.slice(0);
        return buffer;
    });
}
function JimpRead(path) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            jimp_1.default.read(path, (err, value) => {
                if (err) {
                    reject(err);
                }
                resolve(value);
            });
        });
    });
}
function getAlertsImage(alerts) {
    return __awaiter(this, void 0, void 0, function* () {
        const filtered = alerts.filter(a => { var _a; return ((_a = a.city) === null || _a === void 0 ? void 0 : _a.lng) !== undefined; });
        const image = yield renderAlerts(filtered);
        const helloImage = yield JimpRead(image);
        const logo = yield JimpRead(getAssetPath('logo.png'));
        const google = yield JimpRead(getAssetPath('google.png'));
        const margin = 10; // Adjust this as needed
        const x = margin;
        const y = margin;
        // Resize the logo if needed (optional)
        logo.cover(80, 80); // Adjust the size as needed
        // Composite the logo onto the main image
        helloImage.composite(logo, x, y);
        const x1 = helloImage.bitmap.width - google.bitmap.width;
        const y1 = helloImage.bitmap.height - google.bitmap.height;
        // Composite the "google.png" onto the main image at the bottom right
        helloImage.composite(google, x1, y1);
        // Save the result as a new image
        return helloImage.getBufferAsync(jimp_1.default.AUTO);
    });
}
exports.getAlertsImage = getAlertsImage;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const alerts = [
            {
                is_test: false,
                name: "",
                timestamp: new Date(),
                city: lib_1.citiesJson === null || lib_1.citiesJson === void 0 ? void 0 : lib_1.citiesJson["ניצן"],
                threat: [],
            },
            {
                is_test: true,
                name: "",
                timestamp: new Date(),
                city: lib_1.citiesJson === null || lib_1.citiesJson === void 0 ? void 0 : lib_1.citiesJson["אזור תעשייה צפוני אשקלון"],
                threat: []
            }
        ];
        const alerts1 = [
            {
                is_test: false,
                name: "",
                timestamp: new Date(),
                city: lib_1.citiesJson === null || lib_1.citiesJson === void 0 ? void 0 : lib_1.citiesJson["ניצן"],
                threat: [],
            },
            {
                is_test: true,
                name: "",
                timestamp: new Date(),
                city: lib_1.citiesJson === null || lib_1.citiesJson === void 0 ? void 0 : lib_1.citiesJson["אזור תעשייה צפוני אשקלון"],
                threat: []
            }
        ];
        const image = yield getAlertsImage(alerts);
        fs_1.default.writeFileSync('test.png', image);
        yield new Promise(resolve => setTimeout(resolve, 5000));
        // await getAlertsImage(alerts1)
        const image1 = yield getAlertsImage(alerts1);
        fs_1.default.writeFileSync('test.png', image1);
    });
}
// main();
